namespace hopper {
	const inventoryName: string = "main";

	// todo: Maybe, implement these.
	// { neighborNode: "crafter_hopper:chute", inv: "main" },
	// { neighborNode: "crafter_hopper:sorter", inv: "main" },
	// { neighborNode: "crafter_hopper:chute", inv: "main" },
	// { neighborNode: "crafter_hopper:sorter", inv: "main" },

	/**
	 * top: The hopper is on top of the node.
	 * bottom: The hopper is below the node.
	 * side: The hopper is on the side of the node.
	 */
	interface ContainerData {
		top?: string;
		bottom?: string;
		side?: string;
	}

	const containers: Dictionary<string, ContainerData> = {
		["crafter_hopper:hopper"]: {
			top: "main",
			bottom: "main",
			side: "main",
		},
		["crafter_hopper:hopper_side"]: {
			side: "main",
		},
		["crafter_chest:chest"]: {
			top: "main",
			bottom: "main",
			side: "main",
		},
		["crafter_chest:chest_open"]: {
			top: "main",
			bottom: "main",
			side: "main",
		},
		["crafter_furnace:furnace"]: {
			top: "src",
			bottom: "dst",
			side: "fuel",
		},
		["crafter_furnace:furnace_active"]: {
			top: "src",
			bottom: "dst",
			side: "fuel",
		},
	};

	// Formspec.
	const formspec_bg: string =
		"background[-0.19,-0.25;9.41,9.49;gui_hb_bg.png]";

	function getStringPos(pos: Vec3): string {
		return `${pos.x},${pos.y},${pos.z}`;
	}
	function getHopperFormspec(pos: Vec3): string {
		const spos: string = getStringPos(pos);
		return (
			"size[8,9]" +
			formspec_bg +
			"list[nodemeta:" +
			spos +
			";main;2,0.3;4,4;]" +
			"list[current_player;main;0,4.85;8,1;]" +
			"list[current_player;main;0,6.08;8,3;8]" +
			"listring[nodemeta:" +
			spos +
			";main]" +
			"listring[current_player;main]"
		);
	}

	// function hopper_on_place(
	// 	itemstack: ItemStackObject,
	// 	placer: ObjectRef,
	// 	pointed_thing: PointedThing,
	// 	node_name: string
	// ) {
	// 	if (pointed_thing.type == PointedThingType.object) {
	// 		return;
	// 	}
	// 	const pos: Vec3 | undefined = pointed_thing.under;
	// 	const pos2: Vec3 | undefined = pointed_thing.above;
	// 	if (pos == null || pos2 == null) {
	// 		throw new Error("engine issue?");
	// 	}
	// 	const sneak: boolean = placer.get_player_control().sneak;
	// 	const noddef: NodeDefinition | undefined =
	// 		core.registered_nodes[core.get_node(pos).name];
	// 	if (!sneak && noddef?.on_rightclick) {
	// 		core.item_place(itemstack, placer, pointed_thing);
	// 		return;
	// 	}
	// 	const x: number = pos.x - pos2.x;
	// 	const z: number = pos.z - pos2.z;
	// 	let returned_stack;
	// 	let success;
	// 	// Unfortunately param2 overrides are needed for side hoppers even in the non-single-craftable-item case
	// 	// because they are literally *side* hoppers - their spouts point to the side rather than to the front, so
	// 	// the default item_place_node orientation code will not orient them pointing toward the selected surface.
	// 	if (x == -1 && node_name == "crafter_hopper:hopper_side") {
	// 		[returned_stack, success] = core.item_place_node(
	// 			ItemStack("crafter_hopper:hopper_side"),
	// 			placer,
	// 			pointed_thing,
	// 			0
	// 		);
	// 	} else if (x == 1 && node_name == "crafter_hopper:hopper_side") {
	// 		[returned_stack, success] = core.item_place_node(
	// 			ItemStack("crafter_hopper:hopper_side"),
	// 			placer,
	// 			pointed_thing,
	// 			2
	// 		);
	// 	} else if (z == -1 && node_name == "crafter_hopper:hopper_side") {
	// 		[returned_stack, success] = core.item_place_node(
	// 			ItemStack("crafter_hopper:hopper_side"),
	// 			placer,
	// 			pointed_thing,
	// 			3
	// 		);
	// 	} else if (z == 1 && node_name == "crafter_hopper:hopper_side") {
	// 		[returned_stack, success] = core.item_place_node(
	// 			ItemStack("crafter_hopper:hopper_side"),
	// 			placer,
	// 			pointed_thing,
	// 			1
	// 		);
	// 	} else {
	// 		// For cases where single_craftable_item was set on an existing world and there are still side hoppers in player inventories.
	// 		node_name = "crafter_hopper:hopper";
	// 		[returned_stack, success] = core.item_place_node(
	// 			ItemStack(node_name),
	// 			placer,
	// 			pointed_thing
	// 		);
	// 	}
	// 	if (success) {
	// 		const meta: MetaRef = core.get_meta(pos2);
	// 		meta.set_string("placer", placer.get_player_name());
	// 		if (!core.settings.get_bool("creative_mode")) {
	// 			itemstack.take_item();
	// 		}
	// 	}
	// 	return itemstack;
	// }

