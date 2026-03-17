frappe.ui.form.on("User", {
	refresh(frm) {
		if (frm.doc.name === "Administrator") return;

		// Inject pure CSS to force elements to be locked or hidden.
		// Since Frappe redraws the DOM and checkboxes asynchronously, standard JS UI operations fail.
		if (!document.getElementById("oidc-user-lock-css")) {
			$(`<style id="oidc-user-lock-css">
				/* Lock the profile fields */
				div[data-fieldname="role_profiles"],
				div[data-fieldname="module_profile"] {
					pointer-events: none !important;
					opacity: 0.6 !important;
					user-select: none !important;
				}
				
				/* Permanently hide the Select All / Unselect All buttons */
				.bulk-select-options,
				button.select-all,
				button.deselect-all {
					display: none !important;
					visibility: hidden !important;
					pointer-events: none !important;
				}
			</style>`).appendTo("head");
		}

		// Delay ensures the DOM wrapper is ready before we inject the banner div
		setTimeout(() => {
			// Show Warning Banner at the top of the Roles Section
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
		}, 500);
	}
});
