namespace hopper {
	const hopperInventoryName: string = "main";

	// todo: Maybe, implement these.
	// { neighborNode: "crafter_hopper:chute", inv: "main" },
	// { neighborNode: "crafter_hopper:sorter", inv: "main" },
	// { neighborNode: "crafter_hopper:chute", inv: "main" },
	// { neighborNode: "crafter_hopper:sorter", inv: "main" },

	const keySet: (keyof ContainerData)[] = ["top", "bottom", "side"];

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

	const workerVec: Vec3 = vector.create3d();

	/**
	 * Get the output position of a hopper.
	 * @param pos The current position.
	 * @returns [position, is side]
	 */
	function getOutputPosition(pos: Vec3): [Vec3, boolean] {
		const currentName: string = core.get_node(pos).name;
		if (currentName == "crafter_hopper:hopper") {
			workerVec.x = 0;
			workerVec.y = -1;
			workerVec.z = 0;
			return [vector.add(pos, workerVec), false];
		} else if (currentName == "crafter_hopper:hopper_side") {
			throw new Error("unimplemented");
		} else {
			core.log(
				LogLevel.error,
				`A non-hopper was in position at (${pos.x}, ${pos.y}, ${pos.z})`
			);
			throw new Error("dead end reached.");
		}
	}

	function onTimer(pos: Vec3, elapsed: number): void {
		const inv: InvRef = core.get_meta(pos).get_inventory();

		//? Note: This logic technically makes the hopper function twice as fast,
		//? as well as at an irratic pace. But it is more sound.

		let outputSuccess: boolean = false;
		let inputSuccess: boolean = false;

		// First, try to empty itself to make room.
		(() => {
			if (inv.is_empty(hopperInventoryName)) {
				return;
			}
			const [outputPosition, isSide] = getOutputPosition(pos);

			const data: ContainerData | undefined =
				containers[core.get_node(outputPosition).name];

			if (data == null) {
				return;
			}

			let stringInvOutput: string | null = null;

			if (isSide) {
				if (data.side == null) {
					return;
				}
				stringInvOutput = data.side;
			} else {
				if (data.top == null) {
					return;
				}
				stringInvOutput = data.top;
			}

			if (stringInvOutput == null) {
				throw new Error("Logic failure.");
			}

			const outputInv: InvRef = core
				.get_meta(outputPosition)
				.get_inventory();

			// So now, this hopper's inventory has at least 1 item.
			// This now has conformation that there is an inventory to output to.
			// The final step is to check that this hopper can output to that inventory.

			let itemStackName: string | null = null;

			for (const itemObject of inv.get_list(hopperInventoryName)) {
				const stackName: string = itemObject.get_name();
				if (stackName != "") {
					itemStackName = stackName;
					break;
				}
			}

			if (itemStackName == null) {
				throw new Error("Item poll logic failure");
			}

			if (!outputInv.room_for_item(stringInvOutput, itemStackName)) {
				print("no room!");
				return;
			}

			// So now, this hopper takes 1 from itself.
			inv.remove_item(hopperInventoryName, itemStackName);

			// And, it adds it into that other inventory.
			outputInv.add_item(stringInvOutput, itemStackName);

			// Kickstart the output.
			timerTrigger(outputPosition);

			outputSuccess = true;
		})();

		// Next, try to pull out of the input. (The top)
		// All hoppers input from the top. They work by gravity, after all!
		(() => {
			const inputPos: Vec3 = vector.create3d(pos.x, pos.y + 1, pos.z);

			const data: ContainerData | undefined =
				containers[core.get_node(inputPos).name];

			if (data == null) {
				return;
			}

			let stringInvInput: string | null = null;

			if (data.bottom == null) {
				return;
			}

			stringInvInput = data.bottom;

			if (stringInvInput == null) {
				throw new Error("How did this even happen?");
			}

			const inputInv: InvRef = core.get_meta(inputPos).get_inventory();

			// Can't pull from an empty inventory.
			if (inputInv.is_empty(stringInvInput)) {
				return;
			}

			let itemStackName: string | null = null;

			for (const itemObject of inputInv.get_list(stringInvInput)) {
				const stackName: string = itemObject.get_name();
				if (stackName != "") {
					itemStackName = stackName;
					break;
				}
			}

			if (itemStackName == null) {
				throw new Error("Item poll logic failure");
			}

			// Now, let's see if it can fit this item.

			if (!inv.room_for_item(hopperInventoryName, itemStackName)) {
				print("no room!");
				return;
			}

			// Then finally, do the transfer.

			inputInv.remove_item(stringInvInput, itemStackName);

			inv.add_item(hopperInventoryName, itemStackName);

			// Kickstart the input.
			timerTrigger(inputPos);

			inputSuccess = true;
		})();

		print("Hopper running!");

		// If nothing is done, nothing needs to be done.
		// So it will set fast mode to false.
		timerTrigger(pos, inputSuccess || outputSuccess);
	}

	function onConstruct(pos: Vec3) {
		const inv: InvRef = core.get_meta(pos).get_inventory();
		inv.set_size("main", 4 * 4);
	}

	function timerTrigger(pos: Vec3, fastMode?: boolean): void {
		const timer: NodeTimerObject = core.get_node_timer(pos);
		if (timer.is_started()) {
			return;
		}

		timer.start(fastMode ? 0 : 3 + math.random());
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
		on_punch: timerTrigger,
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
