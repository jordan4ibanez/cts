namespace farming {
	// Quick definition of hoes.
	const __materials: string[] = ["wood", "stone", "iron", "gold", "diamond"];
	const construct: string[] = ["wood", "cobble", "iron", "gold", "diamond"];

	function till_soil(pos: Vec3): boolean {
		const nodey: string = core.get_node(pos).name;
		const is_dirt: boolean =
			nodey == "crafter:dirt" || nodey == "crafter:grass";
		if (is_dirt) {
			core.sound_play("dirt", { pos: pos });
			core.set_node(pos, { name: "crafter_farming:farmland_dry" });
			return true;
		}
		return false;
	}

	for (const [level, material] of pairs(__materials)) {
		if (typeof level != "number" || typeof material != "string") {
			throw new Error("How");
		}

		const wear: number = 100 * (6 - level);
		let groupcaps2: Dictionary<string, GroupCap> | undefined;
		let damage: number = 0;

		if (material == "wood") {
			groupcaps2 = {
				dirt: {
					times: { [1]: 0.4, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 59,
					maxlevel: 1,
				},
				snow: {
					times: { [1]: 0.4, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 59,
					maxlevel: 1,
				},
				grass: {
					times: { [1]: 0.45, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 59,
					maxlevel: 1,
				},
				sand: {
					times: { [1]: 0.4, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 59,
					maxlevel: 1,
				},
			};
			damage = 2.5;
		} else if (material == "stone") {
			groupcaps2 = {
				dirt: {
					times: { [1]: 0.2, [2]: 0.2, [3]: 1.5, [4]: 3, [5]: 6 },
					uses: 131,
					maxlevel: 1,
				},
				snow: {
					times: { [1]: 0.2, [2]: 0.2, [3]: 1.5, [4]: 3, [5]: 6 },
					uses: 131,
					maxlevel: 1,
				},
				grass: {
					times: { [1]: 0.25, [2]: 0.25, [3]: 1.5, [4]: 3, [5]: 6 },
					uses: 131,
					maxlevel: 1,
				},
				sand: {
					times: { [1]: 0.2, [2]: 0.2, [3]: 1.5, [4]: 3, [5]: 6 },
					uses: 131,
					maxlevel: 1,
				},
			};
			damage = 3.5;
		} else if (material == "iron") {
			groupcaps2 = {
				dirt: {
					times: {
						[1]: 0.15,
						[2]: 0.15,
						[3]: 0.15,
						[4]: 1.5,
						[5]: 3,
					},
					uses: 250,
					maxlevel: 1,
				},
				snow: {
					times: {
						[1]: 0.15,
						[2]: 0.15,
						[3]: 0.15,
						[4]: 1.5,
						[5]: 3,
					},
					uses: 250,
					maxlevel: 1,
				},
				grass: {
					times: {
						[1]: 0.15,
						[2]: 0.15,
						[3]: 0.15,
						[4]: 1.5,
						[5]: 3,
					},
					uses: 250,
					maxlevel: 1,
				},
				sand: {
					times: {
						[1]: 0.15,
						[2]: 0.15,
						[3]: 0.15,
						[4]: 1.5,
						[5]: 3,
					},
					uses: 250,
					maxlevel: 1,
				},
			};
			damage = 4.5;
		} else if (material == "gold") {
			groupcaps2 = {
				dirt: {
					times: { [1]: 0.1, [2]: 0.1, [3]: 0.1, [4]: 0.1, [5]: 1.5 },
					uses: 32,
					maxlevel: 1,
				},
				snow: {
					times: { [1]: 0.1, [2]: 0.1, [3]: 0.1, [4]: 0.1, [5]: 1.5 },
					uses: 32,
					maxlevel: 1,
				},
				grass: {
					times: { [1]: 0.1, [2]: 0.1, [3]: 0.1, [4]: 0.1, [5]: 1.5 },
					uses: 32,
					maxlevel: 1,
				},
				sand: {
					times: { [1]: 0.1, [2]: 0.1, [3]: 0.1, [4]: 0.1, [5]: 1.5 },
					uses: 32,
					maxlevel: 1,
				},
			};
			damage = 2.5;
		} else if (material == "diamond") {
			groupcaps2 = {
				dirt: {
					times: { [1]: 0.1, [2]: 0.1, [3]: 0.1, [4]: 0.1, [5]: 1.5 },
					uses: 1561,
					maxlevel: 1,
				},
				snow: {
					times: { [1]: 0.1, [2]: 0.1, [3]: 0.1, [4]: 0.1, [5]: 1.5 },
					uses: 1561,
					maxlevel: 1,
				},
				grass: {
					times: {
						[1]: 0.15,
						[2]: 0.15,
						[3]: 0.15,
						[4]: 0.15,
						[5]: 1.5,
					},
					uses: 1561,
					maxlevel: 1,
				},
				sand: {
					times: { [1]: 0.1, [2]: 0.1, [3]: 0.1, [4]: 0.1, [5]: 1.5 },
					uses: 1561,
					maxlevel: 1,
				},
			};
			damage = 5.5;
		}
		core.register_tool("crafter_farming:" + material + "hoe", {
			description: string.gsub(material, "^%l", string.upper)[0] + " Hoe",
			inventory_image: material + "hoe.png",
			tool_capabilities: {
				full_punch_interval: 0,
				//max_drop_level=0,
				groupcaps: groupcaps2,
				damage_groups: { damage: damage },
			},
			sound: { breaks: { name: "tool_break", gain: 0.4 } }, // todo: change this <- to what?
			groups: { flammable: 2, tool: 1 },
			on_place: (
				itemstack: ItemStackObject,
				placer: ObjectRef,
				pointed_thing: PointedThing
			) => {
				const nodeName: string = core.get_node(
					pointed_thing.under
				).name;
				const noddef: NodeDefinition | undefined =
					core.registered_nodes[nodeName];
				if (noddef == null) {
					core.log(
						LogLevel.warning,
						`Node [${nodeName}] is undefined.`
					);
					return;
				}
				const sneak: boolean = placer.get_player_control().sneak;

				if (!sneak && noddef.on_rightclick != null) {
					core.item_place(itemstack, placer, pointed_thing);
					return;
				}

				const tilled: boolean = till_soil(pointed_thing.under);
				if (tilled == true) {
					if (
						core.registered_nodes[
							core.get_node(
								vector.create3d(
									pointed_thing.under.x,
									pointed_thing.under.y + 1,
									pointed_thing.under.z
								)
							).name
						]?.buildable_to
					) {
						core.dig_node(
							vector.create3d(
								pointed_thing.under.x,
								pointed_thing.under.y + 1,
								pointed_thing.under.z
							)
						);
					}
					itemstack.add_wear(wear);
				}
				// 			local damage = itemstack:get_wear()
				// 			if damage <= 0 and tilled == true  then
				// 				core.sound_play("tool_break",{object=placer})
				// 			end
				// 			return(itemstack)
			},
		});
		// 	core.register_craft({
		// 		output = "crafter_farming:"+material+"hoe",
		// 		recipe = {
		// 			{"","crafter:"+construct[level], "crafter:"+construct[level]},
		// 			{"","crafter:stick", ""},
		// 			{"", "crafter:stick", ""}
		// 		}
		// 	})
		// 	core.register_craft({
		// 		output = "crafter_farming:"+material+"hoe",
		// 		recipe = {
		// 			{"crafter:"+construct[level],"crafter:"+construct[level], ""},
		// 			{"","crafter:stick", ""},
		// 			{"", "crafter:stick", ""}
		// 		}
		// 	})
	}
}
