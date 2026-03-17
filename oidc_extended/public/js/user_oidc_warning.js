frappe.ui.form.on("User", {
	refresh(frm) {
		if (frm.doc.name === "Administrator") return;

		// Delay ensures Frappe's custom user.js has finished rendering grids
		setTimeout(() => {
			
			// 1. Show Warning Banner at the top of the Roles Section
			let roles_ctrl = frm.fields_dict.roles;
			if (roles_ctrl && roles_ctrl.wrapper) {
				let $section = $(roles_ctrl.wrapper).closest('.form-section');
				
				if ($section.find('.oidc-warning-banner').length === 0) {
					const msg = __("Roles and module profiles of this user are managed by OIDC. Any manual changes made here will be overwritten upon the user's next login.");
					$section.prepend(`
						<div class="alert alert-warning oidc-warning-banner" style="margin: 15px;">
							<strong><i class="fa fa-exclamation-triangle"></i> ${msg}</strong>
						</div>
					`);
				}
			}

			// 2. Visually disable Profile Fields
			["role_profiles", "module_profile"].forEach(field => {
				let ctrl = frm.fields_dict[field];
				if (ctrl && ctrl.$wrapper) {
					ctrl.$wrapper.css({ "pointer-events": "none", "opacity": "0.6" });
				}
			});

			// 3. Hide the Frappe 16 bulk-select option buttons (Select All / Unselect All)
			["roles", "block_modules"].forEach(field => {
				let ctrl = frm.fields_dict[field];
				if (ctrl && ctrl.$wrapper) {
					ctrl.$wrapper.find('.bulk-select-options').hide();
				}
			});

		}, 500);
	}
});
