namespace hopper {
	// Suck in items on top of hopper.
	core.register_abm({
		label: "Hopper suction",
		nodenames: ["crafter_hopper:hopper", "crafter_hopper:hopper_side"],
		interval: 0.1,
		chance: 1,
		action: (
			pos: Vec3,
			node: NodeTable,
			active_object_count: number,
			active_object_count_wider: number
		) => {
			if (active_object_count_wider == 0) {
				return;
			}
			const inv: InvRef = core.get_meta(pos).get_inventory();

			for (const [_, object] of ipairs(
				core.get_objects_inside_radius(pos, 1)
			)) {
				if (object.is_player()) {
					continue;
				}

				const luaEntity: item_handling.CrafterItemEntity | null =
					object.get_luaentity() as item_handling.CrafterItemEntity | null;

				if (luaEntity == null || luaEntity.name != "__builtin:item") {
					continue;
				}

				const item: ItemStackObject = ItemStack(luaEntity.itemstring);

				if (!inv.room_for_item("main", item)) {
					continue;
				}

				const posob: Vec3 = object.get_pos();

				if (
					math.abs(posob.x - pos.x) <= 0.5 &&
					posob.y - pos.y <= 0.85 &&
					posob.y - pos.y >= 0.3
				) {
					inv.add_item("main", item);
					luaEntity.itemstring = "";
					object.remove();
				}
			}
		},
	});

	interface DirComponent {
		src: Vec3;
		dst: Vec3;
	}

	// Used to convert side hopper facing into source and destination relative coordinates.
	// This was tedious to populate and test.
	const directions: Dictionary<number, DirComponent> = {
		0: {
			src: vector.create3d({ x: 0, y: 1, z: 0 }),
			dst: vector.create3d({ x: -1, y: 0, z: 0 }),
		},
		1: {
			src: vector.create3d({ x: 0, y: 1, z: 0 }),
			dst: vector.create3d({ x: 0, y: 0, z: 1 }),
		},
		2: {
			src: vector.create3d({ x: 0, y: 1, z: 0 }),
			dst: vector.create3d({ x: 1, y: 0, z: 0 }),
		},
		3: {
			src: vector.create3d({ x: 0, y: 1, z: 0 }),
			dst: vector.create3d({ x: 0, y: 0, z: -1 }),
		},
		4: {
			src: vector.create3d({ x: 0, y: 0, z: 1 }),
			dst: vector.create3d({ x: -1, y: 0, z: 0 }),
		},
		5: {
			src: vector.create3d({ x: 0, y: 0, z: 1 }),
			dst: vector.create3d({ x: 0, y: -1, z: 0 }),
		},
		6: {
			src: vector.create3d({ x: 0, y: 0, z: 1 }),
			dst: vector.create3d({ x: 1, y: 0, z: 0 }),
		},
		7: {
			src: vector.create3d({ x: 0, y: 0, z: 1 }),
			dst: vector.create3d({ x: 0, y: 1, z: 0 }),
		},
		8: {
			src: vector.create3d({ x: 0, y: 0, z: -1 }),
			dst: vector.create3d({ x: -1, y: 0, z: 0 }),
		},
		9: {
			src: vector.create3d({ x: 0, y: 0, z: -1 }),
			dst: vector.create3d({ x: 0, y: 1, z: 0 }),
		},
		10: {
			src: vector.create3d({ x: 0, y: 0, z: -1 }),
			dst: vector.create3d({ x: 1, y: 0, z: 0 }),
		},
		11: {
			src: vector.create3d({ x: 0, y: 0, z: -1 }),
			dst: vector.create3d({ x: 0, y: -1, z: 0 }),
		},
		12: {
			src: vector.create3d({ x: 1, y: 0, z: 0 }),
			dst: vector.create3d({ x: 0, y: 1, z: 0 }),
		},
		13: {
			src: vector.create3d({ x: 1, y: 0, z: 0 }),
			dst: vector.create3d({ x: 0, y: 0, z: 1 }),
		},
		14: {
			src: vector.create3d({ x: 1, y: 0, z: 0 }),
			dst: vector.create3d({ x: 0, y: -1, z: 0 }),
		},
		15: {
			src: vector.create3d({ x: 1, y: 0, z: 0 }),
			dst: vector.create3d({ x: 0, y: 0, z: -1 }),
		},
		16: {
			src: vector.create3d({ x: -1, y: 0, z: 0 }),
			dst: vector.create3d({ x: 0, y: -1, z: 0 }),
		},
		17: {
			src: vector.create3d({ x: -1, y: 0, z: 0 }),
			dst: vector.create3d({ x: 0, y: 0, z: 1 }),
		},
		18: {
			src: vector.create3d({ x: -1, y: 0, z: 0 }),
			dst: vector.create3d({ x: 0, y: 1, z: 0 }),
		},
		19: {
			src: vector.create3d({ x: -1, y: 0, z: 0 }),
			dst: vector.create3d({ x: 0, y: 0, z: -1 }),
		},
		20: {
			src: vector.create3d({ x: 0, y: -1, z: 0 }),
			dst: vector.create3d({ x: 1, y: 0, z: 0 }),
		},
		21: {
			src: vector.create3d({ x: 0, y: -1, z: 0 }),
			dst: vector.create3d({ x: 0, y: 0, z: 1 }),
		},
		22: {
			src: vector.create3d({ x: 0, y: -1, z: 0 }),
			dst: vector.create3d({ x: -1, y: 0, z: 0 }),
		},
		23: {
			src: vector.create3d({ x: 0, y: -1, z: 0 }),
			dst: vector.create3d({ x: 0, y: 0, z: -1 }),
		},
	};

