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
					const stack = clicker.get_wielded_item();
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
					// todo: this depends on the experience mod.
					const player_level: number = 100; //get_player_xp_level(clicker)
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

					const description: string | undefined =
						rawToolDef.description; // temp_names[math.random(1,table.getn(temp_names))]
                        
					// 			for i = 1,enchants_available do
					// 				local new_enchant = enchantment_list[math.random(1,table.getn(enchantment_list))]
					// 				local level = math.random(1,max_enchant_level)
					// 				if meta:get_int(new_enchant) == 0 then
					// 					player_level = player_level - 5
					// 					meta:set_int(new_enchant, level)
					// 					description = description.."\n"..new_enchant:gsub("^%l", string.upper)..": "..tostring(level)
					// 					if new_enchant == "swiftness" then
					// 						for index,table in pairs(groupcaps) do
					// 							for index2,time in pairs(table.times) do
					// 								tool_caps["groupcaps"][index]["times"][index2] = time/(level+1)
					// 							end
					// 						end
					// 					end
					// 					if new_enchant == "durable" then
					// 						for index,table in pairs(groupcaps) do
					// 							tool_caps["groupcaps"][index]["uses"] = table.uses*(level+1)
					// 						end
					// 					end
					// 					if new_enchant == "sharpness" then
					// 						for index,data in pairs(tool_caps.damage_groups) do
					// 							tool_caps.damage_groups[index] = data*(level+1)
					// 						end
					// 					end
					// 				end
					// 			end
					// 			meta:set_string("description", "Enchanted "..description)
					// 			meta:set_string("enchanted", "true")
					// 			meta:set_tool_capabilities(tool_caps)
					// 			set_player_xp_level(clicker,player_level)
					// 			//create truly random hex
					// 			local colorstring = "#"
					// 			for i = 1,6 do
					// 				colorstring = colorstring..hexer[math.random(1,16)]
					// 			end
					// 			stack = core.itemstring_with_color(stack, colorstring)
					// 			clicker:set_wielded_item(stack)
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
