namespace redstone {

		// core.register_craftitem("crafter_redstone:dust", {
	// 	description = "Redstone Dust",
	// 	inventory_image = "redstone_dust_item.png",
	// 	wield_image = "redstone_dust_item.png",
	// 	wield_scale = {x = 1, y = 1, z = 1 + 1/16},
	// 	liquids_pointable = false,
	// 	on_place = function(itemstack, placer, pointed_thing)
	// 		if not pointed_thing.type == "node" then
	// 			return
	// 		end
	// 		local sneak = placer:get_player_control().sneak
	// 		local noddef = registered_nodes[get_node(pointed_thing.under).name]
	// 		if not sneak and noddef.on_rightclick then
	// 			core.item_place(itemstack, placer, pointed_thing)
	// 			return
	// 		end
	// 		local _,worked = core.item_place(ItemStack("crafter_redstone:dust_0"), placer, pointed_thing)
	// 		if worked then
	// 			itemstack:take_item()
	// 			return(itemstack)
	// 		end
	// 	end,
	// })

	// //power levels r_max-1 being the highest
	// local d_max = r_max-1
	// for i = 0,d_max do
	// 	local color = floor(255 * (i/d_max))
	// 	core.register_node("crafter_redstone:dust_"+i,{
	// 		description = "Redstone Dust",
	// 		wield_image = "redstone_dust_item.png",
	// 		tiles = {
	// 			"redstone_dust_main.png^[colorize:red:"+color, "redstone_turn.png^[colorize:red:"+color,
	// 			"redstone_t.png^[colorize:red:"+color, "redstone_cross.png^[colorize:red:"+color
	// 		},
	// 		power=i,
	// 		drawtype = "raillike",
	// 		paramtype = "light",
	// 		sunlight_propagates = true,
	// 		is_ground_content = false,
	// 		walkable = false,
	// 		node_placement_prediction = "",
	// 		selection_box = {
	// 			type = "fixed",
	// 			fixed = {-1/2, -1/2, -1/2, 1/2, -1/2+1/16, 1/2},
	// 		},
	// 		sounds = main.stoneSound(),
	// 		groups={dig_immediate=1,attached_node=1,redstone_dust=1,redstone=1,redstone_power=i},
	// 		drop="crafter_redstone:dust",
	// 		on_construct = function(pos)
	// 			data_injection(pos,{dust=i})
	// 			//instruction_rebuild(pos)
	// 			calculate(pos)
	// 		end,
	// 		after_destruct = function(pos)
	// 			data_injection(pos,nil)
	// 			//instruction_rebuild(pos,true)
	// 			calculate(pos)
	// 		end,
	// 		connects_to = {"group:redstone"},
	// 	})
	// 	core.register_lbm({
	//         name = "crafter_redstone:"+i,
	// 		nodenames = {"crafter_redstone:dust_"+i},
	// 		run_at_every_load = true,
	//         action = function(pos)
	// 			data_injection(pos,{dust=i})
	// 			//core.after(0,function()
	// 				//initial_instruction_build(pos)
	// 			//end)
	//         end,
	//     })
	// end
}