namespace hopper {
	// Formspec.
	function get_hopper_formspec(pos: Vec3): string {
		const spos: string = hopper.get_string_pos(pos);
		return (
			"size[8,9]" +
			hopper.formspec_bg +
			"list[nodemeta:" +
			spos +
			";main;2,0.3;4,4;]" +
			hopper.get_eject_button_texts(pos, 7, 2) +
			"list[current_player;main;0,4.85;8,1;]" +
			"list[current_player;main;0,6.08;8,3;8]" +
			"listring[nodemeta:" +
			spos +
			";main]" +
			"listring[current_player;main]"
		);
	}

	function hopper_on_place(
		itemstack: ItemStackObject,
		placer: ObjectRef,
		pointed_thing: PointedThing,
		node_name: string
	) {
		if (pointed_thing.type == PointedThingType.object) {
			return;
		}
		const pos: Vec3 | undefined = pointed_thing.under;
		const pos2: Vec3 | undefined = pointed_thing.above;

		if (pos == null || pos2 == null) {
			throw new Error("engine issue?");
		}
		const x: number = pos.x - pos2.x;
		const z: number = pos.z - pos2.z;
		let returned_stack;
		let success;
		// Unfortunately param2 overrides are needed for side hoppers even in the non-single-craftable-item case
		// because they are literally *side* hoppers - their spouts point to the side rather than to the front, so
		// the default item_place_node orientation code will not orient them pointing toward the selected surface.

		if (
			x == -1 &&
			(hopper.config.single_craftable_item ||
				node_name == "crafter_hopper:hopper_side")
		) {
			[returned_stack, success] = core.item_place_node(
				ItemStack("crafter_hopper:hopper_side"),
				placer,
				pointed_thing,
				0
			);
		} else if (
			x == 1 &&
			(hopper.config.single_craftable_item ||
				node_name == "crafter_hopper:hopper_side")
		) {
			[returned_stack, success] = core.item_place_node(
				ItemStack("crafter_hopper:hopper_side"),
				placer,
				pointed_thing,
				2
			);
		} else if (
			z == -1 &&
			(hopper.config.single_craftable_item ||
				node_name == "crafter_hopper:hopper_side")
		) {
			[returned_stack, success] = core.item_place_node(
				ItemStack("crafter_hopper:hopper_side"),
				placer,
				pointed_thing,
				3
			);
		} else if (
			z == 1 &&
			(hopper.config.single_craftable_item ||
				node_name == "crafter_hopper:hopper_side")
		) {
			[returned_stack, success] = core.item_place_node(
				ItemStack("crafter_hopper:hopper_side"),
				placer,
				pointed_thing,
				1
			);
		} else {
			if (hopper.config.single_craftable_item) {
				// For cases where single_craftable_item was set on an existing world and there are still side hoppers in player inventories.
				node_name = "crafter_hopper:hopper";
			}
			[returned_stack, success] = core.item_place_node(
				ItemStack(node_name),
				placer,
				pointed_thing
			);
		}
		if (success) {
			const meta: MetaRef = core.get_meta(pos2);
			meta.set_string("placer", placer.get_player_name());
			if (!core.settings.get_bool("creative_mode")) {
				itemstack.take_item();
			}
		}
		return itemstack;
	}

