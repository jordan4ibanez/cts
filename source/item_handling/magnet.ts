// local minetest,math,vector,ipairs = minetest,math,vector,ipairs

namespace item_handling {
	const pool = new Map<string, number>();

	core.register_on_joinplayer((player: ObjectRef) => {
		pool.set(player.get_player_name(), 0);
	});

	core.register_on_leaveplayer((player: ObjectRef) => {
		pool.delete(player.get_player_name());
	});


	// The item collection magnet.
	let tick: boolean = false
    
	function magnet(player: ObjectRef): void {
		// Don't magnetize to dead players.
		const name: string = player.get_player_name()
		if (player.get_hp() <= 0) {
            pool.set(name, 0)
        }

			const pos: Vec3 = player.get_pos()
			const inv: InvRef = player.get_inventory()


			if (tick == true and pool[name] > 0) then
	// 			core.sound_play("pickup", {
	// 				to_player = player:get_player_name(),
	// 				gain = 0.4,
	// 				pitch = math.random(60,100)/100
	// 			})
	// 			if pool[name] > 6 then
	// 				pool[name] = 6
	// 			else
	// 				pool[name] = pool[name] - 1
	// 			end
			end

	// 		--radial detection
	// 		for _,object in ipairs(core.get_objects_inside_radius({x=pos.x,y=pos.y+0.5,z=pos.z}, 2)) do
	// 			if not object:is_player() then
	// 				entity = object:get_luaentity()
	// 				if entity.name == "__builtin:item" and entity.collectable == true and object:get_luaentity().collected == false then
	// 					pos2 = object:get_pos()
	// 					diff = vector.subtract(pos2,pos).y
	// 					if diff >= 0 and inv:room_for_item("main", entity.itemstring) then
	// 						pool[name] = pool[name] + 1
	// 						inv:add_item("main", entity.itemstring)
	// 						entity.collector = player:get_player_name()
	// 						entity.collected = true

	// 					end
	// 				elseif not object:is_player() and object:get_luaentity() and object:get_luaentity().name == "experience:orb" then
	// 						entity.collector = player:get_player_name()
	// 						entity.collected = true
	// 				end
	// 			end
	// 		end
	
    }

	// core.register_globalstep(function(dtime)
	// 	tick = not tick
	// 	for _,player in ipairs(core.get_connected_players()) do
	// 		magnet(player)
	// 	end
	// end)
}
