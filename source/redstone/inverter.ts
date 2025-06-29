namespace redstone {
	// local
	// minetest,vector
	// =
	// minetest,vector
	// local r_max = redstone.max_state

	//? On.

	//inverts redstone signal
	core.register_node("crafter_redstone:inverter_on", {
		description: "Redstone Inverter",
		tiles: ["repeater_on.png"],
		groups: {
			stone: 1,
			hard: 1,
			pickaxe: 1,
			hand: 4,
			attached_node: 1,
			redstone_activation_directional: 1,
		},
		sounds: crafter.stoneSound(),
		paramtype: ParamType1.light,
		paramtype2: ParamType2.facedir,
		sunlight_propagates: true,
		walkable: false,
		drawtype: Drawtype.nodebox,
		drop: "crafter_redstone:inverter_off",
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				//left  front  bottom right back top
				[-0.5, -0.5, -0.5, 0.5, -0.3, 0.5], //base
				[-0.2, -0.5, 0.2, 0.2, 0.1, 0.4], //output post
			],
		},

		after_place_node: (pos, placer, itemstack, pointed_thing) => {
			// local dir = core.facedir_to_dir(core.get_node(pos).param2)
			// redstone.inject(pos,{
			// 	name = "crafter_redstone:inverter_on",
			// 	directional_activator = true,
			// 	input  = vector.subtract(pos,dir),
			// 	output = vector.add(pos,dir),
			// 	dir = dir
			// })
			// redstone.update(pos)
			// redstone.update(vector.add(pos,dir))
		},

		// 	after_destruct = function(pos, oldnode)
		// 		local param2 = oldnode.param2
		// 		local dir = core.facedir_to_dir(param2)
		// 		redstone.inject(pos,nil)
		// 		//redstone.update(pos)
		// 		redstone.update(vector.add(pos,dir))
		// 	end
		// })
		// redstone.register_activator({
		// 	name = "crafter_redstone:inverter_on",
		// 	deactivate = function(pos)
		// 		local param2 = core.get_node(pos).param2
		// 		core.swap_node(pos,{name="crafter_redstone:inverter_off",param2=param2})
		// 		local dir = core.facedir_to_dir(param2)
		// 		redstone.inject(pos,{
		// 			name = "crafter_redstone:inverter_off",
		// 			torch  = r_max,
		// 			torch_directional = true,
		// 			directional_activator = true,
		// 			input  = vector.subtract(pos,dir),
		// 			output = vector.add(pos,dir),
		// 			dir = dir
		// 		})
		// 		//redstone.update(pos)
		// 		redstone.update(vector.add(pos,dir))
		// 	end
	});

	//? Off.

	core.register_node("crafter_redstone:inverter_off", {
		//     description = "Redstone Inverter",
		//     tiles = {"repeater_off.png"},
		//     groups = {stone = 1, hard = 1, pickaxe = 1, hand = 4,attached_node = 1,redstone_activation_directional=1,torch_directional=1,redstone_power=r_max},
		//     sounds = main.stoneSound(),
		//     paramtype = "light",
		// 	paramtype2 = "facedir",
		// 	sunlight_propagates = true,
		// 	walkable = false,
		// 	drawtype= "nodebox",
		// 	drop="crafter_redstone:inverter_off",
		// 	node_box = {
		// 		type = "fixed",
		// 		fixed = {
		// 				//left  front  bottom right back top
		// 				{-0.5, -0.5,  -0.5, 0.5,  -0.3, 0.5}, //base
		// 				{-0.2, -0.5,  0.2, 0.2,  0.1, 0.4}, //output post
		// 			},
		// 		},
		// 	after_place_node = function(pos, placer, itemstack, pointed_thing)
		// 		local dir = core.facedir_to_dir(core.get_node(pos).param2)
		// 		redstone.inject(pos,{
		// 			name = "crafter_redstone:inverter_off",
		// 			torch  = r_max,
		// 			torch_directional = true,
		// 			directional_activator = true,
		// 			input  = vector.subtract(pos,dir),
		// 			output = vector.add(pos,dir),
		// 			dir = dir
		// 		})
		// 		redstone.update(pos)
		// 		redstone.update(vector.add(pos,dir))
		// 	end,
		// 	after_destruct = function(pos, oldnode)
		// 		local param2 = oldnode.param2
		// 		local dir = core.facedir_to_dir(param2)
		// 		redstone.inject(pos,nil)
		// 		//redstone.update(pos)
		// 		redstone.update(vector.add(pos,dir))
		// 	end
		// })
		// redstone.register_activator({
		// 	name = "crafter_redstone:inverter_off",
		// 	activate = function(pos)
		// 		local param2 = core.get_node(pos).param2
		// 		core.swap_node(pos,{name="crafter_redstone:inverter_on",param2=param2})
		// 		local dir = core.facedir_to_dir(param2)
		// 		redstone.inject(pos,{
		// 			name = "crafter_redstone:inverter_on",
		// 			directional_activator = true,
		// 			input  = vector.subtract(pos,dir),
		// 			output = vector.add(pos,dir),
		// 			dir = dir
		// 		})
		// 		//redstone.update(pos)
		// 		redstone.update(vector.add(pos,dir))
		// 	end
	});
}
