console.log("!!! OIDC EXTENDED FLAG: SCRIPT LOADED SUCESSFULLY !!!");

frappe.ui.form.on("User", {
  refresh(frm) {
    if (frm.doc.name !== "Administrator") {
      const warning_msg = __(
        "Roles and module profiles of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login."
      );

      // Wait slightly for Frappe's standard user.js to finish painting custom HTML
      setTimeout(() => {
        
        // 1. Inject a SINGLE, full-width warning at the absolute top of the Roles section
        if (frm.fields_dict.roles && frm.fields_dict.roles.wrapper) {
          // Find the parent section-body to ensure it gets full 100% uncompressed width
          let $sectionBody = $(frm.fields_dict.roles.wrapper).closest('.section-body');
          if ($sectionBody.length === 0) {
            $sectionBody = $(frm.fields_dict.roles.wrapper).closest('.form-section');
          }
          
          if ($sectionBody.length && $sectionBody.find('.oidc-section-warning').length === 0) {
            $(`<div class="alert alert-warning oidc-section-warning" style="margin: 0 15px 15px 15px; grid-column: 1 / -1; width: calc(100% - 30px);">
                <strong><i class="fa fa-exclamation-triangle"></i> ${warning_msg}</strong>
               </div>`).prependTo($sectionBody);
          }
        }

        // 2. Safely disable fields purely via DOM so they don't get hidden or squished
        // Notice we REMOVED set_df_property() because Frappe tends to completely hide MultiSelect and Tables when read_only=1
        const lock_wrapper = (fieldname) => {
          if (frm.fields_dict[fieldname] && frm.fields_dict[fieldname].wrapper) {
            let $wrapper = $(frm.fields_dict[fieldname].wrapper);
            
            // Disable native inputs and buttons
            $wrapper.find("input, select, button").prop("disabled", true);
            
            // Explicitly kill the "Select All" / "Deselect All" anchor tags
            $wrapper.find("a").addClass("disabled text-muted").css({
              "pointer-events": "none",
              "text-decoration": "none"
            });

            // Hide the little 'x' removal buttons on the role_profiles tags
            $wrapper.find(".btn-remove").hide();
            
            // Apply a brutal lock to everything inside the wrapper to guarantee 100% disabled state
            $wrapper.css({
              "pointer-events": "none",
              "opacity": "0.65",
              "user-select": "none"
            });
          }
        };

        lock_wrapper("roles");
        lock_wrapper("role_profiles");
        lock_wrapper("module_profile");
        lock_wrapper("block_modules");

      }, 500);
    }
  },
});
