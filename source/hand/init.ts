namespace hand {
	// The hand

	// Create an initial hand tool.
	core.register_craftitem(":", {
		type: "none",
		wield_image: "nothing.png",
		wield_scale: vector.create3d({ x: 1, y: 1, z: 2.5 }),
	});

	// This is a fake node that should never be placed in the world.
	const def: ItemDefinition | undefined = core.registered_items[""];

	core.register_node("crafter_hand:player", {
		description: "",
		tiles: ["player.png"],
		visual_scale: 1,
		tool_capabilities: {
			full_punch_interval: 0.9,
			max_drop_level: 0,
			groupcaps: {
				stone: {
					times: { [1]: 7.5, [2]: 16, [3]: 32, [4]: 64, [5]: 128 },
					uses: 0,
					maxlevel: 1,
				}, //
				dirt: {
					times: { [1]: 0.75, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 0,
					maxlevel: 1,
				}, //
				snow: {
					times: { [1]: 0.75, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 0,
					maxlevel: 1,
				}, //
				grass: {
					times: { [1]: 0.9, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 0,
					maxlevel: 1,
				}, //
				sand: {
					times: { [1]: 0.75, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 0,
					maxlevel: 1,
				}, //
				wood: {
					times: { [1]: 3, [2]: 6, [3]: 9, [4]: 12, [5]: 15 },
					uses: 0,
					maxlevel: 1,
				}, //
				leaves: {
					times: { [1]: 0.75, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 0,
					maxlevel: 1,
				}, //
				wool: {
					times: { [1]: 0.75, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 0,
					maxlevel: 1,
				}, //
				glass: {
					times: { [1]: 0.5, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 0,
					maxlevel: 1,
				}, //
				netherrack: {
					times: { [1]: 0.4, [2]: 1.5, [3]: 3, [4]: 6, [5]: 12 },
					uses: 0,
					maxlevel: 1,
				}, //

				unbreakable: {
					times: { [1]: 63072000000000 },
					uses: 0,
					maxlevel: 1,
				}, // 2 million years

				//instant : {times:{[1]:0.1,},uses:0,maxlevel:1},
				dig_immediate: {
					times: { [2]: 0, [3]: 0, [1]: 0 },
					uses: 0,
					maxlevel: 1,
				},
			},
			damage_groups: { damage: 1 },
		},
		wield_scale: vector.create3d({ x: 1, y: 1, z: 1 }),
		paramtype: ParamType1.light,
		drawtype: Drawtype.mesh,
		mesh: "hand.b3d",
		// Prevent construction
		node_placement_prediction: "",
		on_construct: (pos: Vec3) => {
			core.log(
				LogLevel.error,
				"Tried to place hand at " + core.pos_to_string(pos)
			);
			core.remove_node(pos);
		},
		drop: "",
		on_drop: () => {
			return "";
		},
		groups: { dig_immediate: 3, not_in_creative_inventory: 1 },
		range: def && def.range,
	});

	core.register_node("crafter_hand:creative", {
		description: "",
		tiles: ["player.png"],
		visual_scale: 1,
		tool_capabilities: {
			full_punch_interval: 0.9,
			max_drop_level: 0,
			groupcaps: {
				stone: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				dirt: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				snow: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				grass: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				sand: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				wood: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				leaves: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				wool: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				glass: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				netherrack: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				unbreakable: {
					times: { [1]: 0, [2]: 0, [3]: 0, [4]: 0, [5]: 0 },
					uses: 0,
					maxlevel: 1,
				},
				dig_immediate: {
					times: { [2]: 0, [3]: 0, [1]: 0 },
					uses: 0,
					maxlevel: 1,
				},
			},
			damage_groups: { damage: 1 },
		},
		wield_scale: vector.create3d({ x: 1, y: 1, z: 1 }),
		paramtype: ParamType1.light,
		drawtype: Drawtype.mesh,
		mesh: "hand.b3d",
		// Prevent construction
		node_placement_prediction: "",
		on_construct: (pos: Vec3) => {
			core.log(
				LogLevel.error,
				"Tried to place hand at " + core.pos_to_string(pos)
			);
			core.remove_node(pos);
		},
		drop: "",
		on_drop: () => {
			return "";
		},
		groups: { dig_immediate: 3, not_in_creative_inventory: 1 },
		range: def.range,
	});

	//Create a hand list and then enable the hand node
	core.register_on_joinplayer((player: ObjectRef) => {
		player.get_inventory().set_size("hand", 1);
		player.get_inventory().set_stack("hand", 1, "crafter_hand:player");
	});
}
