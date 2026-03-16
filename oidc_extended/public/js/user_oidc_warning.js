frappe.ui.form.on("User", {
  refresh(frm) {
    frappe.db
      .get_list("OIDC Extended Configuration", {
        limit: 1,
      })
      .then((records) => {
        if (records && records.length > 0) {
          const is_admin = frm.doc.name === "Administrator";
          if (!is_admin) {
            const warning_msg = __(
              "Roles and modules of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login.",
            );

            // Show warning securely within the Roles section
            let $roles_wrapper = frm.fields_dict.roles ? frm.fields_dict.roles.wrapper : null;
            let $role_profiles_wrapper = frm.fields_dict.role_profiles ? frm.fields_dict.role_profiles.wrapper : null;

            let add_warning_to_wrapper = ($wrapper) => {
              if ($wrapper && $wrapper.find(".oidc-warning").length === 0) {
                $(`<div class="alert alert-warning oidc-warning" style="margin-bottom: 10px;">
                    <strong><i class="fa fa-exclamation-triangle"></i> ${warning_msg}</strong>
                </div>`).prependTo($wrapper);
              }
            };

            add_warning_to_wrapper($roles_wrapper);
            add_warning_to_wrapper($role_profiles_wrapper);

            // Show warning inside Modules section (block_modules or module_profile depending on Frappe version)
            let $modules_wrapper = frm.fields_dict.block_modules ? frm.fields_dict.block_modules.wrapper : null;
            let $module_profile_wrapper = frm.fields_dict.module_profile ? frm.fields_dict.module_profile.wrapper : null;
            
            add_warning_to_wrapper($modules_wrapper);
            add_warning_to_wrapper($module_profile_wrapper);

            // Disable profiles editing visually
            if (frm.fields_dict.role_profiles) {
                frm.set_df_property("role_profiles", "read_only", 1);
            }
            if (frm.fields_dict.module_profile) {
                frm.set_df_property("module_profile", "read_only", 1);
            }
          }
        }
      });
  },
});
