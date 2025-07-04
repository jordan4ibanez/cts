// todo: fix this disaster, why is this monolithic?
namespace playerMechanics {
	interface PlayerEnvironment {
		head: string;
		legs: string;
		under: string;
		swim_check: string;
		touch_hurt_ticker: number;
		hurt_inside_ticker: number;
		suffocation_ticker: number;
	}

	const pool = new Map<string, PlayerEnvironment>();

	export function get_player_head_env(player: ObjectRef): string {
		const name: string = player.get_player_name();
		const data: PlayerEnvironment | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.head;
	}

	export function get_player_legs_env(player: ObjectRef): string {
		const name: string = player.get_player_name();
		const data: PlayerEnvironment | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.legs;
	}

	export function player_under_check(player: ObjectRef): string {
		const name: string = player.get_player_name();
		const data: PlayerEnvironment | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.under;
	}

	export function player_swim_check(player: ObjectRef): boolean {
		const name: string = player.get_player_name();

		const data: PlayerEnvironment | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		const nodeDef = core.registered_nodes[data.swim_check];
		if (!nodeDef) {
			return false;
		}

		return nodeDef.walkable == false;
	}

	export function player_swim_under_check(player: ObjectRef): boolean {
		const name: string = player.get_player_name();

		const data: PlayerEnvironment | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		const nodeDef = core.registered_nodes[data.under];
		if (!nodeDef) {
			return false;
		}

		return nodeDef.walkable == false;
	}