	// Hoppers
	core.register_node("crafter_hopper:hopper", {
		drop: "crafter_hopper:hopper",
		description: "Hopper",
		groups: { stone: 1, hard: 1, pickaxe: 1, hand: 4, pathable: 1 },
		sounds: hopper.metal_sounds,
		drawtype: Drawtype.nodebox,
		paramtype: ParamType1.light,
		paramtype2: ParamType2.facedir,
		tiles: [
			"hopper_top_16.png",
			"hopper_top_16.png",
			"hopper_front_16.png",
		],
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				//funnel walls
				[-0.5, 0.0, 0.4, 0.5, 0.5, 0.5],
				[0.4, 0.0, -0.5, 0.5, 0.5, 0.5],
				[-0.5, 0.0, -0.5, -0.4, 0.5, 0.5],
				[-0.5, 0.0, -0.5, 0.5, 0.5, -0.4],
				//funnel base
				[-0.5, 0.0, -0.5, 0.5, 0.1, 0.5],
				//spout
				[-0.3, -0.3, -0.3, 0.3, 0.0, 0.3],
				[-0.15, -0.3, -0.15, 0.15, -0.7, 0.15],
			],
		},
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				//funnel
				[-0.5, 0.0, -0.5, 0.5, 0.5, 0.5],
				//spout
				[-0.3, -0.3, -0.3, 0.3, 0.0, 0.3],
				[-0.15, -0.3, -0.15, 0.15, -0.7, 0.15],
			],
		},

		on_construct: (pos) => {
			const inv: InvRef = core.get_meta(pos).get_inventory();
			inv.set_size("main", 4 * 4);
		},

		on_place: (itemstack, placer, pointed_thing) => {
			return hopper_on_place(
				itemstack,
				placer,
				pointed_thing,
				"crafter_hopper:hopper"
			);
		},

		can_dig: (pos: Vec3, player: ObjectRef) => {
			const inv: InvRef = core.get_meta(pos).get_inventory();
			return inv.is_empty("main");
		},

		on_rightclick: (pos, node, clicker, itemstack) => {
			if (
				core.is_protected(pos, clicker.get_player_name()) &&
				!core.check_player_privs(clicker, "protection_bypass")
			) {
				return;
			}
			core.show_formspec(
				clicker.get_player_name(),
				"hopper_formspec:" + core.pos_to_string(pos),
				get_hopper_formspec(pos)
			);
		},
	});

	const hopper_side_drop: string = "crafter_hopper:hopper";
	const hopper_groups: Dictionary<string, number> = {
		cracky: 3,
		not_in_creative_inventory: 1,
	};

	core.register_node("crafter_hopper:hopper_side", {
		description: "Side Hopper",
		drop: hopper_side_drop,
		groups: { stone: 1, hard: 1, pickaxe: 1, hand: 4, pathable: 1 },
		sounds: hopper.metal_sounds,
		drawtype: Drawtype.nodebox,
		paramtype: ParamType1.light,
		paramtype2: ParamType2.facedir,
		// 	tiles : {
		// 		"hopper_top_16.png",
		// 		"hopper_bottom_16.png",
		// 		"hopper_back_16.png",
		// 		"hopper_side_16.png",
		// 		"hopper_back_16.png",
		// 		"hopper_back_16.png"
		// 	},
		// 	node_box : {
		// 		type : "fixed",
		// 		fixed : {
		// 			//funnel walls
		// 			{-0.5, 0.0, 0.4, 0.5, 0.5, 0.5},
		// 			{0.4, 0.0, -0.5, 0.5, 0.5, 0.5},
		// 			{-0.5, 0.0, -0.5, -0.4, 0.5, 0.5},
		// 			{-0.5, 0.0, -0.5, 0.5, 0.5, -0.4},
		// 			//funnel base
		// 			{-0.5, 0.0, -0.5, 0.5, 0.1, 0.5},
		// 			//spout
		// 			{-0.3, -0.3, -0.3, 0.3, 0.0, 0.3},
		// 			{-0.7, -0.3, -0.15, 0.15, 0.0, 0.15},
		// 		},
		// 	},
		// 	selection_box : {
		// 		type : "fixed",
		// 		fixed : {
		// 			//funnel
		// 			{-0.5, 0.0, -0.5, 0.5, 0.5, 0.5},
		// 			//spout
		// 			{-0.3, -0.3, -0.3, 0.3, 0.0, 0.3},
		// 			{-0.7, -0.3, -0.15, 0.15, 0.0, 0.15},
		// 		},
		// 	},
		// 	on_construct = function(pos)
		// 		local inv = core.get_meta(pos):get_inventory()
		// 		inv:set_size("main", 4*4)
		// 	end,
		// 	on_place = function(itemstack, placer, pointed_thing)
		// 		return hopper_on_place(itemstack, placer, pointed_thing, "crafter_hopper:hopper_side")
		// 	end,
		// 	can_dig = function(pos,player)
		// 		local inv = core.get_meta(pos):get_inventory()
		// 		return inv:is_empty("main")
		// 	end,
		// 	on_rightclick = function(pos, node, clicker, itemstack)
		// 		if core.is_protected(pos, clicker:get_player_name()) and not core.check_player_privs(clicker, "protection_bypass") then
		// 			return
		// 		end
		// 		core.show_formspec(clicker:get_player_name(),
		// 			"hopper_formspec:"+core.pos_to_string(pos), get_hopper_formspec(pos))
		// 	end,
	});
}
