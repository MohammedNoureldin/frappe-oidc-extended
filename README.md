## OIDC Extended

An extension to the ERPNext Social Login authentication method (OIDC) that incorporates new features designed to meet the needs of enterprises.

Features:

- Group to Role mapping: maps the received *groups* as token claim to ERPNext roles.
- Customizable claim names.
- Specify the default role for the users that haven't logged in yet.
- Automatically creates users from trusted identity providers even if signup is disabled in the site.

![image](https://github.com/MohammedNoureldin/frappe-oidc-extended/assets/14913147/e72cd642-efb5-4aab-a954-77c3744adab4)

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
