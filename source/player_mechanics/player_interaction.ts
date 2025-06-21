namespace playerMechanics {
	const add_item = core.add_item;
	const random = math.random;
	const play_sound = core.sound_play;
	const add_ps = core.add_particlespawner;
	const abs = math.abs;
	const ceil = math.ceil;
	const new_vec = vector.create3d;
	const multiply_vec = vector.multiply;

	// Hurt sound.
	core.register_on_player_hpchange((player, hp_change, reason) => {
		if (hp_change < 0) {
			play_sound("hurt", {
				object: player,
				gain: 1.0,
				max_hear_distance: 60,
				pitch: random(80, 100) / 100,
			});
		}
	}, false);

	// Throw all items on death.
	// local pos
	// local inv
	// local stack
	// local count
	// local obj
	// local name

	core.register_on_dieplayer(
		(player: ObjectRef, reason: HPChangeReasonDefinition) => {
			const pos: Vec3 = player.get_pos();
			const inv: InvRef | null = player.get_inventory();
			if (inv == null) {
				throw new Error("Not a player.");
			}
			for (const i of $range(1, inv.get_size("main"))) {
				const stack: ItemStackObject = inv.get_stack("main", i);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("main", i, ItemStack(""));
				}
			}

			{
				const stack: ItemStackObject = inv.get_stack("armor_head", 1);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("armor_head", 1, ItemStack(""));
				}
			}

			{
				const stack: ItemStackObject = inv.get_stack("armor_torso", 1);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("armor_torso", 1, ItemStack(""));
				}
			}
			{
				const stack: ItemStackObject = inv.get_stack("armor_legs", 1);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("armor_legs", 1, ItemStack(""));
				}
			}
			{
				const stack: ItemStackObject = inv.get_stack("armor_feet", 1);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("armor_feet", 1, ItemStack(""));
				}
			}

			dump_craft(player);

			armor.recalculate_armor(player);
		}
	);

	// This dumps the players crafting table on closing the inventory.
	export function dump_craft(player: ObjectRef): void {
		const pos: Vec3 = player.get_pos();
		const inv: InvRef | null = player.get_inventory();
		if (inv == null) {
			throw new Error("Not a player.");
		}
		for (const i of $range(1, inv.get_size("craft"))) {
			const stack: ItemStackObject = inv.get_stack("craft", i);
			const name: string = stack.get_name();
			if (name != "") {
				item_handling.throw_item(pos, stack);
				inv.set_stack("craft", i, ItemStack(""));
			}
		}
	}

	// Play sound to keep up with player's placing vs inconsistent client placing sound.
	core.register_on_placenode(
		(
			pos: Vec3,
			newnode: NodeTable,
			placer: ObjectRef | null,
			oldnode: NodeTable,
			itemstack: ItemStackObject,
			pointed_thing: PointedThing
		) => {
			const node: NodeDefinition | undefined =
				core.registered_nodes[newnode.name];
			if (node == null) {
				throw new Error(
					`Player [${
						(placer && placer.get_player_name()) || "server"
					}] placed a non-existent node [${newnode.name}]`
				);
			}

			const sound: NodeSoundSpec | undefined = node.sounds;

			let placing: string | SimpleSoundSpec | undefined = undefined;

			if (sound && sound.placing) {
				placing = sound.placing;
			}
			// Only play the sound when is defined.
			if (placing != null) {
				let finalSound: string = "";
				let finalGain = 1.0;
				if (typeof placing == "string") {
					finalSound = placing;
				} else if (placing.name) {
					finalSound = placing.name;
					if (placing.gain) {
						finalGain = placing.gain;
					}
				} else {
					core.log(
						LogLevel.warning,
						`Node [${newnode}] has a missing placing sound.`
					);
				}
				core.sound_play(finalSound, {
					pos: pos,
					gain: finalGain,
					max_hear_distance: 32,
					//pitch = math.random(60,100)/100
				});
			}
		}
	);

	// Replace stack when empty (building).
	core.register_on_placenode(
		(
			pos: Vec3,
			newnode: NodeTable,
			placer: ObjectRef | null,
			oldnode: NodeTable,
			itemstack: ItemStackObject,
			pointed_thing: PointedThing
		) => {
			const old: string = itemstack.get_name();

			// Pass through to check.
			core.after(
				0,
				(
					pos: Vec3,
					newnode: NodeTable,
					placer: ObjectRef | null,
					oldnode: NodeTable,
					itemstack: ItemStackObject,
					pointed_thing: PointedThing,
					old: string
				) => {
					if (placer == null || !placer.is_player()) {
						return;
					}
					let newItem = placer.get_wielded_item().get_name();
					if (old != newItem && newItem == "") {
						const inv: InvRef | null = placer.get_inventory();
						if (inv == null) {
							throw new Error("Not a player.");
						}
						// Check if another stack.
						if (inv.contains_item("main", old)) {
							// print("moving stack")
							// Run through inventory.

							for (const i of $range(1, inv.get_size("main"))) {
								// If found set wielded item and remove old stack.
								if (
									inv.get_stack("main", i).get_name() == old
								) {
									const count: number = inv
										.get_stack("main", i)
										.get_count();
									placer.set_wielded_item(
										ItemStack(old + " " + count)
									);
									inv.set_stack("main", i, ItemStack(""));
									play_sound("pickup", {
										to_player: placer.get_player_name(),
										gain: 0.7,
										pitch: random(60, 100) / 100,
									});
									return;
								}
							}
						}
					}
				},
				pos,
				newnode,
				placer,
				oldnode,
				itemstack,
				pointed_thing,
				old
			);
		}
	);

	function do_critical_particles(pos: Vec3): void {
		add_ps({
			amount: 40,
			time: 0.001,
			minpos: pos,
			maxpos: pos,
			minvel: new_vec(-2, -2, -2),
			maxvel: new_vec(2, 8, 2),
			minacc: vector.create3d({ x: 0, y: 4, z: 0 }),
			maxacc: vector.create3d({ x: 0, y: 12, z: 0 }),
			minexptime: 1.1,
			maxexptime: 1.5,
			minsize: 1,
			maxsize: 2,
			collisiondetection: false,
			vertical: false,
			texture: "critical.png",
		});
	}

	// Do this to override the default damage mechanics.
	const pool = new Map<string, number>();

	core.register_on_joinplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		pool.set(name, core.get_us_time() / 1000000);
	});

	core.register_on_leaveplayer((player: ObjectRef) => {
		pool.delete(player.get_player_name());
	});

	export function player_can_be_punched(player: ObjectRef): boolean {
		const name = player.get_player_name();
		const data: number | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return core.get_us_time() / 1000000 - data >= 0.5;
	}

	// This throws the player when they're punched and activates the custom damage mechanics.
	core.register_on_punchplayer(
		(
			player: ObjectRef,
			hitter: ObjectRef,
			time_from_last_punch: number,
			tool_capabilities: ToolCapabilities,
			dir: Vec3,
			damage: number
		) => {
			const name: string = player.get_player_name();

			let data: number | undefined = pool.get(name);
			if (data == null) {
				throw new Error(
					`Player [${name}] was never added to the pool.`
				);
			}

			const punch_diff: number = core.get_us_time() / 1000000 - data;

			let hurt: number | undefined =
				tool_capabilities.damage_groups?.damage;

			if (hurt == null) {
				hurt = 0;
			}
			const hp: number = player.get_hp();
			if (punch_diff < 0.5 || hp <= 0) {
				return;
			}

			data = core.get_us_time() / 1000000;

			if (hitter.is_player() && hitter != player) {
				const puncher_vel: number = hitter.get_velocity().y;
				if (puncher_vel < 0) {
					hurt *= 1.5;
					do_critical_particles(player.get_pos());
					play_sound("critical", {
						pos: player.get_pos(),
						gain: 0.1,
						max_hear_distance: 16,
						pitch: random(80, 100) / 100,
					});
				}
			}

			dir = multiply_vec(dir, 10);
			const vel: Vec3 = player.get_velocity();
			dir.y = 0;
			if (vel.y <= 0) {
				dir.y = 7;
			}

			const hp_modifier: number = ceil(
				armor.calculate_armor_absorbtion(player) / 3
			);
			//print("hp_modifier:",hp_modifier)
			armor.damage_armor(player, abs(hurt));
			//print("hurt:",hurt,"|","hp_modifier:",hp_modifier)
			const modify_output: boolean = hurt == 0;
			hurt -= hp_modifier;
			if (!modify_output && hurt <= 0) {
				hurt = 1;
			} else if (modify_output) {
				hurt = 0;
			}
			player.add_velocity(dir);
			player.set_hp(hp - hurt);
		}
	);

	core.register_on_respawnplayer((player) => {
		player.add_velocity(multiply_vec(player.get_velocity(), -1));
		const inv: InvRef | null = player.get_inventory();
		if (inv == null) {
			throw new Error("Not a player.");
		}
		inv.set_list("main", []);
		inv.set_list("craft", []);
		inv.set_list("craftpreview", []);
		inv.set_list("armor_head", []);
		inv.set_list("armor_torso", []);
		inv.set_list("armor_legs", []);
		inv.set_list("armor_feet", []);
	});
}