	function onTimer(pos: Vec3, elapsed: number): void {
		const inv: InvRef = core.get_meta(pos).get_inventory();
		if (inv.is_empty(inventoryName)) {
			return;
		}

		print("timer running.");

		timerTrigger(pos);
	}

	function onConstruct(pos: Vec3) {
		const inv: InvRef = core.get_meta(pos).get_inventory();
		inv.set_size("main", 4 * 4);
	}

	function timerTrigger(pos: Vec3): void {
		const timer: NodeTimerObject = core.get_node_timer(pos);
		if (timer.is_started()) {
			return;
		}
		timer.start(0.5);
	}

	const hopperGroups: Dictionary<string, number> = {
		stone: 1,
		hard: 1,
		pickaxe: 1,
		hand: 4,
		pathable: 1,
	};

	// Hoppers
	core.register_node("crafter_hopper:hopper", {
		drop: "crafter_hopper:hopper",
		description: "Hopper",
		groups: hopperGroups,
		sounds: crafter.stoneSound(),
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
		on_construct: onConstruct,
		on_timer: onTimer,
		on_metadata_inventory_put: timerTrigger,
		on_metadata_inventory_take: timerTrigger,
		// on_place: (itemstack, placer, pointed_thing) => {
		// 	return hopper_on_place(
		// 		itemstack,
		// 		placer,
		// 		pointed_thing,
		// 		"crafter_hopper:hopper"
		// 	);
		// },
		// can_dig: (pos: Vec3, player: ObjectRef) => {
		// 	const inv: InvRef = core.get_meta(pos).get_inventory();
		// 	return inv.is_empty("main");
		// },
		on_rightclick: (pos, node, clicker, itemstack) => {
			core.show_formspec(
				clicker.get_player_name(),
				"hopper_formspec:" + core.pos_to_string(pos),
				getHopperFormspec(pos)
			);
		},
	});
	// core.register_node("crafter_hopper:hopper_side", {
	// 	description: "Side Hopper",
	// 	drop: "crafter_hopper:hopper",
	// 	groups: hopperGroups,
	// 	sounds: crafter.stoneSound(),
	// 	drawtype: Drawtype.nodebox,
	// 	paramtype: ParamType1.light,
	// 	paramtype2: ParamType2.facedir,
	// 	tiles: [
	// 		"hopper_top_16.png",
	// 		"hopper_bottom_16.png",
	// 		"hopper_back_16.png",
	// 		"hopper_side_16.png",
	// 		"hopper_back_16.png",
	// 		"hopper_back_16.png",
	// 	],
	// 	node_box: {
	// 		type: Nodeboxtype.fixed,
	// 		fixed: [
	// 			//funnel walls
	// 			[-0.5, 0.0, 0.4, 0.5, 0.5, 0.5],
	// 			[0.4, 0.0, -0.5, 0.5, 0.5, 0.5],
	// 			[-0.5, 0.0, -0.5, -0.4, 0.5, 0.5],
	// 			[-0.5, 0.0, -0.5, 0.5, 0.5, -0.4],
	// 			//funnel base
	// 			[-0.5, 0.0, -0.5, 0.5, 0.1, 0.5],
	// 			//spout
	// 			[-0.3, -0.3, -0.3, 0.3, 0.0, 0.3],
	// 			[-0.7, -0.3, -0.15, 0.15, 0.0, 0.15],
	// 		],
	// 	},
	// 	selection_box: {
	// 		type: Nodeboxtype.fixed,
	// 		fixed: [
	// 			//funnel
	// 			[-0.5, 0.0, -0.5, 0.5, 0.5, 0.5],
	// 			//spout
	// 			[-0.3, -0.3, -0.3, 0.3, 0.0, 0.3],
	// 			[-0.7, -0.3, -0.15, 0.15, 0.0, 0.15],
	// 		],
	// 	},
	// 	on_construct: (pos: Vec3) => {
	// 		const inv: InvRef = core.get_meta(pos).get_inventory();
	// 		inv.set_size("main", 4 * 4);
	// 	},
	// 	on_place: (
	// 		itemstack: ItemStackObject,
	// 		placer: ObjectRef,
	// 		pointed_thing: PointedThing
	// 	) => {
	// 		return hopper_on_place(
	// 			itemstack,
	// 			placer,
	// 			pointed_thing,
	// 			"crafter_hopper:hopper_side"
	// 		);
	// 	},
	// 	can_dig: (pos: Vec3, player: ObjectRef) => {
	// 		const inv: InvRef = core.get_meta(pos).get_inventory();
	// 		return inv.is_empty("main");
	// 	},
	// 	on_rightclick: (
	// 		pos: Vec3,
	// 		node: NodeTable,
	// 		clicker: ObjectRef,
	// 		itemstack: ItemStackObject
	// 	) => {
	// 		if (
	// 			core.is_protected(pos, clicker.get_player_name()) &&
	// 			!core.check_player_privs(clicker, "protection_bypass")
	// 		) {
	// 			return;
	// 		}
	// 		core.show_formspec(
	// 			clicker.get_player_name(),
	// 			"hopper_formspec:" + core.pos_to_string(pos),
	// 			get_hopper_formspec(pos)
	// 		);
	// 	},
	// });
}
