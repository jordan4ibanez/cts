namespace crafter {
	//saplings
	//
	//
	//local sapling_min = 120
	//local sapling_max = 720
	//make sapling grow

	function sapling_grow(pos: Vec3): void {
		{
			const light: number | null = core.get_node_light(pos, null);
			if (light && light < 10) {
				//print("failed to grow at "..dump(pos))
				return;
			}
		}
		//print("growing at "..dump(pos))
		if (
			core.get_item_group(
				core.get_node(vector.create3d(pos.x, pos.y - 1, pos.z)).name,
				"soil"
			) <= 0
		) {
			return;
		}
		let good_to_grow: boolean = true;
		//check if room to grow (leaves or air)
		for (let i = 1; i <= 4; i++) {
			const node_name: string = core.get_node(
				vector.create3d(pos.x, pos.y + i, pos.z)
			).name;
			if (node_name != "air" && node_name != "crafter:leaves") {
				good_to_grow = false;
			}
		}
		if (good_to_grow) {
			core.set_node(pos, { name: "crafter:tree" });

			const schemmy: number = math.random(1, 2);

			if (schemmy == 1) {
				core.place_schematic(
					pos,
					crafter.tree_big,
					SchematicRotation.zero,
					null,
					false,
					"place_center_x, place_center_z"
				);
			} else if (schemmy == 2) {
				core.place_schematic(
					pos,
					crafter.tree_small,
					SchematicRotation.zero,
					null,
					false,
					"place_center_x, place_center_z"
				);
			}

			//override leaves
			let max: number = 3;
			if (schemmy == 2) {
				max = 1;
			}
			for (let i = 1; i <= max; i++) {
				core.set_node(vector.create3d(pos.x, pos.y + i, pos.z), {
					name: "crafter:tree",
				});
			}
		}
	}

	core.register_node("crafter:sapling", {
		description: "Sapling",
		drawtype: Drawtype.plantlike,
		inventory_image: "sapling.png",
		waving: 1,
		walkable: false,
		climbable: false,
		paramtype: ParamType1.light,
		is_ground_content: false,
		tiles: ["sapling.png"],
		groups: {
			leaves: 1,
			plant: 1,
			axe: 1,
			hand: 0,
			instant: 1,
			sapling: 1,
			attached_node: 1,
			flammable: 1,
		},
		sounds: crafter.dirtSound(),
		drop: "crafter:sapling",
		node_placement_prediction: "",
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-4 / 16, -0.5, -4 / 16, 4 / 16, 7 / 16, 4 / 16],
		},
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		) => {
			if (
				pointed_thing.type == PointedThingType.object ||
				pointed_thing.above == null ||
				pointed_thing.under == null
			) {
				return itemstack;
			}

			const sneak: boolean = placer.get_player_control().sneak;
			const noddef: NodeDefinition | undefined =
				core.registered_nodes[core.get_node(pointed_thing.under).name];
			if (noddef == null) {
				throw new Error("Sapling error");
			}

			if (!sneak && noddef.on_rightclick) {
				core.item_place(itemstack, placer, pointed_thing);
				return;
			}

			let buildable: boolean = false;
			{
				const def: NodeDefinition | undefined =
					core.registered_nodes[
						core.get_node(pointed_thing.under).name
					];
				buildable = (def && def.buildable_to) || false;
			}

			//replace buildable
			if (
				buildable &&
				core.get_item_group(
					core.get_node(
						vector.create3d(
							pointed_thing.under.x,
							pointed_thing.under.y - 1,
							pointed_thing.under.z
						)
					).name,
					"soil"
				) > 0
			) {
				return core.item_place(itemstack, placer, pointed_thing);
			}
			{
				const def: NodeDefinition | undefined =
					core.registered_nodes[
						core.get_node(pointed_thing.above).name
					];
				buildable = (def && def.buildable_to) || false;
			}
			if (
				buildable &&
				core.get_item_group(
					core.get_node(
						vector.create3d(
							pointed_thing.above.x,
							pointed_thing.above.y - 1,
							pointed_thing.above.z
						)
					).name,
					"soil"
				) > 0
			) {
				core.item_place(itemstack, placer, pointed_thing);
				return itemstack;
			}

			// todo: figure out what this is.
			//place sapling
			const pos: Vec3 = pointed_thing.above;
			if (
				core.get_item_group(
					core.get_node(vector.create3d(pos.x, pos.y - 1, pos.z))
						.name,
					"soil"
				) > 0 &&
				core.get_node(pointed_thing.above).name == "air"
			) {
				throw new Error("found it");
				core.set_node(pointed_thing.above, { name: "crafter:sapling" });
				core.sound_play("dirt", { pos: pointed_thing.above });
				itemstack.take_item(1);
				return itemstack;
			}
		},
	});

	// Growing abm for sapling.
	core.register_abm({
		label: "Tree Grow",
		nodenames: ["group:sapling"],
		neighbors: ["group:soil"],
		interval: 6,
		chance: 250,
		catch_up: true,
		action: (pos: Vec3) => {
			sapling_grow(pos);
		},
	});
}
