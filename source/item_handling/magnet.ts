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

            const curVal = pool.get(name) 
            if (curVal == null) {throw new Error("what")}

			if (tick == true && curVal > 0) {
				core.sound_play("pickup", {
					to_player : player.get_player_name(),
					gain : 0.4,
					pitch : math.random(60,100)/100
				})
				if (curVal > 6) {
					pool.set(name,  6)
                } else {
					pool.set(name,  curVal - 1)
                }
            }

			// Radial detection.
			for (const [_,object] of ipairs(core.get_objects_inside_radius(vector.create3d({x:pos.x,y:pos.y+0.5,z:pos.z}), 2))) {
				if (object.is_player()) {
                    continue
                }
                let __entity: LuaEntity = object.get_luaentity()
                if (__entity.name != "__builtin:item") {
                    continue;
                }

                const entity: CrafterItemEntity = __entity as CrafterItemEntity;


                

					
					// if (entity.collectable == true and object:get_luaentity().collected == false) then
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
                
        }
	
    }

	// core.register_globalstep(function(dtime)
	// 	tick = not tick
	// 	for _,player in ipairs(core.get_connected_players()) do
	// 		magnet(player)
	// 	end
	// end)
}
