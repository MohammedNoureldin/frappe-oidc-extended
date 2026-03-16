console.log("!!! OIDC EXTENDED FLAG: SCRIPT LOADED SUCESSFULLY !!!");

frappe.ui.form.on("User", {
  refresh(frm) {
    if (frm.doc.name !== "Administrator") {
      const warning_msg = __(
        "Roles and module profiles of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login."
      );

      // Wait a moment for standard user.js to finish painting all of its custom grids
      setTimeout(() => {
        let $roles_wrapper = frm.fields_dict.roles ? $(frm.fields_dict.roles.wrapper) : null;
        
        // 1. Inject warning at the VERY TOP of the Roles Section
        if ($roles_wrapper) {
            let $section = $roles_wrapper.closest('.form-section');
            if ($section.length && $section.find('.oidc-section-warning').length === 0) {
                // Prepend completely to the section form-body so it spans full width
                $(`<div class="alert alert-warning oidc-section-warning" style="margin: 15px;">
                    <strong><i class="fa fa-exclamation-triangle"></i> ${warning_msg}</strong>
                   </div>`).prependTo($section);
            }
        }

        // 2. Simple locking mechanism for all 4 OIDC-controlled fields
        // We use pure CSS to block clicks and slightly dim them. 
        // We also explicitly hide the custom "Select All / Unselect All" links Frappe generates.
        ["module_profile", "role_profiles", "roles", "block_modules"].forEach(fieldname => {
            if (frm.fields_dict[fieldname] && frm.fields_dict[fieldname].$wrapper) {
                let $control = frm.fields_dict[fieldname].$wrapper;
                
                // CSS lock the whole block
                $control.css({
                    "pointer-events": "none",
                    "opacity": "0.6"
                });

                // Target the specific Select All / Unselect All links inside the custom grids and hide them
                // so they can't be tabbed to or clicked by accident
                $control.find('a').each(function() {
                    if ($(this).text().toLowerCase().includes('select')) {
                        $(this).hide();
                    }
                });
                
                // Also explicitly hide any standard buttons in those controls just in case
                $control.find('button').hide();
            }
        });

      }, 800); // 800ms delay guarantees Frappe is completely finished initializing
    }
  },
});
