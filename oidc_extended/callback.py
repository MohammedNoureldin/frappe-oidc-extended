# Readings:
# - https://github.com/frappe/frappe/blob/828490e01a3d14e1b0ac3385ea196c72ab2cc950/frappe/integrations/oauth2_logins.py
# - https://github.com/frappe/frappe/blob/828490e01a3d14e1b0ac3385ea196c72ab2cc950/frappe/utils/oauth.py
# - https://github.com/castlecraft/microsoft_integration/blob/main/microsoft_integration/callback.py

import json
import base64
import requests
import jwt

import frappe
import frappe.utils
from frappe import _ # For translations

frappe.utils.logger.set_log_level("INFO")
#frappe.utils.logger.set_log_level("DEBUG")

@frappe.whitelist(allow_guest=True)
def custom(code: str, state: str | dict):
    """Callback for processing the request received after a successful authentication in an identity provider (OIDC provider).

    OIDC redirect URL: /api/method/oidc_extended.callback.custom/<provider name>

    This extends the functionality of the current Social Login (OIDC) module. In addition to handling the authentication over OIDC, this:
    - Creates new user if does not exsit.
    - Maps groups from the claim of id token to ERPNext roles.
    """

    state = json.loads(base64.b64decode(state).decode("utf-8"))

    if not state or not state["token"]:
        frappe.respond_as_web_page(_("Invalid request"), _("Token is missing."), http_status_code=417)
        return

    request_path_components = frappe.request.path[1:].split("/")

    if not len(request_path_components) == 4 or not request_path_components[3]:
        frappe.respond_as_web_page(_("Invalid request"), _("The redirect URL is invalid."), http_status_code=417)
        return

    # Gets the name of the OIDC custom provider.
    provider_name = request_path_components[3]

    # Gets the document of the default Social Login (OIDC) configuration.
    social_login_provider = frappe.get_doc("Social Login Key", frappe.get_conf().get("custom", provider_name))
    user_id_claim_name = social_login_provider.user_id_property or "sub"

    # Gets the document of the extended OIDC configuration.
    oidc_extended_configuration = frappe.get_cached_doc('OIDC Extended Configuration', provider_name)
    given_name_claim_name = oidc_extended_configuration.given_name_claim_name or "given_name"
    family_name_claim_name = oidc_extended_configuration.family_name_claim_name or "family_name"
    email_claim_name = oidc_extended_configuration.email_claim_name or "email"
    groups_claim_name = oidc_extended_configuration.groups_claim_name or "groups"

    token_request_data = {
        "grant_type": "authorization_code",
        "client_id": social_login_provider.client_id,
        "client_secret": social_login_provider.get_password("client_secret"),
        "scope": json.loads(social_login_provider.auth_url_data).get("scope"),
        "code": code,
        "redirect_uri": frappe.utils.get_url(social_login_provider.redirect_url), # Combines ERPNext URL with redirect URL.
    }

    # Requests token from token endpoint.
    token_response = requests.post(
        url=social_login_provider.base_url + social_login_provider.access_token_url,
        data=token_request_data,
    ).json()

    id_token = jwt.decode(token_response["id_token"], audience="erpnext", options={"verify_signature": False})
    username = id_token[user_id_claim_name]

    if email_claim_name in id_token:
        email = id_token[email_claim_name]
    else:
        frappe.msgprint("The user must have an email address.", raise_exception=True)

    first_name = id_token.get(given_name_claim_name, "No first name")
    last_name = id_token.get(family_name_claim_name, "No last name")
    # The groups the user have as received in the token.
    groups = id_token.get(groups_claim_name, "")
    frappe.logger().debug(f"Groups of user {username}: {groups}")

    frappe.logger().debug(f"Current session user: {frappe.session.user}")

    # Creates the user if does not exsit, otherwise updates the data according to the claims of the token.
    if frappe.db.exists("User", {"username": username}):
        frappe.logger().info(f"The user {username} already exists.")

        # Prevents login with the "Administrator" user via OIDC.
        # Reason: If an OIDC provider returns groups that don't map to all
        # necessary admin roles, or if the mapping is not configured properly,
        # the role synchronization logic below would strip critical permissions
        # from this account, potentially locking administrators out of the system.
        # To prevent accidental privilege issues, the Administrator must only
        # authenticate through the local ERPNext login mechanism where roles are
        # managed directly.
        if username.lower() == "administrator":
            frappe.logger().warning(f"Attempted OIDC login with administrator account: {username}")
            frappe.respond_as_web_page(
                _("Not Allowed"),
                _("Login via OIDC is not permitted for the Administrator account. Please use the standard ERPNext login page."),
                http_status_code=403,
                indicator_color="orange",
                success=False,
                primary_action="/login",  # URL for primary action button
                primary_label="Go to Standard Login",  # Label for primary action button
            )
            return

        try:
            # Fetches the existing user.
            user = frappe.get_doc("User", username)
        except Exception as e:
            frappe.logger().error(f"Error fetching user: {str(e)}")
            frappe.logger().exception(e)
            raise
            
        frappe.logger().info(f"The existing user {username} fetched successfully.")
        frappe.logger().debug(f"The existing user data: {user.as_dict()}")
    else:
        # Creates a new user.
        frappe.logger().info(f"Creating a new Frappe user: {username}")

        user = frappe.get_doc(
            {
                "doctype": "User",
                "first_name": first_name,
                "last_name": last_name,
                "username": username,
                "email": email,
                "send_welcome_email": 0,
                "enabled": 1,
                "new_password": frappe.generate_hash(),
                "user_type": "System User"
            }
        )

        frappe.logger().info(f"New Frappe user {username} created successfully.")

        # Allows making changes on the user (like adding roles) by guest user.
        user.flags.ignore_permissions = True

        default_role = oidc_extended_configuration.default_role
        user.add_roles(default_role)

    if not user.enabled:
        frappe.logger().info(f"The user {username} is disabled.")
        frappe.respond_as_web_page(_("Not Allowed"), _("User {0} is disabled").format(user.username))
        return False

    if not user.get_social_login_userid(provider_name):
        frappe.logger().debug(f"set_social_login_userid for provider {provider_name} and user {username} called.")
        user.set_social_login_userid(provider_name, userid=username)

    # Allows all changes on the user in this code without checking if the operation is permitted to be done by the current user.
    frappe.logger().info(f"Allowing all changes on the user {username} without checking permissions.")
    user.flags.ignore_permissions = True

    # The roles the user should have, after mapping the groups received in the token.
    frappe.logger().debug(f"Mapping groups to roles for user {username}.")
    roles = [group_role_mapping.role for group_role_mapping in oidc_extended_configuration.group_role_mappings if group_role_mapping.group in groups]
    frappe.logger().debug(f"Frappe roles mapped from token groups of user {username}: {roles}")

    # The current roles of the user in Frappe.
    frappe.logger().debug(f"Current Frappe role docs of user {username}: {user.get('roles')}")
    current_roles = {doc.role for doc in user.get("roles")}
    frappe.logger().debug(f"Current Frappe roles of user {username}: {current_roles}")

    roles_to_remove = [role for role in current_roles if role not in roles]
    frappe.logger().debug(f"Roles to remove from user {username}: {roles_to_remove}")
    user.remove_roles(*roles_to_remove)

    roles_to_add = [role for role in roles if role not in current_roles]
    frappe.logger().debug(f"Roles to add to user {username}: {roles_to_add}")
    user.add_roles(*roles_to_add)

    user.save()

    frappe.local.login_manager.user = user.name
    frappe.local.login_manager.post_login()

    frappe.db.commit()

    redirect_post_login(
        desk_user=frappe.local.response.get("message") == "Logged In",
        redirect_to=state.get("redirect_to")
    )

def redirect_post_login(desk_user: bool, redirect_to: str):
    frappe.local.response["type"] = "redirect"

    if not redirect_to:
        desk_uri = "/app"
        redirect_to = frappe.utils.get_url(desk_uri if desk_user else "/me")

    frappe.local.response["location"] = redirect_to
