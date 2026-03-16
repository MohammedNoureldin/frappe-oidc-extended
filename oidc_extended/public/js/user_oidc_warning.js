console.log("!!! OIDC EXTENDED FLAG: SCRIPT LOADED SUCESSFULLY !!!");

frappe.ui.form.on("User", {
  refresh(frm) {
    if (frm.doc.name !== "Administrator") {
      const warning_msg = __(
        "Roles and module profiles of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login."
      );

      // Wait a moment for standard user.js to finish painting all of its custom grids
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
        
        // 2. Lock the fields at the ROOT control level (.frappe-control)
        const lock_field = (fieldname) => {
            // Using .$wrapper (JQuery object of the whole control) instead of .wrapper (just the input area)
            // This guarantees we capture the Label header, the "Select All" buttons, and the Inputs.
            if (frm.fields_dict[fieldname] && frm.fields_dict[fieldname].$wrapper) {
                let $control = frm.fields_dict[fieldname].$wrapper;
                
                // pointer-events: none physically prevents ALL mouse interaction.
                // Links, buttons, checkboxes, and input fields inside will ignore clicks entirely.
                // We don't modify the inner DOM layer, avoiding broken Frappe UI logic!
                $control.css({
                    "pointer-events": "none",
                    "opacity": "0.6"
                });
            }
        };

        lock_field("role_profiles");
        lock_field("roles");
        lock_field("module_profile");
        lock_field("block_modules");

      }, 800); // 800ms delay guarantees Frappe is completely finished initializing
    }
  },
});
