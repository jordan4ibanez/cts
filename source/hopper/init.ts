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

	function hopperPlacement(
		itemstack: ItemStackObject,
		placer: ObjectRef,
		pointed_thing: PointedThing
	) {
		if (pointed_thing.type == PointedThingType.object) {
			return;
		}
		const pos: Vec3 | undefined = pointed_thing.under;
		const pos2: Vec3 | undefined = pointed_thing.above;
		if (pos == null || pos2 == null) {
			throw new Error("engine issue?");
		}

		const sneak: boolean = placer.get_player_control().sneak;
		const nodeName: string = core.get_node(pos).name;
		const noddef: NodeDefinition | undefined =
			core.registered_nodes[nodeName];
		if (!sneak && noddef?.on_rightclick) {
			core.item_place(itemstack, placer, pointed_thing);
			return;
		}
		const x: number = pos.x - pos2.x;
		const z: number = pos.z - pos2.z;
		let returned_stack;
		let success: Vec3 | null = null;

		let node_name: string = "crafter_hopper:hopper";

		if (x != 0 || z != 0) {
			const data: ContainerData | undefined = containers[nodeName];
			if (data != null) {
				node_name = "crafter_hopper:hopper_side";
			}
		}
		[returned_stack, success] = core.item_place_node(
			ItemStack(node_name),
			placer,
			pointed_thing
		);

		if (success != null) {
			const meta: MetaRef = core.get_meta(pos2);
			meta.set_string("placer", placer.get_player_name());
			if (!core.settings.get_bool("creative_mode")) {
				itemstack.take_item();
			}
		}
		return itemstack;
	}

	const workerVec: Vec3 = vector.create3d();

	/**
	 * Get the output position of a hopper.
	 * @param pos The current position.
	 * @returns [position, is side]
	 */
	function getOutputPosition(pos: Vec3): [Vec3, boolean] {
		const currentNode: NodeTable = core.get_node(pos);
		const currentName: string = currentNode.name;

		if (currentName == "crafter_hopper:hopper") {
			workerVec.x = 0;
			workerVec.y = -1;
			workerVec.z = 0;
			return [vector.add(pos, workerVec), false];
		} else if (currentName == "crafter_hopper:hopper_side") {
			const param2: number | undefined = currentNode.param2;

			if (param2 == null) {
				throw new Error("Param2 implementation error.");
			}

			return [vector.add(pos, core.fourdir_to_dir(param2)), true];
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

			const outputNodeName: string = core.get_node(outputPosition).name;
			const data: ContainerData | undefined =
				containers[core.get_node(outputPosition).name];

			if (data == null) {
				// Attempt to throw an item out of the hopper if it is has a free space to do so.
				//? This is disabled because it will cause a lot of lag.
				// const nodeDef: NodeDefinition | undefined =
				// 	core.registered_nodes[outputNodeName];

				// if (nodeDef == null) {
				// 	throw new Error(
				// 		`Undefined node in output at ${outputPosition}`
				// 	);
				// }

				// if (!nodeDef.walkable) {
				// 	let itemStackName: string = "";
				// 	for (const itemObject of inv.get_list(
				// 		hopperInventoryName
				// 	)) {
				// 		const stackName: string = itemObject.get_name();
				// 		if (stackName != "") {
				// 			itemStackName = stackName;
				// 			break;
				// 		}
				// 	}

				// 	if (itemStackName == "") {
				// 		throw new Error("Logic error.");
				// 	}

				// 	inv.remove_item(hopperInventoryName, itemStackName);

				// 	// todo: make this nicer. This is really lame.
				// 	core.add_item(outputPosition, itemStackName);

				// 	outputSuccess = true;
				// }

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
				return;
			}

			// Then finally, do the transfer.

			inputInv.remove_item(stringInvInput, itemStackName);

			inv.add_item(hopperInventoryName, itemStackName);

			// Kickstart the input.
			timerTrigger(inputPos);

			inputSuccess = true;
		})();

		// If nothing is done, nothing needs to be done.
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

		timer.start(0.4);
	}

	const hopperGroups: Dictionary<string, number> = {
		stone: 1,
		hard: 1,
		pickaxe: 1,
		hand: 4,
		pathable: 1,
		hopper: 1,
	};

	function timerTriggerRegistrationWrapper(pos: Vec3) {
		timerTrigger(pos);
	}

	function onDestruct(pos: Vec3) {
		const inv: InvRef = core.get_meta(pos).get_inventory();
		for (const [_, itemStackObject] of ipairs(
			inv.get_list(hopperInventoryName)
		)) {
			if (itemStackObject.get_name() != "") {
				itemHandling.throw_item(pos, itemStackObject);
			}
		}
	}

	// Hoppers
	core.register_node("crafter_hopper:hopper", {
		drop: "crafter_hopper:hopper",
		description: "Hopper",
		groups: hopperGroups,
		sounds: crafter.stoneSound(),
		drawtype: Drawtype.nodebox,
		paramtype: ParamType1.light,
		paramtype2: ParamType2["4dir"],
		node_placement_prediction: "",
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
		on_punch: timerTriggerRegistrationWrapper,
		on_construct: onConstruct,
		on_destruct: onDestruct,
		on_timer: onTimer,
		on_metadata_inventory_put: timerTriggerRegistrationWrapper,
		on_metadata_inventory_take: timerTriggerRegistrationWrapper,
		on_metadata_inventory_move: timerTriggerRegistrationWrapper,
		on_place: hopperPlacement,
		on_rightclick: (pos, node, clicker, itemstack) => {
			if (clicker == null) {
				return;
			}
			core.show_formspec(
				clicker.get_player_name(),
				"hopper_formspec:" + core.pos_to_string(pos),
				getHopperFormspec(pos)
			);
		},
	});

	core.register_lbm({
		name: "crafter_hopper:fix_engine_issue",
		nodenames: ["crafter_hopper:hopper", "crafter_hopper:hopper_side"],
		run_at_every_load: true,
		action: (pos: Vec3) => {
			timerTrigger(pos);
		},
	});
	core.register_node("crafter_hopper:hopper_side", {
		description: "Side Hopper",
		drop: "crafter_hopper:hopper",
		groups: hopperGroups,
		sounds: crafter.stoneSound(),
		drawtype: Drawtype.nodebox,
		paramtype: ParamType1.light,
		paramtype2: ParamType2.facedir,
		tiles: [
			"hopper_top_16.png",
			"hopper_bottom_16.png",
			"hopper_back_16.png",
			"hopper_back_16.png",
			"hopper_side_16.png",
			"hopper_back_16.png",
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
				[-0.15, -0.3, -0.15, 0.15, 0.0, 0.7],
			],
		},
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				//funnel
				[-0.5, 0.0, -0.5, 0.5, 0.5, 0.5],
				//spout
				[-0.3, -0.3, -0.3, 0.3, 0.0, 0.3],
				[-0.15, -0.3, -0.15, 0.15, 0.0, 0.7],
			],
		},

		on_punch: timerTriggerRegistrationWrapper,
		on_construct: onConstruct,
		on_destruct: onDestruct,
		on_timer: onTimer,
		on_metadata_inventory_put: timerTriggerRegistrationWrapper,
		on_metadata_inventory_take: timerTriggerRegistrationWrapper,
		on_metadata_inventory_move: timerTriggerRegistrationWrapper,

		on_rightclick: (pos: Vec3, node: NodeTable, clicker: ObjectRef) => {
			core.show_formspec(
				clicker.get_player_name(),
				"hopper_formspec:" + core.pos_to_string(pos),
				getHopperFormspec(pos)
			);
		},
	});

	core.register_craft({
		output: "crafter_hopper:hopper",
		recipe: [
			["crafter:iron", "crafter_chest:chest", "crafter:iron"],
			["", "crafter:iron", ""],
		],
	});
}
