// local r_max = redstone.max_state

// core.register_node("redstone:detector_off", {
//     description = "Detector",
//     tiles = {"redstone_piston.png^[invert:rgb^[colorize:yellow:100",
//     "redstone_piston.png^[transformR180^[invert:rgb^[colorize:yellow:100",
//     "redstone_piston.png^[transformR270^[invert:rgb^[colorize:yellow:100",
//     "redstone_piston.png^[transformR90^[invert:rgb^[colorize:yellow:100",
//     "wood.png^[invert:rgb^[colorize:yellow:100",
//     "stone.png^[invert:rgb^[colorize:yellow:100"},
//     paramtype2 = "facedir",
//     groups = {stone = 1, hard = 1, pickaxe = 1, hand = 4,pathable = 1},
//     sounds = main.stoneSound(),
//     drop = "redstone:detector_off",
//     paramtype = "light",
//     sunlight_propagates = true,

//     on_timer = function(pos, elapsed)
//         local param2 = core.get_node(pos).param2
//         local dir = core.facedir_to_dir(param2)

//         if core.get_node(vector.add(pos,dir)).name ~= "air" then
//             core.swap_node(pos, {name="redstone:detector_on",param2=param2})

//             redstone.inject(pos,{
//                 name = "redstone:detector_on",
//                 torch = r_max,
//             })
//             core.after(0,function()
//             	redstone.update(pos)
//             end)
//         end

//         local timer = core.get_node_timer(pos)
//         if not timer:is_started() then
//             timer:start(1)
//         end
//     end,

// 	--reverse the direction to face the player
// 	on_construct = function(pos)
// 		redstone.inject(pos,{
// 			name = "redstone:detector_off",
//         })
//         local timer = core.get_node_timer(pos)
// 		if not timer:is_started() then
// 			timer:start(1)
// 		end
// 	end,
// 	on_rightclick = function(pos, node, clicker, itemstack, pointed_thing)
// 		local look = clicker:get_look_dir()
// 		look = vector.multiply(look,-1)
// 		local dir = core.dir_to_facedir(look, true)
// 		core.swap_node(pos,{name="redstone:detector_off",param2=dir})
// 	end,
//     after_place_node = function(pos, placer, itemstack, pointed_thing)
// 		local look = placer:get_look_dir()
// 		look = vector.multiply(look,-1)
// 		local dir = core.dir_to_facedir(look, true)
// 		core.swap_node(pos,{name="redstone:detector_off",param2=dir})
// 	end,
// 	on_destruct = function(pos, oldnode)
// 		redstone.inject(pos,nil)
//     end,
// })

// core.register_lbm({
// 	name = "redstone:detector_off",
// 	nodenames = {"redstone:detector_off"},
// 	run_at_every_load = true,
// 	action = function(pos)
// 		redstone.inject(pos,{
// 			name = "redstone:detector_off",
//         })

//         local timer = core.get_node_timer(pos)
// 		if not timer:is_started() then
// 			timer:start(1)
// 		end
// 	end,
// })

// core.register_node("redstone:detector_on", {
//     description = "Detector On",
//     tiles = {"redstone_piston.png^[invert:rgb^[colorize:green:100",
//     "redstone_piston.png^[transformR180^[invert:rgb^[colorize:green:100",
//     "redstone_piston.png^[transformR270^[invert:rgb^[colorize:green:100",
//     "redstone_piston.png^[transformR90^[invert:rgb^[colorize:green:100",
//     "wood.png^[invert:rgb^[colorize:green:100",
//     "stone.png^[invert:rgb^[colorize:green:100"},
//     paramtype2 = "facedir",
//     groups = {stone = 1, hard = 1, pickaxe = 1, hand = 4,pathable = 1},
//     sounds = main.stoneSound(),
//     drop = "redstone:breaker_off",
//     paramtype = "light",
//     sunlight_propagates = true,
//     on_timer = function(pos, elapsed)
//         local param2 = core.get_node(pos).param2
//         local dir = core.facedir_to_dir(param2)
//         if core.get_node(vector.add(pos,dir)).name == "air" then
//             core.swap_node(pos, {name="redstone:detector_off",param2=param2})

//             redstone.inject(pos,{
//                 name = "redstone:detector_off",
//             })
//             core.after(0,function()
//             	redstone.update(pos)
//             end)
//         end

//         local timer = core.get_node_timer(pos)
//         if not timer:is_started() then
//             timer:start(1)
//         end
//     end,
// 	--reverse the direction to face the player
// 	on_construct = function(pos)
// 		redstone.inject(pos,{
//             name = "redstone:detector_on",
//             torch = r_max,
//         })
//         local timer = core.get_node_timer(pos)
// 		if not timer:is_started() then
// 			timer:start(1)
// 		end
// 		redstone.update(pos)
// 	end,
// 	on_destruct = function(pos)
// 		redstone.inject(pos,nil)
//     end,
// })

// core.register_lbm({
// 	name = "redstone:detector_on",
// 	nodenames = {"redstone:detector_on"},
// 	run_at_every_load = true,
// 	action = function(pos)
// 		redstone.inject(pos,{
// 			name = "redstone:detector_on",
// 			torch = r_max,
//         })

//         local timer = core.get_node_timer(pos)
// 		if not timer:is_started() then
// 			timer:start(1)
// 		end

// 		core.after(0,function()
//             redstone.update(pos)
//         end)
// 	end,
// })
