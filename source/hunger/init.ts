namespace hunger {
	const mod_storage: MetaRef = core.get_mod_storage();

	class HungerData {
		hunger: number = 20;
		satiation: number = 20;
		regeneration_interval: number = 0;
		exhaustion: number = 0;
		constructor(player: ObjectRef) {
			const name: string = player.get_player_name();
			if (mod_storage.get_int(name + "h_save") > 0) {
				this.hunger = mod_storage.get_int(name + "hunger");
				this.satiation = mod_storage.get_int(name + "satiation");
				this.exhaustion = mod_storage.get_int(name + "exhaustion");
				this.regeneration_interval = mod_storage.get_int(
					name + "regeneration_interval"
				);
			}
		}
	}

	const pool = new Map<string, HungerData>();

	// Loads data from mod storage.
	function load_data(player: ObjectRef): void {
		pool.set(player.get_player_name(), new HungerData(player));
	}

	// Saves data to be utilized on next login.
	function save_data(name: string): void {
		const data: HungerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		mod_storage.set_int(name + "hunger", data.hunger);
		mod_storage.set_int(name + "satiation", data.satiation);
		mod_storage.set_int(name + "exhaustion", data.exhaustion);
		mod_storage.set_int(
			name + "regeneration_interval",
			data.regeneration_interval
		);
		mod_storage.set_int(name + "h_save", 1);
		pool.delete(name);
	}

	// Is used for shutdowns to save all data.
	function save_all(): void {
		for (const name of pool.keys()) {
			save_data(name);
		}
	}

	// An easy translation pool.
	const satiation_pool: Dictionary<number, number> = {
		[0]: 1,
		[0.5]: 3,
		[1]: 6,
		[2]: 8,
		[3]: 1,
	};

	// Ticks up the exhaustion when counting down satiation.
	function tick_up_satiation(state: number, exhaustion: number): number {
		const sat: number | undefined = satiation_pool[state];
		if (sat == null) {
			throw new Error("out of range");
		}
		return exhaustion + sat;
	}

	// An easy translation pool.
	const hunger_pool: Dictionary<number, number> = {
		[0]: 1,
		[0.5]: 2,
		[1]: 3,
		[2]: 4,
		[3]: 1,
	};

	// Ticks up the exhaustion when counting down hunger.
	function tick_up_hunger(state: number, exhaustion: number): number {
		const hun: number | undefined = hunger_pool[state];
		if (hun == null) {
			throw new Error("out of range");
		}
		return exhaustion + hun;
	}

	// Allows other mods to set hunger data.
	export function get_player_hunger(player: ObjectRef) {
		const name = player.get_player_name();
		const data: HungerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.hunger;
	}

	// Saves specific users data for when they relog.
	core.register_on_leaveplayer((player: ObjectRef) => {
		save_data(player.get_player_name());
	});

	// Save all data to mod storage on shutdown.
	core.register_on_shutdown(() => {
		save_all();
	});

	// Create new data for hunger per player.

	core.register_on_joinplayer((player: ObjectRef) => {
		const name = player.get_player_name();
		load_data(player);

		const data: HungerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		hudManager.add_hud(player, "hunger_bg", {
			type: HudElementType.statbar,
			position: { x: 0.5, y: 1 },
			text: "hunger_icon_bg.png",
			number: 20,
			direction: 1,
			size: { x: 24, y: 24 },
			offset: { x: 24 * 10, y: -(48 + 24 + 39) },
		});

		hudManager.add_hud(player, "hunger", {
			type: HudElementType.statbar,
			position: { x: 0.5, y: 1 },
			text: "hunger_icon.png",
			number: data.hunger,
			direction: 1,
			size: { x: 24, y: 24 },
			offset: { x: 24 * 10, y: -(48 + 24 + 39) },
		});
	});

	// Resets the players hunger settings to max.
	core.register_on_respawnplayer((player) => {
		const name: string = player.get_player_name();
		const data: HungerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		data.hunger = 20;
		data.satiation = 20;
		data.regeneration_interval = 0;
		data.exhaustion = 0;

		hudManager.change_hud({
			player: player,
			hudName: "hunger",
			element: "number",
			data: data.hunger,
		});
	});

	const exhaustion_peak: number = 512;
	const hunger_peak: number = 128;

	function hunger_update(): void {
		for (const [_, player] of ipairs(core.get_connected_players())) {
			// Do not regen player's health if dead - // todo: this will be reused for 1up apples.
			if (player.get_hp() <= 0) {
				continue;
			}
			const name: string = player.get_player_name();
			const data: HungerData | undefined = pool.get(name);
			if (data == null) {
				throw new Error(
					`Player [${name}] was never added to the pool.`
				);
			}

			// Movement state.
			let state: number = playerMechanics.get_player_state(player);

			// If player is moving in state 0 add 0.5.
			if (state == 0) {
				const input: PlayerControlObject = player.get_player_control();
				if (
					input.jump ||
					input.right ||
					input.left ||
					input.down ||
					input.up
				) {
					state = 0.5;
				}
			}
			// Count down invisible satiation bar.
			if (data.satiation > 0 && data.hunger >= 20) {
				data.exhaustion = tick_up_satiation(state, data.exhaustion);
				if (data.exhaustion > exhaustion_peak) {
					data.satiation -= 1;
					data.exhaustion -= exhaustion_peak;
					// Reset this to use for the hunger tick.
					if (data.satiation == 0) {
						data.exhaustion = 0;
					}
				}
				// Count down hunger bars.
			} else if (data.hunger > 0) {
				data.exhaustion = tick_up_hunger(state, data.exhaustion);
				if (data.exhaustion >= hunger_peak) {
					// Don't allow hunger to go negative.
					if (data.hunger > 0) {
						data.exhaustion -= hunger_peak;
						data.hunger -= 1;
					}
					hudManager.change_hud({
						player: player,
						hudName: "hunger",
						element: "number",
						data: data.hunger,
					});
				}
				// Hurt the player if hunger bar empty.
			} else if (data.hunger <= 0) {
				data.exhaustion += 1;
				const hp: number = player.get_hp();
				if (hp > 0 && data.exhaustion >= 2) {
					player.set_hp(hp - 1);
					data.exhaustion = 0;
				}
			}
			const hp: number = player.get_hp();
			const isDrowning: boolean = drowning.is_player_drowning(player);
			// Make regeneration happen every second.
			if (
				/*// todo: depends on fire mod: !is_player_on_fire(player) &&*/
				!drowning &&
				data.hunger >= 20 &&
				hp < 20
			) {
				data.regeneration_interval += 1;
				if (data.regeneration_interval >= 2) {
					player.set_hp(hp + 1);
					data.exhaustion += 32;
					data.regeneration_interval = 0;
				}
				// Reset the regen interval.
			} else {
				data.regeneration_interval = 0;
			}
		}
	}

	let timeCalc = 0;
	core.register_globalstep((delta: number) => {
		timeCalc += delta;
		if (timeCalc < 0.5) {
			return;
		}
		timeCalc -= 0.5;
		hunger_update();
	});

	// Take away hunger and satiation randomly while mining.
	core.register_on_dignode(
		(pos: Vec3, oldnode: NodeTable, digger: ObjectRef) => {
			if (digger.is_player()) {
				const name = digger.get_player_name();
				const data: HungerData | undefined = pool.get(name);
				if (data == null) {
					throw new Error(
						`Player [${name}] was never added into the pool.`
					);
				}
				data.exhaustion += math.random(0, 2);
			}
		}
	);

	// Take the eaten food.
	function take_food(player: ObjectRef): void {
		const item: ItemStackObject = player.get_wielded_item();
		item.take_item();
		player.set_wielded_item(item);
	}

	// Players eat food.
	export function player_eat_food(player: ObjectRef, item: ItemStackObject) {
		const name: string = player.get_player_name();
		const data: HungerData | undefined = pool.get(name);

		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		const itemName = item.name;
		const satiation: number = core.get_item_group(itemName, "satiation");
		const hunger: number = core.get_item_group(itemName, "hunger");

		data.hunger += hunger;
		if (data.hunger > 20) {
			data.hunger = 20;
		}

		// Unlimited satiation.
		// This makes the game easier.
		data.satiation += satiation;
		take_food(player);
		hudManager.change_hud({
			player: player,
			hudName: "hunger",
			element: "number",
			data: data.hunger,
		});
	}

	// // easily allows mods to register food
	// core.register_food = function(name,def)
	// 	core.register_craftitem(":"+name, {
	// 		description = def.description,
	// 		inventory_image = def.texture,
	// 		groups = {satiation=def.satiation,hunger=def.hunger},
	// 	})
	// 	core.register_node(":"+name+"node", {
	// 		tiles = {def.texture},
	// 		drawtype = "allfaces",
	// 	})
	// end
	// core.register_chatcommand("hungry", {
	// 	params = "<mob>",
	// 	description = "A debug command to test food",
	// 	privs = {server = true},
	// 	func = function(name)
	// 		local temp_pool = pool[name]
	// 		temp_pool.exhaustion = 0
	// 		temp_pool.hunger     = 1
	// 		temp_pool.satiation  = 0
	// 		hud_manager.change_hud({
	// 			player    =  core.get_player_by_name(name) ,
	// 			hud_name  = "hunger",
	// 			element   = "number",
	// 			data      =  temp_pool.hunger
	// 		})
	// 	end
	// })
}
