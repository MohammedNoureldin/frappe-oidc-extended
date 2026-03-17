console.log("!!! OIDC EXTENDED FLAG: SCRIPT LOADED SUCESSFULLY !!!");

frappe.ui.form.on("User", {
  refresh(frm) {
    if (frm.doc.name !== "Administrator") {
      const warning_msg = __(
        "Roles and module profiles of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login."
      );

      // 1. Inject pure CSS to visually lock the fields and hide the 'Select All' links forever.
      // This is 100% reliable as it avoids Javascript DOM conflicts entirely.
      if (!document.getElementById("oidc-user-lock-css")) {
        $(`<style id="oidc-user-lock-css">
            /* Completely lock all 4 fields mathematically from mouse clicks */
            div[data-fieldname="role_profiles"],
            div[data-fieldname="module_profile"],
            div[data-fieldname="roles"],
            div[data-fieldname="block_modules"] {
                pointer-events: none !important;
                opacity: 0.6 !important;
                user-select: none !important;
            }
            /* Explicitly erase the Select All / Unselect All buttons so they are completely gone */
            div[data-fieldname="roles"] a,
            div[data-fieldname="block_modules"] a {
                display: none !important;
            }
        </style>`).appendTo("head");
      }

      // Wait a moment for standard user.js to finish painting all of its custom grids
      setTimeout(() => {
        let $roles_wrapper = frm.fields_dict.roles ? $(frm.fields_dict.roles.wrapper) : null;
        
        // 2. Inject warning at the VERY TOP of the Roles Section
        if ($roles_wrapper) {
            let $section = $roles_wrapper.closest('.form-section');
            if ($section.length && $section.find('.oidc-section-warning').length === 0) {
                // Prepend completely to the section form-body so it spans full width
                $(`<div class="alert alert-warning oidc-section-warning" style="margin: 15px;">
                    <strong><i class="fa fa-exclamation-triangle"></i> ${warning_msg}</strong>
                   </div>`).prependTo($section);
            }
        }
      }, 800);
    }
  },
});