	const dirs: Dictionary<number, Vec3> = {
		0: vector.create3d({ x: 0, y: -1, z: 0 }),
		1: vector.create3d({ x: 0, y: 0, z: -1 }),
		2: vector.create3d({ x: 0, y: 0, z: 1 }),
		3: vector.create3d({ x: -1, y: 0, z: 0 }),
		4: vector.create3d({ x: 1, y: 0, z: 0 }),
		5: vector.create3d({ x: 0, y: 1, z: 0 }),
	};

	function bottomdir(facedir: number): Vec3 {
		const data: Vec3 | undefined = dirs[math.floor(facedir / 4)];
		if (data == null) {
			throw new Error("Logic error.");
		}
		return data;
	}

	// Hopper workings.
	core.register_abm({
		// 	label = "Hopper transfer",
		// 	nodenames = {"crafter_hopper:hopper", "crafter_hopper:hopper_side"},
		// 	neighbors = hopper.neighbors,
		// 	interval = 0.1,
		// 	chance = 1,
		// 	//catch_up = false,
		// 	action = function(pos, node, active_object_count, active_object_count_wider)
		// 		local source_pos, destination_pos, destination_dir
		// 		if node.name == "crafter_hopper:hopper_side" then
		// 			source_pos = vector.add(pos, directions[node.param2].src)
		// 			destination_dir = directions[node.param2].dst
		// 			destination_pos = vector.add(pos, destination_dir)
		// 		else
		// 			destination_dir = bottomdir(node.param2)
		// 			source_pos = vector.subtract(pos, destination_dir)
		// 			destination_pos = vector.add(pos, destination_dir)
		// 		end
		// 		local output_direction
		// 		if destination_dir.y == 0 then
		// 			output_direction = "horizontal"
		// 		end
		// 		local source_node = core.get_node(source_pos)
		// 		local destination_node = core.get_node(destination_pos)
		// 		local registered_source_inventories = hopper.get_registered_inventories_for(source_node.name)
		// 		if registered_source_inventories ~= nil then
		// 			hopper.take_item_from(pos, source_pos, source_node, registered_source_inventories["top"])
		// 		end
		// 		local registered_destination_inventories = hopper.get_registered_inventories_for(destination_node.name)
		// 		if registered_destination_inventories ~= nil then
		// 			if output_direction == "horizontal" then
		// 				hopper.send_item_to(pos, destination_pos, destination_node, registered_destination_inventories["side"])
		// 			else
		// 				hopper.send_item_to(pos, destination_pos, destination_node, registered_destination_inventories["bottom"])
		// 			end
		// 		else
		// 			hopper.send_item_to(pos, destination_pos, destination_node) // for handling ejection
		// 		end
		// 	end,
	});
}
