namespace redstone {
	core.register_craftitem("crafter_redstone:dust", {
		description: "Redstone Dust",
		inventory_image: "redstone_dust_item.png",
		wield_image: "redstone_dust_item.png",
		wield_scale: vector.create3d({ x: 1, y: 1, z: 1 + 1 / 16 }),
		liquids_pointable: false,
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		) => {
			if (pointed_thing.type != PointedThingType.node) {
				return;
			}
			if (pointed_thing.under == null) {
				throw new Error("engine issue?");
			}
			const sneak = placer.get_player_control().sneak;
			const noddef: NodeDefinition | undefined =
				core.registered_nodes[core.get_node(pointed_thing.under).name];

			if (noddef == null) {
				core.log(
					LogLevel.error,
					`Undefined node at: ${pointed_thing.under}`
				);
				return;
			}
			if (!sneak && noddef.on_rightclick) {
				core.item_place(itemstack, placer, pointed_thing);
				return;
			}

			const [_, worked] = core.item_place(
				ItemStack("crafter_redstone:dust_0"),
				placer,
				pointed_thing
			);
			if (worked) {
				itemstack.take_item();
			}
			return itemstack;
		},
	});

	// Power levels [maxState - 1] being the highest.

	// local d_max = r_max-1

	for (const i of $range(0, maxState - 1)) {
		const color: number = math.floor(255 * (i / (maxState - 1)));

		core.register_node("crafter_redstone:dust_" + i, {
			description: "Redstone Dust",
			wield_image: "redstone_dust_item.png",
			tiles: [
				"redstone_dust_main.png^[colorize:red:" + color,
				"redstone_turn.png^[colorize:red:" + color,
				"redstone_t.png^[colorize:red:" + color,
				"redstone_cross.png^[colorize:red:" + color,
			],
			drawtype: Drawtype.raillike,
			paramtype: ParamType1.light,
			sunlight_propagates: true,
			is_ground_content: false,
			walkable: false,
			node_placement_prediction: "",
			selection_box: {
				type: Nodeboxtype.fixed,
				fixed: [-1 / 2, -1 / 2, -1 / 2, 1 / 2, -1 / 2 + 1 / 16, 1 / 2],
			},
			sounds: crafter.stoneSound(),
			groups: {
				dig_immediate: 1,
				attached_node: 1,
				redstone_dust: 1,
				redstone: 1,
				redstone_power: i,
			},
			drop: "crafter_redstone:dust",

			// 		on_construct = function(pos)
			// 			data_injection(pos,{dust=i})
			// 			//instruction_rebuild(pos)
			// 			calculate(pos)
			// 		end,
			// 		after_destruct = function(pos)
			// 			data_injection(pos,nil)
			// 			//instruction_rebuild(pos,true)
			// 			calculate(pos)
			// 		end,
			// 		connects_to = {"group:redstone"},
		});

		// 	core.register_lbm({
		//         name = "crafter_redstone:"+i,
		// 		nodenames = {"crafter_redstone:dust_"+i},
		// 		run_at_every_load = true,
		//         action = function(pos)
		// 			data_injection(pos,{dust=i})
		// 			//core.after(0,function()
		// 				//initial_instruction_build(pos)
		// 			//end)
		//         end,
		//     })
	}
}
