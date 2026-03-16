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
        
        // 2. Lock the fields using a 100% reliable physical UI overlay
        // This avoids messing with Frappe's DOM, keeping values visible but strictly unclickable
        const lock_field = (fieldname) => {
            if (frm.fields_dict[fieldname] && frm.fields_dict[fieldname].wrapper) {
                let $wrapper = $(frm.fields_dict[fieldname].wrapper);
                
                // Ensure wrapper can hold an absolute positioned child
                if ($wrapper.css('position') === 'static' || $wrapper.css('position') === '') {
                    $wrapper.css('position', 'relative');
                }

                // Remove existing to avoid duplicates on refresh
                $wrapper.find('.oidc-lock-overlay').remove();

                // Append an invisible shield that blocks all clicks and grays out the area
                $('<div class="oidc-lock-overlay"></div>').css({
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'not-allowed'
                }).appendTo($wrapper);
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
