console.log("!!! OIDC EXTENDED FLAG: SCRIPT LOADED SUCESSFULLY !!!");

frappe.ui.form.on("User", {
  refresh(frm) {
    if (frm.doc.name !== "Administrator") {
      const warning_msg = __(
        "Roles and module profiles of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login."
      );

      // Use setTimeout to ensure our changes run AFTER Frappe's standard user.js finishes rendering its custom HTML
      setTimeout(() => {
        // Ensure the banner stays visible
        frm.set_intro(warning_msg, "orange");
        frm.dashboard.set_headline_alert(
          `<div class="text-orange"><b>Warning:</b> ${warning_msg}</div>`
        );

        // Frappe 16 uses custom HTML wrappers for the Roles checklist. 
        // Standard "read_only" df property is often ignored by these custom UI elements.
        // We force them to be visually locked and non-interactive using CSS and DOM manipulation.
        const managed_fields = ["roles", "role_profiles", "module_profile", "block_modules"];

        managed_fields.forEach((fieldname) => {
          // 1. Try standard Frappe read_only
          frm.set_df_property(fieldname, "read_only", 1);

          // 2. Force DOM-level disabled state (bulletproof for completely custom Frappe 16 UI)
          if (frm.fields_dict[fieldname] && frm.fields_dict[fieldname].wrapper) {
            let $wrapper = $(frm.fields_dict[fieldname].wrapper);
            $wrapper.find("input, select, button, textarea").prop("disabled", true);
            $wrapper.css({
              "pointer-events": "none",
              "opacity": "0.7"
            });
          }
        });
      }, 500);
    }
  },
});