	// Create blank list for player environment data.
	core.register_on_joinplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		pool.set(name, {
			under: "",
			legs: "",
			head: "",
			swim_check: "",
			touch_hurt_ticker: 0,
			hurt_inside_ticker: 0,
			suffocation_ticker: 0.5,
		});
	});

	// Destroy player environment data.
	core.register_on_leaveplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		pool.delete(name);
	});

	// Handle damage when touching node.
	// This is lua collision detection.
	// Damages players 4 times a second.
	function handle_touch_hurting(
		player: ObjectRef,
		damage: number,
		dtime: number
	) {
		const name: string = player.get_player_name();

		const data = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		let tick = data.touch_hurt_ticker;
		tick -= dtime;

		if (tick <= 0) {
			player.set_hp(player.get_hp() - damage);
			tick = 0.25;
		}
		data.touch_hurt_ticker = tick;
	}

	const a_min: Vec3 = vector.create3d();
	const a_max: Vec3 = vector.create3d();

	export function hurt_collide(player: ObjectRef, dtime: number): void {
		const name: string = player.get_player_name();
		if (player.get_hp() <= 0) {
			return;
		}
		// Used for finding a damage node from the center of the player.
		// Rudementary collision detection.
		const pos: Vec3 = player.get_pos();

		const cbox = player.get_properties().collisionbox;
		if (!cbox) {
			throw new Error("collisionbox for player became null.");
		}
		pos.y = pos.y + cbox[5] / 2;

		a_min.x = pos.x - 0.25;
		a_min.y = pos.y - 0.9;
		a_min.z = pos.z - 0.25;

		a_max.x = pos.x + 0.25;
		a_max.y = pos.y + 0.9;
		a_max.z = pos.z + 0.25;

		const [_, damage_nodes] = core.find_nodes_in_area(a_min, a_max, [
			"group:touch_hurt",
		]);

		const real_nodes: string[] = [];

		for (const [node_data, count] of Object.entries(damage_nodes)) {
			if (count && count > 0) {
				real_nodes.push(node_data);
			}
		}

		let hurt: number = 0;

		// Find the highest damage node.
		if (real_nodes.length > 0) {
			let damage_amount: number = 0;
			for (const node of real_nodes) {
				damage_amount = core.get_item_group(node, "touch_hurt");
				if (damage_amount > hurt) {
					hurt = damage_amount;
				}
			}
			handle_touch_hurting(player, hurt, dtime);
		} else {
			const data: PlayerEnvironment | undefined = pool.get(name);
			if (data == null) {
				throw new Error(
					`Player [${name}] was never added to the pool.`
				);
			}
			data.touch_hurt_ticker = 0;
		}
	}

	// Handle damage when inside node.
	// This is lua collision detection.
	// Damages players 4 times a second.
	function handle_hurt_inside(
		player: ObjectRef,
		damage: number,
		dtime: number
	): void {
		const name: string = player.get_player_name();

		const data: PlayerEnvironment | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		let tick: number = data.hurt_inside_ticker;
		tick -= dtime;

		if (tick <= 0) {
			player.set_hp(player.get_hp() - damage);
			tick = 0.5;
		}
		data.hurt_inside_ticker = tick;
	}

	function hurt_inside(player: ObjectRef, dtime: number): void {
		// todo: this is running EVERY server tick. This should be running every 0.5 server ticks.

		const name: string = player.get_player_name();
		if (player.get_hp() <= 0) {
			return;
		}
		// Used for finding a damage node from the center of the player.
		// Rudementary collision detection.
		const pos: Vec3 = player.get_pos();

		const cbox = player.get_properties().collisionbox;
		if (!cbox) {
			throw new Error("collisionbox for player became null.");
		}
		pos.y = pos.y + cbox[5] / 2;

		a_min.x = pos.x - 0.25;
		a_min.y = pos.y - 0.85;
		a_min.z = pos.z - 0.25;

		a_max.x = pos.x + 0.25;
		a_max.y = pos.y + 0.85;
		a_max.z = pos.z + 0.25;

		const [_, damage_nodes] = core.find_nodes_in_area(a_min, a_max, [
			"group:hurt_inside",
		]);

		const real_nodes: string[] = [];

		for (const [node_data, count] of Object.entries(damage_nodes)) {
			if (count && count > 0) {
				table.insert(real_nodes, node_data);
			}
		}

		let hurt: number = 0;
		// Find the highest damage node.
		if (real_nodes.length > 0) {
			let damage_amount: number = 0;
			for (const node of real_nodes) {
				// Allow players in an iron boat to be protected from lava.
				// The reason for this is: because I think that's kinda neat.
				if (core.get_item_group(node, "lava") > 1) {
					const [attachment] = player.get_attach();
					const entityName = attachment?.get_luaentity()?.name;
					if (entityName == "crafter_boat:iron_boat") {
						continue;
					}
				}
				damage_amount = core.get_item_group(node, "hurt_inside");
				if (damage_amount > hurt) {
					hurt = damage_amount;
				}
			}
			handle_hurt_inside(player, hurt, dtime);
		} else {
			const data: PlayerEnvironment | undefined = pool.get(name);
			if (data == null) {
				throw new Error(
					`Player [${name}] was never added to the pool.`
				);
			}
			data.hurt_inside_ticker = 0;
		}
	}

	// This handles lighting a player on fire.
	function start_fire(player: ObjectRef): void {
		const name: string = player.get_player_name();
		if (player.get_hp() <= 0) {
			return;
		}

		const pos: Vec3 = player.get_pos();

		// fixme: This was a nice global weather variable.
		// if (weather_type == 2) {

		//     const head_pos: Vec3 = vector.copy(pos);
		//     head_pos.y = head_pos.y + player.get_properties().collisionbox![5];
		//     const light: number | null = core.get_node_light(head_pos, 0.5);

		//     if (light && light == 15) {
		//         return;
		//     }
		// }

		// Used for finding a damage node from the center of the player.
		// Rudementary collision detection.
		const cbox = player.get_properties().collisionbox;
		if (!cbox) {
			throw new Error("collisionbox for player became null.");
		}
		pos.y = pos.y + cbox[5] / 2;

		a_min.x = pos.x - 0.25;
		a_min.y = pos.y - 0.85;
		a_min.z = pos.z - 0.25;

		a_max.x = pos.x + 0.25;
		a_max.y = pos.y + 0.85;
		a_max.z = pos.z + 0.25;

		const [_, damage_nodes] = core.find_nodes_in_area(a_min, a_max, [
			"group:fire",
		]);

		const real_nodes: string[] = [];

		for (const [node_data, count] of Object.entries(damage_nodes)) {
			if (count && count > 0) {
				real_nodes.push(node_data);
			}
		}

		if (real_nodes.length > 0) {
			fire.start_fire(player);
		}
	}

	// This handles extinguishing a fire.
	function extinguish(player: ObjectRef): void {
		const name: string = player.get_player_name();
		if (player.get_hp() <= 0) {
			return;
		}

		const pos: Vec3 = player.get_pos();

		// fixme: This was a nice global weather variable.
		// if (weather_type == 2) {
		// 	const head_pos: Vec3 = vector.copy(pos)
		// 	head_pos.y = head_pos.y + player.get_properties().collisionbox![5]
		// 	const light: number | null = core.get_node_light(head_pos, 0.5)
		// 	if (light && light == 15) {
		// 		put_fire_out(player)
		// 		return
		//     }
		// }

		// Used for finding a damage node from the center of the player.
		// Rudementary collision detection.
		const cbox = player.get_properties().collisionbox;
		if (!cbox) {
			throw new Error("collisionbox for player became null.");
		}
		pos.y = pos.y + cbox[5] / 2;

		a_min.x = pos.x - 0.25;
		a_min.y = pos.y - 0.85;
		a_min.z = pos.z - 0.25;

		a_max.x = pos.x + 0.25;
		a_max.y = pos.y + 0.85;
		a_max.z = pos.z + 0.25;

		const [_, damage_nodes] = core.find_nodes_in_area(a_min, a_max, [
			"group:extinguish",
		]);
		const real_nodes: string[] = [];

		for (const [node_data, count] of Object.entries(damage_nodes)) {
			if (count && count > 0) {
				real_nodes.push(node_data);
			}
		}

		if (real_nodes.length > 0) {
			fire.put_fire_out(player);
		}
	}

	// Handle player suffocating inside solid node.
	// Damages players 4 times a second.
	function handle_player_suffocation(player: ObjectRef, dtime: number): void {
		if (player.get_hp() <= 0) {
			return;
		}
		const name: string = player.get_player_name();
		const data: PlayerEnvironment | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		const headNode: string = data.head;

		if (core.registered_nodes[headNode]?.drawtype == Drawtype.normal) {
			data.suffocation_ticker -= dtime;
			if (data.suffocation_ticker <= 0) {
				player.set_hp(player.get_hp() - 1);
				data.suffocation_ticker += 0.5;
			}
		} else {
			data.suffocation_ticker = 0.5;
		}
	}

	// Environment indexing.

	// Creates data at specific points of the player.
	function index_players_surroundings(dtime: number) {
		for (const player of core.get_connected_players()) {
			const name: string = player.get_player_name();

			const data: PlayerEnvironment | undefined = pool.get(name);
			if (data == null) {
				throw new Error(
					`Player [${name}] was never added to the pool.`
				);
			}

			const pos: Vec3 = player.get_pos();

			const swimming: boolean = is_player_swimming(player);

			if (swimming) {
				// This is where the legs would be.
				data.under = core.get_node(pos).name;
				// Legs and head are in the same position.
				pos.y = pos.y + 1.35;
				data.legs = core.get_node(pos).name;
				data.head = core.get_node(pos).name;
				pos.y = pos.y + 0.7;
				data.swim_check = core.get_node(pos).name;
			} else {
				pos.y = pos.y - 0.1;
				data.under = core.get_node(pos).name;

				pos.y = pos.y + 0.6;
				data.legs = core.get_node(pos).name;

				pos.y = pos.y + 0.94;
				data.head = core.get_node(pos).name;
			}

			hurt_collide(player, dtime);

			hurt_inside(player, dtime);

			start_fire(player);

			if (fire.is_player_on_fire(player)) {
				extinguish(player);
			}
			handle_player_suffocation(player, dtime);
		}
	}

	// Insert all indexing data into main loop.
	core.register_globalstep((dtime: number) => {
		index_players_surroundings(dtime);
	});
}
