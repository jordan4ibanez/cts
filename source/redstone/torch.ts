namespace redstone {
	// local minetest,vector = minetest,vector

	// // Item definitions
	core.register_craftitem("redstone:torch", {
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
			newItemStack.set_name("crafter_redstone:torch_torch");
			return itemstack;
		},
	});

	// core.register_node("redstone:torch_floor", {
	// 	inventory_image = "redstone_torch.png",
	// 	wield_image = "redstone_torch.png",
	// 	wield_scale = {x = 1, y = 1, z = 1 + 2/16},
	// 	drawtype = "mesh",
	// 	mesh = "torch_floor.obj",
	// 	tiles = {"redstone_torch.png"},
	// 	paramtype = "light",
	// 	paramtype2 = "none",
	// 	sunlight_propagates = true,
	// 	drop = "redstone:torch",
	// 	walkable = false,
	// 	light_source = 13,
	// 	groups = {choppy=2, dig_immediate=3, not_in_creative_inventory=1, attached_node=1, torch=1,redstone=1,},
	// 	legacy_wallmounted = true,
	// 	selection_box = {
	// 		type = "fixed",
	// 		fixed = {-1/16, -0.5, -1/16, 1/16, 2/16, 1/16},
	// 	},
	// 	on_construct = function(pos)
	// 		redstone.inject(pos,{torch=r_max})
	// 		redstone.update(pos)
	// 	end,
	// 	after_destruct = function(pos, oldnode)
	// 		redstone.inject(pos,nil)
	// 		redstone.update(pos)
	// 	end,
	// 	sounds = main.woodSound(),
	// })

	// core.register_node("redstone:torch_wall", {
	// 	inventory_image = "redstone_torch.png",
	// 	wield_image = "redstone_torch.png",
	// 	wield_scale = {x = 1, y = 1, z = 1 + 1/16},
	// 	drawtype = "mesh",
	// 	mesh = "torch_wall.obj",
	// 	tiles = {"redstone_torch.png"},
	// 	paramtype = "light",
	// 	paramtype2 = "wallmounted",
	// 	sunlight_propagates = true,
	// 	walkable = false,
	// 	light_source = 13,
	// 	groups = {choppy=2, dig_immediate=3, flammable=1, not_in_creative_inventory=1, attached_node=1, torch=1,redstone=1,},
	// 	drop = "redstone:torch",
	// 	selection_box = {
	// 		type = "wallmounted",
	// 		wall_top = {-0.1, -0.1, -0.1, 0.1, 0.5, 0.1},
	// 		wall_bottom = {-0.1, -0.5, -0.1, 0.1, 0.1, 0.1},
	// 		wall_side = {-0.5, -0.3, -0.1, -0.2, 0.3, 0.1},
	// 	},
	// 	on_construct = function(pos)
	// 		redstone.inject(pos,{torch=r_max})
	// 		redstone.update(pos)
	// 	end,
	// 	after_destruct = function(pos, oldnode)
	// 		redstone.inject(pos,nil)
	// 		redstone.update(pos)
	// 	end,
	// 	sounds = main.woodSound(),
	// })

	// core.register_lbm({
	// 	name = "redstone:torch_init",
	// 	nodenames = {"redstone:torch_wall","redstone:torch_floor"},
	// 	run_at_every_load = true,
	// 	action = function(pos)
	// 		redstone.inject(pos,{torch=r_max})
	// 	end,
	// })
}
