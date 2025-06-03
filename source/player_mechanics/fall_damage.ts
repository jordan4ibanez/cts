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
		let [positions, _] = core.find_nodes_in_area(a_min, a_max, [
			"group:disable_fall_damage",
		]);

		return positions.length > 0 ? true : false;
	}

	function calc_fall_damage(player: ObjectRef, hp_change: number) {
		if (cancel_fall_damage(player)) {
			return;
		}

		const inv: InvRef = player.get_inventory();
		const stack: ItemStackObject = inv.get_stack("armor_feet", 1);
		const name: string = stack.get_name();
		if (name != "") {
			let absorption: number =
				core.get_item_group(name, "armor_level") * 2;

			//print("absorbtion:",absorption)

			const wear_level =
				(9 - core.get_item_group(name, "armor_level")) *
				8 *
				(5 - core.get_item_group(name, "armor_type")) *
				math.abs(hp_change);
			stack.add_wear(wear_level);
			inv.set_stack("armor_feet", 1, stack);
			const new_stack: string = inv.get_stack("armor_feet", 1).get_name();

			// Do boot absorbtion particles.
			{
				const pos: Vec3 = player.get_pos();
				core.add_particlespawner({
					amount: 30,
					time: 0.00001,
					minpos: vector.create3d({
						x: pos.x - 0.5,
						y: pos.y + 0.1,
						z: pos.z - 0.5,
					}),
					maxpos: vector.create3d({
						x: pos.x + 0.5,
						y: pos.y + 0.1,
						z: pos.z + 0.5,
					}),
					minvel: vector.create3d(-0.5, 1, -0.5),
					maxvel: vector.create3d(0.5, 2, 0.5),
					minacc: vector.create3d({ x: 0, y: -9.81, z: 1 }),
					maxacc: vector.create3d({ x: 0, y: -9.81, z: 1 }),
					minexptime: 0.5,
					maxexptime: 1.5,
					minsize: 0,
					maxsize: 0,
					//attached : player,
					collisiondetection: true,
					collision_removal: true,
					vertical: false,
					node: { name: name + "particletexture" },
					//texture = "eat_particles_1.png"
				});
			}

			// The boots broke.
			if (new_stack == "") {
				core.sound_play("armor_break", {
					object: player,
					gain: 1,
					pitch: math.random(80, 100) / 100,
				});

				armor.recalculate_armor(player);
				armor.set_armor_gui(player);

				// The boots survived and get a special sound.
			} else if (core.get_item_group(new_stack, "boots") > 0) {
				core.sound_play("armor_fall_damage", {
					object: player,
					gain: 1.0,
					max_hear_distance: 60,
					pitch: math.random(80, 100) / 100,
				});
			}

			hp_change += absorption;
			if (hp_change >= 0) {
				hp_change = 0;
			} else {
				player.set_hp(player.get_hp() + hp_change, {
					type: HPChangeReasonType.fall,
				});
				core.sound_play("hurt", {
					object: player,
					gain: 1.0,
					max_hear_distance: 60,
					pitch: math.random(80, 100) / 100,
				});
			}
		} else {
			player.set_hp(player.get_hp() + hp_change, {
				type: HPChangeReasonType.fall,
			});
			core.sound_play("hurt", {
				object: player,
				gain: 1.0,
				max_hear_distance: 60,
				pitch: math.random(80, 100) / 100,
			});
		}
	}

	const pool = new Map<string, number>();

	core.register_globalstep((dtime) => {
		for (const [_, player] of ipairs(core.get_connected_players())) {
			const name = player.get_player_name();
			const old_vel: number | undefined = pool.get(name);
			if (old_vel == null) {
				throw new Error(`Player [${name}] was never added to the pool`);
			}

			const new_vel: number = player.get_velocity().y;
			if (old_vel < -15 && new_vel >= -0.5) {
				// Don't do fall damage on unloaded areas.
				const pos: Vec3 = player.get_pos();
				pos.y = pos.y - 1;
				if (core.get_node_or_nil(pos) != null) {
					calc_fall_damage(player, math.ceil(old_vel + 14));
				}
			}

			pool.set(name, player.get_velocity().y);
		}
	});

	core.register_on_joinplayer((player: ObjectRef) => {
		pool.set(player.get_player_name(), player.get_velocity().y);
	});

	core.register_on_leaveplayer((player: ObjectRef) => {
		pool.delete(player.get_player_name());
	});

	// This disables normal fall damage.
	core.register_on_mods_loaded(() => {
		for (const [name, def] of pairs(core.registered_nodes)) {
			if (!def.groups) {
				throw new Error(`Node [${name}] has no groups.`);
			}
			def.groups["fall_damage_add_percent"] = -100;
			core.override_item(name, { groups: def.groups });
		}
	});
}
