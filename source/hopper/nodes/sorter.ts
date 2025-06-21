namespace hopper {
	const facedir_to_bottomdir: Dictionary<number, Vec3> = {
		0: vector.create3d({ x: 0, y: -1, z: 0 }),
		1: vector.create3d({ x: 0, y: 0, z: -1 }),
		2: vector.create3d({ x: 0, y: 0, z: 1 }),
		3: vector.create3d({ x: -1, y: 0, z: 0 }),
		4: vector.create3d({ x: 1, y: 0, z: 0 }),
		5: vector.create3d({ x: 0, y: 1, z: 0 }),
	};

	function bottomdir(facedir: number): Vec3 {
		const data: Vec3 | undefined =
			facedir_to_bottomdir[math.floor(facedir / 4)];
		if (data == null) {
			throw new Error("Logic error.");
		}
		return data;
	}

	function get_sorter_formspec(pos: Vec3) {
		const spos: string = hopper.get_string_pos(pos);
		const filter_all: boolean =
			core.get_meta(pos).get_string("filter_all") == "true";

		let y_displace: number = 0;

		let filter_button_text: string | null = null;
		let filter_button_tooltip: string | null = null;
		let filter_body: string | null = null;

		if (filter_all) {
			filter_body = "";
			filter_button_text = "Selective\nFilter";
			filter_button_tooltip =
				"This sorter is currently set to try sending all items\nin the direction of the arrow. Click this button\nto enable an item-type-specific filter.";
		} else {
			filter_body =
				"label[3.7,0;" +
				"Filter" +
				"]list[nodemeta:" +
				spos +
				";filter;0,0.5;8,1;]";
			filter_button_text = "Filter\nAll";
			filter_button_tooltip =
				"This sorter is currently set to only send items listed\nin the filter list in the direction of the arrow.\nClick this button to set it to try sending all\nitems that way first.";
			y_displace = 1.6;
		}

		return (
			"size[8," +
			tostring(7 + y_displace) +
			"]" +
			hopper.formspec_bg +
			filter_body +
			"list[nodemeta:" +
			spos +
			";main;3," +
			tostring(0.3 + y_displace) +
			";2,2;]" +
			"button_exit[7," +
			tostring(0.8 + y_displace) +
			";1,1;filter_all;" +
			filter_button_text +
			"]tooltip[filter_all;" +
			filter_button_tooltip +
			"]" +
			hopper.get_eject_button_texts(pos, 6, 0.8 + y_displace) +
			"list[current_player;main;0," +
			tostring(2.85 + y_displace) +
			";8,1;]" +
			"list[current_player;main;0," +
			tostring(4.08 + y_displace) +
			";8,3;8]" +
			"listring[nodemeta:" +
			spos +
			";main]" +
			"listring[current_player;main]"
		);
	}

	core.register_node("crafter_hopper:sorter", {
		description: "Sorter",

		groups: { stone: 1, hard: 1, pickaxe: 1, hand: 4, pathable: 1 },
		sounds: hopper.metal_sounds,
		drawtype: Drawtype.nodebox,
		paramtype: ParamType1.light,
		paramtype2: ParamType2.facedir,
		tiles: [
			"hopper_bottom_16.png",
			"hopper_top_16.png",
			"hopper_bottom_16.png^hopper_sorter_arrow_16.png^[transformFX^hopper_sorter_sub_arrow_16.png^[transformFX",
			"hopper_bottom_16.png^hopper_sorter_arrow_16.png^hopper_sorter_sub_arrow_16.png",
			"hopper_top_16.png",
			"hopper_bottom_16.png^hopper_sorter_arrow_16.png",
		],
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				[-0.3, -0.3, -0.4, 0.3, 0.4, 0.4],
				[-0.2, -0.2, 0.4, 0.2, 0.2, 0.7],
				[-0.2, -0.3, -0.2, 0.2, -0.7, 0.2],
			],
		},

		on_construct: (pos: Vec3) => {
			const meta: MetaRef = core.get_meta(pos);
			const inv: InvRef = meta.get_inventory();
			inv.set_size("main", 2 * 2);
			inv.set_size("filter", 8);
		},

		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		) => {
			if (pointed_thing.type == PointedThingType.object) {
				return;
			}
			const pos: Vec3 | undefined = pointed_thing.under;
			const pos2: Vec3 | undefined = pointed_thing.above;
			if (pos == null || pos2 == null) {
				throw new Error("engine issue?");
			}

			const [returned_stack, success] = core.item_place_node(
				itemstack,
				placer,
				pointed_thing
			);
			if (success) {
				const meta: MetaRef = core.get_meta(pos2);
				meta.set_string("placer", placer.get_player_name());
			}
			return returned_stack;
		},

		can_dig: (pos: Vec3, player: ObjectRef) => {
			const meta: MetaRef = core.get_meta(pos);
			const inv: InvRef = meta.get_inventory();
			return inv.is_empty("main");
		},

		on_rightclick: (
			pos: Vec3,
			node: NodeTable,
			clicker: ObjectRef,
			itemstack: ItemStackObject
		) => {
			if (
				core.is_protected(pos, clicker.get_player_name()) &&
				!core.check_player_privs(clicker, "protection_bypass")
			) {
				return;
			}
			core.show_formspec(
				clicker.get_player_name(),
				"hopper_formspec:" + core.pos_to_string(pos),
				get_sorter_formspec(pos)
			);
		},

		allow_metadata_inventory_put: (
			pos: Vec3,
			listname: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		) => {
			if (listname == "filter") {
				const meta: MetaRef = core.get_meta(pos);
				const inv: InvRef = meta.get_inventory();

				inv.set_stack(listname, index, stack.take_item(1));
				return 0;
			}
			return stack.get_count();
		},

		allow_metadata_inventory_take: (
			pos: Vec3,
			listname: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		) => {
			if (listname == "filter") {
				const meta: MetaRef = core.get_meta(pos);
				const inv: InvRef = meta.get_inventory();
				inv.set_stack(listname, index, ItemStack(""));
				return 0;
			}
			return stack.get_count();
		},

		allow_metadata_inventory_move: (
			pos,
			from_list,
			from_index,
			to_list,
			to_index,
			count,
			player
		) => {
			if (to_list == "filter") {
				const meta: MetaRef = core.get_meta(pos);
				const inv: InvRef = meta.get_inventory();
				const stack_moved: ItemStackObject = inv.get_stack(
					from_list,
					from_index
				);
				inv.set_stack(to_list, to_index, stack_moved.take_item(1));
				return 0;
			} else if (from_list == "filter") {
				const meta: MetaRef = core.get_meta(pos);
				const inv: InvRef = meta.get_inventory();
				inv.set_stack(from_list, from_index, ItemStack(""));
				return 0;
			}
			return count;
		},

		on_metadata_inventory_put: (
			pos: Vec3,
			listname: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		) => {
			const timer: NodeTimerObject = core.get_node_timer(pos);
			if (!timer.is_started()) {
				timer.start(1);
			}
		},

		on_timer: (pos: Vec3, elapsed: number) => {
			const meta: MetaRef = core.get_meta(pos);
			const inv: InvRef = meta.get_inventory();
			// Build a filter list.
			const filter_items = new Set<string>();

			if (meta.get_string("filter_all") != "true") {
				const filter_inv_size: number = inv.get_size("filter");
				for (const i of $range(1, filter_inv_size)) {
					const stack: ItemStackObject = inv.get_stack("filter", i);
					const item: string = stack.get_name();
					if (item != "") {
						filter_items.add(item);
					}
				}
			}
			const node: NodeTable = core.get_node(pos);
			const firstDir: Vec3 = core.facedir_to_dir(node.param2 || 0);
			const default_destination_pos: Vec3 = vector.add(pos, firstDir);
			let default_output_direction: string | null = null;
			if (firstDir.y == 0) {
				default_output_direction = "horizontal";
			}
			const dir: Vec3 = bottomdir(node.param2 || 0);
			const filter_destination_pos: Vec3 = vector.add(pos, dir);
			let filter_output_direction: string | null = null;
			if (dir.y == 0) {
				filter_output_direction = "horizontal";
			}
			let success: boolean = false;
			const filter_destination_node: NodeTable = core.get_node(
				filter_destination_pos
			);
			const registered_inventories: ContainerData | undefined =
				hopper.get_registered_inventories_for(
					filter_destination_node.name
				);
			if (registered_inventories != null) {
				if (filter_output_direction == "horizontal") {
					success = hopper.send_item_to(
						pos,
						filter_destination_pos,
						filter_destination_node,
						registered_inventories["side"],
						filter_items
					);
				} else {
					success = hopper.send_item_to(
						pos,
						filter_destination_pos,
						filter_destination_node,
						registered_inventories["bottom"],
						filter_items
					);
				}
			} else {
				success = hopper.send_item_to(
					pos,
					filter_destination_pos,
					filter_destination_node,
					undefined,
					filter_items
				);
			}

			// Wasn't able to put something in the filter destination, for whatever reason. Now can start moving stuff forward to the default.
			if (!success) {
				const default_destination_node: NodeTable = core.get_node(
					default_destination_pos
				);
				const registered_inventories: ContainerData | undefined =
					hopper.get_registered_inventories_for(
						default_destination_node.name
					);
				if (registered_inventories != null) {
					if (default_output_direction == "horizontal") {
						hopper.send_item_to(
							pos,
							default_destination_pos,
							default_destination_node,
							registered_inventories["side"]
						);
					} else {
						hopper.send_item_to(
							pos,
							default_destination_pos,
							default_destination_node,
							registered_inventories["bottom"]
						);
					}
				} else {
					hopper.send_item_to(
						pos,
						default_destination_pos,
						default_destination_node
					);
				}
			}
			if (!inv.is_empty("main")) {
				core.get_node_timer(pos).start(1);
			}
		},
	});
}
