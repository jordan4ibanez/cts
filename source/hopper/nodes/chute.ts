namespace hopper {
	function get_chute_formspec(pos: Vec3): string {
		const spos: string = hopper.get_string_pos(pos);
		return (
			"size[8,7]" +
			hopper.formspec_bg +
			"list[nodemeta:" +
			spos +
			";main;3,0.3;2,2;]" +
			hopper.get_eject_button_texts(pos, 7, 0.8) +
			"list[current_player;main;0,2.85;8,1;]" +
			"list[current_player;main;0,4.08;8,3;8]" +
			"listring[nodemeta:" +
			spos +
			";main]" +
			"listring[current_player;main]"
		);
	}

	core.register_node("crafter_hopper:chute", {
		description: "Hopper Chute",
		drop: "crafter_hopper:chute",
		groups: { stone: 1, hard: 1, pickaxe: 1, hand: 4, pathable: 1 },
		sounds: hopper.metal_sounds,
		drawtype: Drawtype.nodebox,
		paramtype: ParamType1.light,
		paramtype2: ParamType2.facedir,
		tiles: [
			"hopper_bottom_16.png^hopper_chute_arrow_16.png",
			"hopper_bottom_16.png^(hopper_chute_arrow_16.png^[transformR180)",
			"hopper_bottom_16.png^(hopper_chute_arrow_16.png^[transformR270)",
			"hopper_bottom_16.png^(hopper_chute_arrow_16.png^[transformR90)",
			"hopper_top_16.png",
			"hopper_bottom_16.png",
		],
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				[-0.3, -0.3, -0.3, 0.3, 0.3, 0.3],
				[-0.2, -0.2, 0.3, 0.2, 0.2, 0.7],
			],
		},
		on_construct: (pos: Vec3) => {
			const inv: InvRef = core.get_meta(pos).get_inventory();
			inv.set_size("main", 2 * 2);
		},

		on_place: (itemstack: ItemStackObject, placer, pointed_thing) => {
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

		can_dig: (pos: Vec3, player: ObjectRef): boolean => {
			const inv: InvRef = core.get_meta(pos).get_inventory();
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
				get_chute_formspec(pos)
			);
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
			const node: NodeTable = core.get_node(pos);
			const dir: Vec3 = core.facedir_to_dir(node.param2 || 0);
			const destination_pos: Vec3 = vector.add(pos, dir);
			let output_direction: string | null = null;
			if (dir.y == 0) {
				output_direction = "horizontal";
			}
			const destination_node: NodeTable = core.get_node(destination_pos);
			const registered_inventories: ContainerData | undefined =
				hopper.get_registered_inventories_for(destination_node.name);
			if (registered_inventories != null) {
				if (output_direction == "horizontal") {
					hopper.send_item_to(
						pos,
						destination_pos,
						destination_node,
						registered_inventories["side"]
					);
				} else {
					hopper.send_item_to(
						pos,
						destination_pos,
						destination_node,
						registered_inventories["bottom"]
					);
				}
			} else {
				hopper.send_item_to(pos, destination_pos, destination_node);
			}
			if (!inv.is_empty("main")) {
				core.get_node_timer(pos).start(1);
			}
		},
	});
}
