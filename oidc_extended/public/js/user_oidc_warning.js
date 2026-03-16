frappe.ui.form.on("User", {
  refresh(frm) {
    if (frm.doc.name !== "Administrator") {
      const warning_msg = __(
        "Roles and module profiles of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login."
      );

      frm.set_intro(warning_msg, "orange");

      // Disable profile editing fields visually
      if (frm.fields_dict.roles) {
          frm.set_df_property("roles", "read_only", 1);
      }
      if (frm.fields_dict.role_profiles) {
          frm.set_df_property("role_profiles", "read_only", 1);
      }
      if (frm.fields_dict.module_profile) {
          frm.set_df_property("module_profile", "read_only", 1);
      }
      if (frm.fields_dict.block_modules) {
          frm.set_df_property("block_modules", "read_only", 1);
      }
    }
  },
});
