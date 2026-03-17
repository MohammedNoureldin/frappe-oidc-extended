## OIDC Extended

🚨 **BREAKING CHANGE:** This app has been refactored to natively use **Role Profiles** and **Module Profiles** instead of mapping individual Roles and Modules. When upgrading, you must recreate your mappings using Frappe Profiles. 🚨

An extension to the ERPNext Social Login authentication method (OIDC) that incorporates new features designed to meet the needs of enterprises.

Features:

- Group Multi-Mapping: natively assign multiple roles and modules by mapping OIDC *groups* to Frappe **Role Profiles** and **Module Profiles**.
- Customizable claim names.
- Specify the default Fallback Profiles (Role and Module) for users matching no specific groups.
- Automatically creates users from trusted identity providers even if signup is disabled in the site.

<img width="1001" height="1258" alt="image" src="https://github.com/user-attachments/assets/ffd51abb-82e1-4b99-940c-d24cfe88b548" />

#### *Social Login Key* Configuration

This app extends the functionality of Social Login Key, that is why it is important to configure the latter correctly to get this app work properly. Below is a simple functional configuration for Social Login Key module, which can be imported directly as a document in ERPNext.

```json
{
    "name": "keycloak",
    "enable_social_login": 1,
    "social_login_provider": "Custom",
    "client_id": "erpnext",
    "provider_name": "keycloak",
    "client_secret": "{{ erpnext_idp_client_secret }}",
    "icon": "",
    "base_url": "https://idp.{{ domain_name }}/realms/{{ keycloak_realm }}",
    "authorize_url": "/protocol/openid-connect/auth",
    "access_token_url": "/protocol/openid-connect/token",
    "redirect_url": "/api/method/oidc_extended.callback.custom/keycloak",
    "api_endpoint": "https://idp.{{ domain_name }}/realms/{{ keycloak_realm }}/protocol/openid-connect/userinfo",
    "custom_base_url": 1,
    "auth_url_data": "{\"response_type\": \"code\", \"scope\": \"openid profile email\"}",
    "user_id_property": "preferred_username",
    "doctype": "Social Login Key"
}
```

Notes:

- The last part of your `redirect_url` must match the name of the identity provider.
- Replace the `{{ variable }}`s with real values.

#### License

MIT
