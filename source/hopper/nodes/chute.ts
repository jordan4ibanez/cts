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
			tiles : [
				"hopper_bottom_" + "16" + ".png^hopper_chute_arrow_" + "16" + ".png",
				"hopper_bottom_" + "16" + ".png^(hopper_chute_arrow_" + "16" + ".png^[transformR180)",
				"hopper_bottom_" + "16" + ".png^(hopper_chute_arrow_" + "16" + ".png^[transformR270)",
				"hopper_bottom_" + "16" + ".png^(hopper_chute_arrow_" + "16" + ".png^[transformR90)",
				"hopper_top_" + "16" + ".png",
				"hopper_bottom_" + "16" + ".png"
			],
		// 	node_box : {
		// 		type : "fixed",
		// 		fixed : {
		// 			{-0.3, -0.3, -0.3, 0.3, 0.3, 0.3},
		// 			{-0.2, -0.2, 0.3, 0.2, 0.2, 0.7},
		// 		},
		// 	},
		// 	on_construct = function(pos)
		// 		local inv = core.get_meta(pos):get_inventory()
		// 		inv:set_size("main", 2*2)
		// 	end,
		// 	on_place = function(itemstack, placer, pointed_thing, node_name)
		// 		local pos  = pointed_thing.under
		// 		local pos2 = pointed_thing.above
		// 		local x = pos.x - pos2.x
		// 		local z = pos.z - pos2.z
		// 		local returned_stack, success = core.item_place_node(itemstack, placer, pointed_thing)
		// 		if success then
		// 			local meta = core.get_meta(pos2)
		// 			meta:set_string("placer", placer:get_player_name())
		// 		end
		// 		return returned_stack
		// 	end,
		// 	can_dig = function(pos,player)
		// 		local inv = core.get_meta(pos):get_inventory()
		// 		return inv:is_empty("main")
		// 	end,
		// 	on_rightclick = function(pos, node, clicker, itemstack)
		// 		if core.is_protected(pos, clicker:get_player_name()) and not core.check_player_privs(clicker, "protection_bypass") then
		// 			return
		// 		end
		// 		core.show_formspec(clicker:get_player_name(),
		// 			"hopper_formspec:"+core.pos_to_string(pos), get_chute_formspec(pos))
		// 	end,
		// 	on_metadata_inventory_put = function(pos, listname, index, stack, player)
		// 		local timer = core.get_node_timer(pos)
		// 		if not timer:is_started() then
		// 			timer:start(1)
		// 		end
		// 	end,
		// 	on_timer = function(pos, elapsed)
		// 		local meta = core.get_meta(pos);
		// 		local inv = meta:get_inventory()
		// 		local node = core.get_node(pos)
		// 		local dir = core.facedir_to_dir(node.param2)
		// 		local destination_pos = vector.add(pos, dir)
		// 		local output_direction
		// 		if dir.y == 0 then
		// 			output_direction = "horizontal"
		// 		end
		// 		local destination_node = core.get_node(destination_pos)
		// 		local registered_inventories = hopper.get_registered_inventories_for(destination_node.name)
		// 		if registered_inventories ~= nil then
		// 			if output_direction == "horizontal" then
		// 				hopper.send_item_to(pos, destination_pos, destination_node, registered_inventories["side"])
		// 			else
		// 				hopper.send_item_to(pos, destination_pos, destination_node, registered_inventories["bottom"])
		// 			end
		// 		else
		// 			hopper.send_item_to(pos, destination_pos, destination_node)
		// 		end
		// 		if not inv:is_empty("main") then
		// 			core.get_node_timer(pos):start(1)
		// 		end
		// 	end,
	});
}
