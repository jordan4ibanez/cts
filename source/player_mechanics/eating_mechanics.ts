namespace playerMechanics {
	// local minetest,math,vector,ipairs,pairs,table =
	//       minetest,math,vector,ipairs,pairs,table

	interface FoodData {
		eating_step: number;
		eating_timer: number;
	}

	const food_control_pool = new Map<string, FoodData>();

	const particle_constant: ParticleSpawnerDefinition = {
		amount: 12,
		time: 0.01,
		minpos: vector.create3d({ x: -0.1, y: -0.1, z: -0.1 }),
		maxpos: vector.create3d({ x: 0.1, y: 0.3, z: 0.1 }),
		minvel: vector.create3d({ x: -0.5, y: 0.2, z: -0.5 }),
		maxvel: vector.create3d({ x: 0.5, y: 0.6, z: 0.5 }),
		minacc: vector.create3d({ x: 0, y: -9.81, z: 1 }),
		maxacc: vector.create3d({ x: 0, y: -9.81, z: 1 }),
		minexptime: 0.5,
		maxexptime: 1.5,
		object_collision: false,
		collisiondetection: true,
		collision_removal: true,
		vertical: false,
	};

	core.register_on_joinplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		food_control_pool.set(name, {
			eating_step: 0,
			eating_timer: 0,
		});
	});

	core.register_on_leaveplayer((player: ObjectRef) => {
		food_control_pool.delete(player.get_player_name());
	});

	// Manages player eating effects.
	function manage_eating_effects(
		player: ObjectRef,
		timer: number,
		sneaking: boolean,
		item: ObjectRef
	): number {
		let position: Vec3 = player.get_pos();
		let offset: number = 0;

		if (sneaking) {
			position.y = position.y + 1.2;
			offset = 0.6;
		} else {
			position.y = position.y + 1.3;
			offset = 0.3;
		}

		position = vector.add(
			position,
			vector.multiply(player.get_look_dir(), offset)
		);

		const velocity: Vec3 = player.get_velocity();

		const temp_particle = table.copy(
			particle_constant as any as LuaTable
		) as ParticleSpawnerDefinition;

		temp_particle.minpos = vector.add(position, temp_particle.minpos!);
		temp_particle.maxpos = vector.add(position, temp_particle.maxpos!);
		temp_particle.minvel = vector.add(velocity, temp_particle.minvel!);
		temp_particle.maxvel = vector.add(velocity, temp_particle.maxvel!);
		temp_particle.node = { name: item + "node" };
		core.add_particlespawner(temp_particle);

		if (timer >= 0.2) {
			core.sound_play("eat", {
				object: player,
				gain: 0.2,
				pitch: math.random(60, 85) / 100,
			});
			return 0;
		}
		return timer;
	}

	function finish_eating(player: ObjectRef, timer: number): number {
		if (timer >= 1) {
			const item: ItemStackObject = player.get_wielded_item();
			// todo: this was dependant on the food mod.
			// player_eat_food(player,item)
			core.sound_play("eat_finish", {
				object: player,
				gain: 0.025,
				pitch: math.random(60, 85) / 100,
			});
			return 0;
		}
		return timer;
	}

	// local name
	// local control
	// local item
	// local satiation
	// local hunger
	// local eating_step
	// local eating_timer
	// local pool

	function manage_eating(player: ObjectRef, dtime: number) {
		//     control = player:get_player_control()
		//     name    = player:get_player_name()
		//     pool    = food_control_pool[name]
		//     //eating
		//     if control.RMB then
		//         item      = player:get_wielded_item():get_name()
		//         satiation = core.get_item_group( item, "satiation")
		//         hunger    = core.get_item_group( item, "hunger"   )
		//         if hunger > 0 or satiation > 0  then
		//             pool.eating_step  = pool.eating_step  + dtime
		//             pool.eating_timer = pool.eating_timer + dtime
		//             pool.eating_timer = manage_eating_effects(
		//                 player,
		//                 pool.eating_timer,
		//                 control.sneak,
		//                 item
		//             )
		//             pool.eating_step = finish_eating(
		//                 player,
		//                 pool.eating_step
		//             )
		//         else
		//             pool.eating_step  = 0
		//             pool.eating_timer = 0
		//         end
		//     else
		//         pool.eating_step  = 0
		//         pool.eating_timer = 0
		//     end
	}

	// local player
	// core.register_globalstep(function(dtime)
	// 	for _,player in ipairs(core.get_connected_players()) do
	// 		manage_eating(player,dtime)
	// 	end
	// end)
}
