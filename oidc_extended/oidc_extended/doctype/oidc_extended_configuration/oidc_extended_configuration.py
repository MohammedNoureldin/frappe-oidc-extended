# Copyright (c) 2023, Mohammed Noureldin and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class OIDCExtendedConfiguration(Document):
	def validate(self):
		self.validate_duplicate_module_groups()
		
	def validate_duplicate_module_groups(self):
		if not self.group_module_mappings:
			return
			
		seen_groups = set()
		for row in self.group_module_mappings:
			if row.group in seen_groups:
				frappe.throw(
					frappe._("Row {0}: The group '{1}' is already mapped. Module profiles only support a single mapping per group.").format(row.idx, row.group)
				)
			seen_groups.add(row.group)
