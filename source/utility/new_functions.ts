// const minetest,math,vector,table = minetest,math,vector,table

namespace newFunctions {
	interface PType {
		head: string;
		legs: string;
		under: string;
		swim_check: string;
		touch_hurt_ticker: number;
		hurt_inside_ticker: number;
	}

	const pool = new Map<string, PType>();

	function triggerNullPtype(name: string): void {
		print(`warning: PType for ${name} was null. Fixing.`);
		pool.set(name, {
			under: "",
			legs: "",
			head: "",
			swim_check: "",
			touch_hurt_ticker: 0,
			hurt_inside_ticker: 0,
		});
	}

	export function get_player_head_env(player: ObjectRef): string | null {
		const name: string = player.get_player_name();
		const data: PType | undefined = pool.get(name);
		if (!data) {
			triggerNullPtype(name);
			return null;
		}
		return data.head;
	}

	export function get_player_legs_env(player: ObjectRef): string | null {
		const name: string = player.get_player_name();
		const data: PType | undefined = pool.get(name);
		if (!data) {
			triggerNullPtype(name);
			return null;
		}
		return data.legs;
	}

	export function player_under_check(player: ObjectRef): string | null {
		const name: string = player.get_player_name();
		const data: PType | undefined = pool.get(name);
		if (!data) {
			triggerNullPtype(name);
			return null;
		}
		return data.under;
	}

	export function player_swim_check(player: ObjectRef): boolean {
		const name: string = player.get_player_name();

		const data: PType | undefined = pool.get(name);
		if (!data) {
			triggerNullPtype(name);
			return false;
		}

		const nodeDef = core.registered_nodes[data.swim_check];
		if (!nodeDef) {
			return false;
		}

		return nodeDef.walkable == false;
	}

	export function player_swim_under_check(player: ObjectRef): boolean {
		const name: string = player.get_player_name();

		const data: PType | undefined = pool.get(name);
		if (!data) {
			triggerNullPtype(name);
			return false;
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
		if (!data) {
			triggerNullPtype(name);
			return;
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
			if (count > 0) {
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
			const data: PType | undefined = pool.get(name);
			if (!data) {
				triggerNullPtype(name);
				return;
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

		const data: PType | undefined = pool.get(name);
		if (!data) {
			triggerNullPtype(name);
			return;
		}

		let tick: number = data.hurt_inside_ticker;
		tick -= dtime;

		if (tick <= 0) {
			player.set_hp(player.get_hp() - damage);
			tick = 0.25;
		}
		data.hurt_inside_ticker = tick;
	}

	function hurt_inside(player: ObjectRef, dtime: number): void {
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
			if (count > 0) {
				table.insert(real_nodes, node_data);
			}
		}

		let hurt: number = 0;
		// Find the highest damage node.
		if (real_nodes.length > 0) {
			let damage_amount: number = 0;
			for (const node of real_nodes) {
				damage_amount = core.get_item_group(node, "hurt_inside");
				if (damage_amount > hurt) {
					hurt = damage_amount;
				}
			}
			handle_hurt_inside(player, hurt, dtime);
		} else {
			const data: PType | undefined = pool.get(name);
			if (!data) {
				triggerNullPtype(name);
				return;
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
			if (count > 0) {
				real_nodes.push(node_data);
			}
		}

		if (real_nodes.length > 0) {
			// fixme: call into the fire namespace. Also why is this even in here?
			// start_fire(player);
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
			if (count > 0) {
				real_nodes.push(node_data);
			}
		}

		if (real_nodes.length > 0) {
			// fixme: call into the fire namespace. Also why is this even in here?
			// put_fire_out(player)
		}
	}
	// --[[
	// -- handle player suffocating inside solid node
	// environment_class.handle_player_suffocation = function(player,dtime)
	// 	if player:get_hp() <= 0 then
	// 		return
	// 	end

	// 	local data = environment_class.get_data(player,{"head"})

	// 	if data then
	// 		data = data.head
	// 		if minetest.get_nodedef(data, "drawtype") == "normal" then
	// 			environment_class.handle_suffocation_hurt(player,1,dtime)
	// 		else
	// 			environment_class.set_data(player,{suffocation_ticker = 0})
	// 		end
	// 	end
	// end

	// -- damages players 4 times a second
	// environment_class.handle_suffocation_hurt = function(player,damage,dtime)
	// 	environment_class.tick = environment_class.get_data(player,{"suffocation_ticker"})
	// 	if environment_class.tick then
	// 		environment_class.tick = environment_class.tick.suffocation_ticker
	// 	end
	// 	if not environment_class.tick then
	// 		environment_class.set_data(player,{suffocation_ticker = 0.25})
	// 		player:set_hp(player:get_hp()-damage)
	// 	else
	// 		environment_class.tick = environment_class.tick - dtime
	// 		if environment_class.tick <= 0 then
	// 			player:set_hp(player:get_hp()-damage)
	// 			environment_class.set_data(player,{suffocation_ticker = 0.25})
	// 		else
	// 			environment_class.set_data(player,{suffocation_ticker = environment_class.tick})
	// 		end
	// 	end
	// end

	// ]]--

	// Environment indexing.

	// Creates data at specific points of the player.
	function index_players_surroundings(dtime: number) {
		for (const player of core.get_connected_players()) {
			const name: string = player.get_player_name();

			const data: PType | undefined = pool.get(name);
			if (!data) {
				triggerNullPtype(name);
				continue;
			}

			const pos: Vec3 = player.get_pos();

			// fixme: a nice global from...somwhere?
			// const swimming: boolean = is_player_swimming(player)

			// if swimming then
			// 	--this is where the legs would be
			// 	temp_pool.under = minetest.get_node(pos).name

			// 	--legs and head are in the same position
			// 	pos.y = pos.y + 1.35
			// 	temp_pool.legs = minetest.get_node(pos).name
			// 	temp_pool.head = minetest.get_node(pos).name

			// 	pos.y = pos.y + 0.7
			// 	temp_pool.swim_check = minetest.get_node(pos).name
			// else

			pos.y = pos.y - 0.1;
			data.under = core.get_node(pos).name;

			pos.y = pos.y + 0.6;
			data.legs = core.get_node(pos).name;

			pos.y = pos.y + 0.94;
			data.head = core.get_node(pos).name;
			// fixme: another part of the global if statement.
			//end

			hurt_collide(player, dtime);

			hurt_inside(player, dtime);

			start_fire(player);

			// fixme: not sure what's going on here
			// if is_player_on_fire(player) then
			// 	extinguish(player)
			// end
			// --handle_player_suffocation(player,dtime)
		}
	}

	// Insert all indexing data into main loop.
	core.register_globalstep((dtime: number) => {
		index_players_surroundings(dtime);
	});
}
