const creative_mode: boolean = core.settings.get_bool("creative_mode") || false;

// Make stack max 1000 for everything
core.register_on_mods_loaded(() => {
	for (const [name, def] of pairs(core.registered_nodes)) {
		if (creative_mode == true) {
			const groups: Dictionary<string, number> | undefined = def.groups;
			if (groups != null) {
				groups["dig_immediate"] = 3;
			}
		}
		let stack_max: number | undefined =
			core.registered_items[name].stack_max;
		if (stack_max == null) {
			throw new Error("how");
		}
		if (stack_max == 99) {
			stack_max = 1000;
		}

		core.override_item(name as string, {
			stack_max: stack_max,
		});
	}

	for (const [name, _] of pairs(core.registered_craftitems)) {
		let stack_max: number | undefined =
			core.registered_items[name].stack_max;

		if (stack_max == null) {
			throw new Error("how");
		}
		if (stack_max == 99) {
			core.override_item(name as string, {
				stack_max: 1000,
			});
		}
	}
});
