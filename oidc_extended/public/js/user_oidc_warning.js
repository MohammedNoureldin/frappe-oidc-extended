console.log("!!! OIDC EXTENDED FLAG: SCRIPT LOADED SUCESSFULLY !!!");

frappe.ui.form.on("User", {
  refresh(frm) {
    if (frm.doc.name !== "Administrator") {
      const warning_msg = __(
        "Roles and module profiles of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login."
      );

      // Wait slightly for Frappe's standard user.js to finish painting custom HTML
      setTimeout(() => {
        const add_warning_to_field = (fieldname) => {
          if (frm.fields_dict[fieldname] && frm.fields_dict[fieldname].wrapper) {
            let $wrapper = $(frm.fields_dict[fieldname].wrapper);
            // Prevent duplicate warnings if refreshed
            if ($wrapper.find('.oidc-warning').length === 0) {
              $(`<div class="alert alert-warning oidc-warning" style="margin-bottom: 10px;">
                  <strong><i class="fa fa-exclamation-triangle"></i> ${warning_msg}</strong>
                 </div>`).prependTo($wrapper);
            }
          }
        };

        // 1. Inject the yellow warning directly inside the sections
        add_warning_to_field("role_profiles");  // Top of Roles Section
        add_warning_to_field("module_profile"); // Top of Modules Section

        // 2. Lock the fields
        const managed_fields = ["roles", "role_profiles", "module_profile", "block_modules"];
        managed_fields.forEach((fieldname) => {
          frm.set_df_property(fieldname, "read_only", 1);
          
          // Force disable the checkboxes (Catch Frappe 16's custom HTML)
          if (frm.fields_dict[fieldname] && frm.fields_dict[fieldname].wrapper) {
            $(frm.fields_dict[fieldname].wrapper).find("input").prop("disabled", true);
          }
        });

      }, 500);
    }
  },
});
