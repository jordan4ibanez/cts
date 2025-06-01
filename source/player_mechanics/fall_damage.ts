namespace playerMechanics {
	function cancel_fall_damage(player: ObjectRef): boolean {
		const name: string = player.get_player_name();
		if (player.get_hp() <= 0) {
			return false;
		}
		// Used for finding a disable fall damage node from the center of the player.
		// Rudementary collision detection.
		const pos: Vec3 = player.get_pos();

		const a_min: Vec3 = vector.create3d(
			pos.x - 0.25,
			pos.y - 0.85,
			pos.z - 0.25
		);
		const a_max: Vec3 = vector.create3d(
			pos.x + 0.25,
			pos.y + 0.85,
			pos.z + 0.25
		);

		// Now search for nodes that disable fall damage.
		let [_, saving_nodes] = core.find_nodes_in_area(a_min, a_max, [
			"group:disable_fall_damage",
		]);

		if (saving_nodes == null) {
			core.log(
				LogLevel.warning,
				`Saving nodes has become null, somehow. Quietly bailing`
			);
			return false;
		}

		const real_nodes: string[] = [];

		for (const [node_data, _] of pairs(saving_nodes)) {
			let data = saving_nodes[node_data];
			if (data == null) {
				core.log(
					LogLevel.warning,
					`Node data is null. Quietly continuing`
				);
				continue;
			}

			if (data > 0) {
                real_nodes.push(node_data);
				// table.insert(real_nodes,node_data)
			}
		}

		// 	// find the highest damage node
		// 	if table.getn(real_nodes) > 0 then
		// 		return(true)
		// 	end
		return false;
	}

	// local function calc_fall_damage(player,hp_change)
	// 	if cancel_fall_damage(player) then
	// 		return
	// 	else
	// 		local inv = player:get_inventory()
	// 		local stack = inv:get_stack("armor_feet", 1)
	// 		local name = stack:get_name()
	// 		if name ~= "" then
	// 			local absorption = 0
	// 			absorption = core.get_item_group(name,"armor_level")*2
	// 			//print("absorbtion:",absorption)
	// 			local wear_level = ((9-core.get_item_group(name,"armor_level"))*8)*(5-core.get_item_group(name,"armor_type"))*math.abs(hp_change)
	// 			stack:add_wear(wear_level)
	// 			inv:set_stack("armor_feet", 1, stack)
	// 			local new_stack = inv:get_stack("armor_feet",1):get_name()
	// 			if new_stack == "" then
	// 				core.sound_play("armor_break",{to_player=player:get_player_name(),gain=1,pitch=math.random(80,100)/100})
	// 				recalculate_armor(player)
	// 				set_armor_gui(player)
	// 				//do particles too
	// 			elseif core.get_item_group(new_stack,"boots") > 0 then
	// 				local pos = player:get_pos()
	// 				core.add_particlespawner({
	// 					amount = 30,
	// 					time = 0.00001,
	// 					minpos = {x=pos.x-0.5, y=pos.y+0.1, z=pos.z-0.5},
	// 					maxpos = {x=pos.x+0.5, y=pos.y+0.1, z=pos.z+0.5},
	// 					minvel = vector.new(-0.5,1,-0.5),
	// 					maxvel = vector.new(0.5 ,2 ,0.5),
	// 					minacc = {x=0, y=-9.81, z=1},
	// 					maxacc = {x=0, y=-9.81, z=1},
	// 					minexptime = 0.5,
	// 					maxexptime = 1.5,
	// 					minsize = 0,
	// 					maxsize = 0,
	// 					//attached = player,
	// 					collisiondetection = true,
	// 					collision_removal = true,
	// 					vertical = false,
	// 					node = {name= name.."particletexture"},
	// 					//texture = "eat_particles_1.png"
	// 				})
	// 				core.sound_play("armor_fall_damage", {object=player, gain = 1.0, max_hear_distance = 60,pitch = math.random(80,100)/100})
	// 			end
	// 			hp_change = hp_change + absorption
	// 			if hp_change >= 0 then
	// 				hp_change = 0
	// 			else
	// 				player:set_hp(player:get_hp()+hp_change,{reason="correction"})
	// 				core.sound_play("hurt", {object=player, gain = 1.0, max_hear_distance = 60,pitch = math.random(80,100)/100})
	// 			end
	// 		else
	// 			player:set_hp(player:get_hp()+hp_change,{reason="correction"})
	// 			core.sound_play("hurt", {object=player, gain = 1.0, max_hear_distance = 60,pitch = math.random(80,100)/100})
	// 		end
	// 	end
	// end
	// local pool = {}
	// local name
	// local new_vel
	// local old_vel
	// local damage_calc
	// local pos
	// core.register_globalstep(function(dtime)
	// 	for _,player in ipairs(core.get_connected_players()) do
	// 		name = player:get_player_name()
	// 		old_vel = pool[name]
	// 		if old_vel then
	// 			new_vel = player:get_player_velocity().y
	// 			if old_vel < -15 and new_vel >= -0.5 then
	// 				//don't do fall damage on unloaded areas
	// 				pos = player:get_pos()
	// 				pos.y = pos.y - 1
	// 				if core.get_node_or_nil(pos) then
	// 					calc_fall_damage(player,math.ceil(old_vel+14))
	// 				end
	// 			end
	// 		end
	// 		pool[name] = player:get_player_velocity().y
	// 	end
	// end)
}
