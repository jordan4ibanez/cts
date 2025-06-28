namespace redstone {
	// Item definitions.
	core.register_craftitem("crafter_redstone:torch", {
		description: "Redstone Torch",
		inventory_image: "redstone_torch.png",
		wield_image: "redstone_torch.png",
		wield_scale: vector.create3d({ x: 1, y: 1, z: 1 + 1 / 16 }),
		liquids_pointable: false,

		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		) => {
			if (pointed_thing.type == PointedThingType.object) {
				return itemstack;
			}
			if (pointed_thing.under == null || pointed_thing.above == null) {
				return itemstack;
			}
			const buildable: boolean =
				core.registered_nodes[core.get_node(pointed_thing.under).name]
					?.buildable_to || false;

			let wdir: number = 0;
			if (buildable) {
				wdir = core.dir_to_wallmounted(
					vector.subtract(pointed_thing.under, pointed_thing.under)
				);
			} else {
				wdir = core.dir_to_wallmounted(
					vector.subtract(pointed_thing.under, pointed_thing.above)
				);
			}

			const fakestack: ItemStackObject = itemstack;

			let retval: boolean = false;
			if (buildable && wdir == 4) {
				retval = fakestack.set_name("crafter_redstone:torch_floor");
			} else if (wdir < 1) {
				return itemstack;
			} else if (wdir == 1) {
				retval = fakestack.set_name("crafter_redstone:torch_floor");
			} else {
				retval = fakestack.set_name("crafter_redstone:torch_wall");
			}
			if (!retval) {
				return itemstack;
			}

			const [newItemStack, _] = core.item_place(
				fakestack,
				placer,
				pointed_thing,
				wdir
			);
			newItemStack.set_name("crafter_redstone:torch");
			return itemstack;
		},
	});

	core.register_node("crafter_redstone:torch_floor", {
		inventory_image: "redstone_torch.png",
		wield_image: "redstone_torch.png",
		wield_scale: vector.create3d({ x: 1, y: 1, z: 1 + 2 / 16 }),
		drawtype: Drawtype.mesh,
		mesh: "torch_floor.obj",
		tiles: ["redstone_torch.png"],
		paramtype: ParamType1.light,
		paramtype2: ParamType2.none,
		sunlight_propagates: true,
		drop: "crafter_redstone:torch",
		walkable: false,
		light_source: 13,
		use_texture_alpha: TextureAlpha.clip,
		sounds: crafter.woodSound(),
		groups: {
			choppy: 2,
			dig_immediate: 3,
			not_in_creative_inventory: 1,
			attached_node: 1,
			torch: 1,
			redstone: 1,
		},
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-1 / 16, -0.5, -1 / 16, 1 / 16, 2 / 16, 1 / 16],
		},
		on_construct: (pos: Vec3) => {
			addData(pos, { powerSource: maxState });
		},
		after_destruct: (pos: Vec3) => {
			deleteData(pos);
		},
	});

	core.register_node("crafter_redstone:torch_wall", {
		inventory_image: "redstone_torch.png",
		wield_image: "redstone_torch.png",
		wield_scale: vector.create3d({ x: 1, y: 1, z: 1 + 1 / 16 }),
		drawtype: Drawtype.mesh,
		mesh: "torch_wall.obj",
		tiles: ["redstone_torch.png"],
		paramtype: ParamType1.light,
		paramtype2: ParamType2.wallmounted,
		sunlight_propagates: true,
		walkable: false,
		light_source: 13,
		use_texture_alpha: TextureAlpha.clip,
		groups: {
			choppy: 2,
			dig_immediate: 3,
			flammable: 1,
			not_in_creative_inventory: 1,
			attached_node: 1,
			torch: 1,
			redstone: 1,
		},
		drop: "crafter_redstone:torch",
		selection_box: {
			type: Nodeboxtype.wallmounted,
			wall_top: [-0.1, -0.1, -0.1, 0.1, 0.5, 0.1],
			wall_bottom: [-0.1, -0.5, -0.1, 0.1, 0.1, 0.1],
			wall_side: [-0.5, -0.3, -0.1, -0.2, 0.3, 0.1],
		},
		sounds: crafter.woodSound(),
		on_construct: (pos: Vec3) => {
			addData(pos, { powerSource: maxState });
		},
		after_destruct: (pos: Vec3) => {
			deleteData(pos);
		},
	});
}
