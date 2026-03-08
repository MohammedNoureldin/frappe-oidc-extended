// Copyright (c) 2023, Mohammed Noureldin and contributors
// For license information, please see license.txt

frappe.ui.form.on('OIDC Extended Configuration', {
    setup: function(frm) {
        let role_filter = function() {
            return {
                filters: {
					// Exclude 'All' and 'Guest' roles from the role selection, because selecting all enables all modules but does not grant access/roles.
                    name: ['not in', ['All', 'Guest']]
                }
            };
        };

        frm.set_query('role', 'default_roles', role_filter);
        frm.set_query('role', 'group_role_mappings', role_filter);
    }
});
