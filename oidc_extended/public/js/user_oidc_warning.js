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
            const notice_prefix = __("Notice:");

            // Set headline alert
            frm.dashboard.set_headline_alert(
              `<b>${notice_prefix}</b> ${warning_msg}`,
              "yellow",
            );

            // Show warning in Roles section
            let $roles_wrapper = frm.fields_dict.roles.wrapper;
            if ($roles_wrapper.find(".oidc-warning").length === 0) {
              $(`<div class="alert alert-warning oidc-warning" style="margin-bottom: 10px;">
<strong><i class="fa fa-exclamation-triangle"></i> ${warning_msg}</strong>
</div>`).prependTo($roles_wrapper);
            }

            // Show warning in Modules section
            let $modules_wrapper = frm.fields_dict.block_modules
              ? frm.fields_dict.block_modules.wrapper
              : null;
            if (
              $modules_wrapper &&
              $modules_wrapper.find(".oidc-warning").length === 0
            ) {
              $(`<div class="alert alert-warning oidc-warning" style="margin-bottom: 10px;">
<strong><i class="fa fa-exclamation-triangle"></i> ${warning_msg}</strong>
</div>`).prependTo($modules_wrapper);
            }

            // Optional: Disable changes entirely
            // frm.set_df_property('roles', 'read_only', 1);
            // if (frm.fields_dict.block_modules) {
            // frm.set_df_property('block_modules', 'read_only', 1);
            // }
          }
        }
      });
  },
});
