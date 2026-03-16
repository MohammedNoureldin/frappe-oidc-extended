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

        // 2. Simple locking mechanism ONLY for module_profile and role_profiles
        // We use pure CSS to block clicks and slightly dim them. 
        // This guarantees Frappe's inner HTML/data representation is completely untouched.
        ["module_profile", "role_profiles"].forEach(fieldname => {
            if (frm.fields_dict[fieldname] && frm.fields_dict[fieldname].$wrapper) {
                frm.fields_dict[fieldname].$wrapper.css({
                    "pointer-events": "none",
                    "opacity": "0.6"
                });
            }
        });

      }, 800); // 800ms delay guarantees Frappe is completely finished initializing
    }
  },
});
