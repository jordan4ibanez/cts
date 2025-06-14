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
		item: string
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
			hunger.player_eat_food(player, item);
			core.sound_play("eat_finish", {
				object: player,
				gain: 0.025,
				pitch: math.random(60, 85) / 100,
			});
			return 0;
		}
		return timer;
	}

	function manage_eating(player: ObjectRef, dtime: number): void {
		const control: PlayerControlObject = player.get_player_control();
		const name: string = player.get_player_name();
		const data: FoodData | undefined = food_control_pool.get(name);

		if (data == null) {
			throw new Error(`Player [${name}] has no food data.`);
		}

		// Eating.
		if (control.RMB) {
			// Do not allow players to overfill hunger bar.
			if (hunger.get_player_hunger(player) >= 20) {
				data.eating_step = 0;
				data.eating_timer = 0;
				return;
			}

			const item: string = player.get_wielded_item().get_name();
			const satiation: number = core.get_item_group(item, "satiation");
			const itemHunger: number = core.get_item_group(item, "hunger");
			if (itemHunger > 0 || satiation > 0) {
				data.eating_step += dtime;
				data.eating_timer += dtime;
				data.eating_timer = manage_eating_effects(
					player,
					data.eating_timer,
					control.sneak,
					item
				);
				data.eating_step = finish_eating(player, data.eating_step);
			} else {
				data.eating_step = 0;
				data.eating_timer = 0;
			}
		} else {
			data.eating_step = 0;
			data.eating_timer = 0;
		}
	}

	core.register_globalstep((dtime) => {
		for (const [_, player] of ipairs(core.get_connected_players())) {
			manage_eating(player, dtime);
		}
	});
}
