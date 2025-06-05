namespace enchanting {
	/*
	swiftness - how fast you mine
	hardness - allows the tool to go way above it's level
	durable - makes the tool last longer
	slippery - you drop the tool randomly
	careful - "not silk touch"
	fortune - drops extra items and experience
	autorepair - tool will repair itself randomly
	spiky - the tool will randomly hurt you when used
	sharpness - the tool does more damage
	*/
	const enchantment_list: string[] = [
		"swiftness",
		"durable",
		"careful",
		"fortune",
		"autorepair",
		"sharpness",
	];
	const temp_names: string[] = [
		"Monster",
		"Behemoth",
		"Ultra",
		"Wow!",
		"Oh Em Gee",
		"The Ultimatum",
		"Holy Moly!",
		"Infinity",
	];
	const hexer: string[] = [
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"0",
	];
	core.register_node("crafter_enchanting:table", {
		description: "Enchanting Table",
		tiles: ["bedrock.png"], // todo: Bedrock??
		groups: { wood: 1, pathable: 1 },
		sounds: crafter.stoneSound(),
		is_ground_content: false,
		on_rightclick: (pos, node, clicker, itemstack, pointed_thing) => {
			core.after(
				0,
				(clicker: ObjectRef) => {
					if (!clicker.is_player()) {
						return;
					}
					const stack: ItemStackObject = clicker.get_wielded_item();
					const meta: MetaRef = stack.get_meta();
					if (meta.get_string("enchanted") == "true") {
						return;
					}
					if (core.registered_tools[itemstack.get_name()] == null) {
						return;
					}
					const tool_caps: ToolCapabilities =
						itemstack.get_tool_capabilities();
					const groupcaps: Dictionary<string, GroupCap> | undefined =
						tool_caps.groupcaps;
					if (groupcaps == null) {
						return;
					}
					const able_enchantments: string[] = [...enchantment_list];
					// todo: this depends on the crafter experience mod.
					let player_level: number = 100; //get_player_xp_level(clicker)
					let enchants_available: number = math.floor(
						player_level / 5
					);
					const max_enchant_level: number = math.floor(
						player_level / 5
					);
					if (enchants_available <= 0) {
						return;
					}
					if (enchants_available > 3) {
						enchants_available = 3;
					}
					const stock_name: string = stack.get_name();
					const rawToolDef: ItemDefinition | undefined =
						core.registered_tools[stock_name];
					if (rawToolDef == null) {
						return;
					}

					let description: string | undefined =
						rawToolDef.description; // temp_names[math.random(1,table.getn(temp_names))]

					for (const i of $range(1, enchants_available)) {
						const new_enchant: string =
							enchantment_list[
								math.random(0, enchantment_list.length - 1)
							];
						const level = math.random(1, max_enchant_level);
						if (meta.get_int(new_enchant) == 0) {
							player_level = player_level - 5;
							meta.set_int(new_enchant, level);
							description +=
								"\n" +
								string.gsub(
									new_enchant,
									"^%l",
									string.upper
								)[0] +
								": " +
								tostring(level);
							if (new_enchant == "swiftness") {
								for (const [name, table] of pairs(groupcaps)) {
									for (const [timeIndex, time] of pairs(
										table.times
									)) {
										const groupcaps:
											| Dictionary<string, GroupCap>
											| undefined = tool_caps.groupcaps;
										if (
											groupcaps == null ||
											groupcaps[name] == null
										) {
											core.log(
												LogLevel.warning,
												`Missing [${name}]`
											);
											continue;
										}

										groupcaps[name]!.times[timeIndex] =
											time / (level + 1);
									}
								}
							}

							if (new_enchant == "durable") {
								for (const [name, table] of pairs(groupcaps)) {
									const groupcaps:
										| Dictionary<string, GroupCap>
										| undefined = tool_caps.groupcaps;
									if (
										groupcaps == null ||
										groupcaps[name] == null ||
										table == null
									) {
										core.log(
											LogLevel.warning,
											`Missing [${name}]`
										);
										continue;
									}

									const use: number | undefined = table.uses;
									if (use == null) {
										core.log(
											LogLevel.warning,
											`Missing [${name}] use`
										);
										continue;
									}

									groupcaps[name].uses = use * (level + 1);
								}
							}
							if (new_enchant == "sharpness") {
								for (const [index, data] of pairs(
									tool_caps.damage_groups
								)) {
									const damage_groups:
										| Dictionary<number, number>
										| undefined = tool_caps.damage_groups;

									if (
										damage_groups == null ||
										damage_groups[index] == null ||
										table == null
									) {
										core.log(
											LogLevel.warning,
											`Missing [${index}]`
										);
										continue;
									}

									damage_groups[index] = data * (level + 1);
								}
							}
						}
					}
					meta.set_string("description", "Enchanted " + description);
					meta.set_string("enchanted", "true");
					meta.set_tool_capabilities(tool_caps);
					// todo: requires crafter experience
					// 			set_player_xp_level(clicker,player_level)

					// Create truly random hex.
					let colorstring: string = "#";
					for (const i of $range(1, 6)) {
						colorstring += hexer[math.random(0, hexer.length)];
					}

					clicker.set_wielded_item(
						ItemStack(
							core.itemstring_with_color(stack, colorstring)
						)
					);
				},
				clicker
			);
		},
	});

	core.register_craft({
		output: "crafter_enchanting:table",
		recipe: [
			["nether:obsidian", "nether:obsidian", "nether:obsidian"],
			["nether:obsidian", "main:diamond", "nether:obsidian"],
			["nether:obsidian", "nether:obsidian", "nether:obsidian"],
		],
	});
}
