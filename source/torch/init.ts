namespace torch {
	// How many seconds torches will wait to check if player is near.
	const particle_time: number = 5;
	const check_radius: number = 10;

	// Get point where particle spawner is added.
	function get_offset(wdir: number): Vec3 {
		let z: number = 0;
		let x: number = 0;
		if (wdir == 4) {
			z = 0.25;
		} else if (wdir == 2) {
			x = 0.25;
		} else if (wdir == 5) {
			z = -0.25;
		} else if (wdir == 3) {
			x = -0.25;
		}
		return vector.create3d({ x: x, y: 0.27, z: z });
	}

	// Add in smoke and fire.
	function create_ps(pos: Vec3): void {
		const dir: Vec3 = get_offset(core.get_node(pos).param2 || 0);
		const ppos: Vec3 = vector.add(dir, pos);
		core.add_particle({
			pos: ppos,
			velocity: vector.create3d(0, 0, 0),
			acceleration: vector.create3d(0, 0, 0),
			expirationtime: particle_time * 3,
			size: 3,
			collisiondetection: false,
			vertical: true,
			texture: "torch_animated.png",
			animation: {
				type: TileAnimationType.vertical_frames,
				aspect_w: 16,
				// Width of a frame in pixels
				aspect_h: 16,
				// Height of a frame in pixels
				length: 0.2,
				// Full loop length
			},
		});
		// todo: do this in csm?
		/*
		// core.add_particlespawner({
		// 	amount = particle_time*6,
		// 	time = particle_time*2,
		// 	minpos = ppos,
		// 	maxpos = ppos,
		// 	minvel = vector.new(-0.1,0.1,-0.1),
		// 	maxvel = vector.new(0.1,0.3,0.1),
		// 	minacc = vector.new(0,0,0),
		// 	maxacc = vector.new(0,0,0),
		// 	minexptime = 1,
		// 	maxexptime = 2,
		// 	minsize = 1,
		// 	maxsize = 2,
		// 	collisiondetection = false,
		// 	vertical = false,
		// 	texture = "smoke.png",
		// })
	*/
	}
	//? Note: this caused a LOT of server lag.
	// Reload smoke and flame on load.
	/*
// core.register_abm({
// 	label = "Torch Particle",
// 	nodenames = {"group:torch"},
// 	neighbors = {"air"},
// 	interval = particle_time,
// 	chance = 1,
// 	action = function(pos, node, active_object_count, active_object_count_wider)
// 		local found_player = false
// 		for _,object in ipairs(core.get_objects_inside_radius(pos, check_radius)) do
// 			local pos2 = object:getpos()
// 			if object:is_player() then
// 				found_player = true
// 			end
// 		end
// 		if found_player == true then
// 			create_ps(pos)
// 		end
// 	end,
// })
*/
	// Item definitions.
	core.register_craftitem("crafter_torch:torch", {
		description: "Torch",
		inventory_image: "torches_torch.png",
		wield_image: "torches_torch.png",
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
				retval = fakestack.set_name("crafter_torch:floor");
			} else if (wdir < 1) {
				return itemstack;
			} else if (wdir == 1) {
				retval = fakestack.set_name("crafter_torch:floor");
			} else {
				retval = fakestack.set_name("crafter_torch:wall");
			}
			if (!retval) {
				return itemstack;
			}

			const [newItemStack, newDir] = core.item_place(
				fakestack,
				placer,
				pointed_thing,
				wdir
			);
			newItemStack.set_name("crafter_torch:torch");
			if (newDir != null) {
				core.sound_play("wood", {
					pos: pointed_thing.above,
					gain: 1.0,
				});
			}
			return itemstack;
		},
	});

	core.register_node("crafter_torch:floor", {
		inventory_image: "torches_torch.png",
		wield_image: "torches_torch.png",
		wield_scale: vector.create3d({ x: 1, y: 1, z: 1 + 2 / 16 }),
		drawtype: Drawtype.mesh,
		mesh: "torch_floor.obj",
		tiles: ["torches_torch.png"],
		paramtype: ParamType1.light,
		paramtype2: ParamType2.none,
		sunlight_propagates: true,
		drop: "crafter_torch:torch",
		walkable: false,
		floodable: true,
		on_flood: (pos: Vec3, oldnode: NodeTable, newnode: NodeTable) => {
			item_handling.throw_item(pos, "crafter_torch:torch");
		},
		light_source: 13,
		groups: {
			choppy: 2,
			dig_immediate: 3,
			flammable: 1,
			not_in_creative_inventory: 1,
			attached_node: 1,
			torch: 1,
		},
		legacy_wallmounted: true,
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-1 / 16, -0.5, -1 / 16, 1 / 16, 2 / 16, 1 / 16],
		},
		sounds: crafter.woodSound(),
	});

	core.register_node("crafter_torch:wall", {
		inventory_image : "torches_torch.png",
		wield_image : "torches_torch.png",
		wield_scale : {x : 1, y : 1, z : 1 + 1/16},
		drawtype : "mesh",
		mesh : "torch_wall.obj",
		tiles : {"torches_torch.png"},
		paramtype : "light",
		paramtype2 : "wallmounted",
		floodable : true,
		on_flood : (pos: Vec3, oldnode: NodeTable, newnode: NodeTable) => {
			item_handling.throw_item(pos, "crafter_torch:torch")
		},
		sunlight_propagates : true,
		walkable : false,
		light_source : 13,
		groups : {choppy:2, dig_immediate:3, flammable:1, not_in_creative_inventory:1, attached_node:1, torch:1},
		drop : "crafter_torch:torch",
		selection_box : {
			type : Nodeboxtype.wallmounted,
			wall_top : [-0.1, -0.1, -0.1, 0.1, 0.5, 0.1],
			wall_bottom : [-0.1, -0.5, -0.1, 0.1, 0.1, 0.1],
			wall_side : [-0.5, -0.3, -0.1, -0.2, 0.3, 0.1],
		},
		sounds : main.woodSound(),
	})

	// core.register_craft({
	// 	output = "crafter_torch:torch 4",
	// 	recipe = {
	// 		{"group:coal"},
	// 		{"group:stick"}
	// 	}
	// })
}
