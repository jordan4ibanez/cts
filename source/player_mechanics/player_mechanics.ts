namespace playerMechanics {
	// Holds every player's channel.
	const state_channels = new Map<string, ModChannel>();

	interface PlayerState {
		state: number;
		old_state: number;
		was_in_water: boolean;
		swimming: boolean;
		swim_bumped: number;
	}

	const pool = new Map<string, PlayerState>();

	// Creates specific channels for players.
	core.register_on_joinplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();

		state_channels.set(
			name,
			core.mod_channel_join(name + ":player_movement_state")
		);

		player.set_physics_override({
			jump: 1.25,
			gravity: 1.25,
		});

		const newData: PlayerState = {
			state: 0,
			old_state: 0,
			was_in_water: false,
			swimming: false,
			swim_bumped: core.get_us_time() / 1000000,
		};

		pool.set(name, newData);
	});

	// Resets the player's state on death.
	core.register_on_respawnplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		const data: PlayerState | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		data.state = 0;
		data.was_in_water = false;
		data.swim_bumped = core.get_us_time() / 1000000;

		send_running_cancellation(player, false);

		player.set_properties({
			collisionbox: [-0.3, 0.0, -0.3, 0.3, 1.7, 0.3],
		});
	});

	// Delete data on player leaving,
	core.register_on_leaveplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		pool.delete(name);
		{
			const channel: ModChannel | undefined = state_channels.get(name);
			if (channel == null) {
				throw new Error(
					`Player [${name}] was never given a mod channel.`
				);
			}
			channel.leave();
		}
		state_channels.delete(name);
	});

	// Tells the client to stop sending running/bunnyhop data.
	function send_running_cancellation(player: ObjectRef, sneaking: boolean) {
		const name: string = player.get_player_name();
		const channel: ModChannel | undefined = state_channels.get(name);
		if (channel == null) {
			throw new Error(`Player [${name}] was never given a mod channel.`);
		}
		channel.send_all(
			core.serialize({
				stop_running: true,
				state: sneaking,
			})
		);
	}

	// Intercept incoming data messages.
	core.register_on_modchannel_message(
		(channel_name: string, sender: string, message: string) => {
			const channel_decyphered: string = string.gsub(
				channel_name,
				sender,
				""
			)[0];

			if (
				sender != "" &&
				channel_decyphered == ":player_movement_state"
			) {
				const state: number | undefined = tonumber(message);

				if (typeof state == "number") {
					const data: PlayerState | undefined = pool.get(sender);
					if (data == null) {
						throw new Error(
							`Player [${sender}] was never added to the pool.`
						);
					}
					data.state = state;
				} else {
					core.log(
						LogLevel.warning,
						`Sender [${sender}] is sending malformed data.`
					);
				}
			}
		}
	);

	// These functions allow other mods to retrieve data for the game to use.

	export function get_player_state(player: ObjectRef): number {
		const name: string = player.get_player_name();
		const data: PlayerState | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.state;
	}

	export function is_player_swimming(player: ObjectRef): boolean {
		const name: string = player.get_player_name();
		const data: PlayerState | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.swimming;
	}

	// Controls player states.
	function control_state(player: ObjectRef) {
		// todo: this depends on crafter player api
		// if get_if_player_attached(player) {
		// 	return
		// }

		// todo: this depends on crafter hunger
		const hunger    = 0;//get_player_hunger(player)
		const name: string = player.get_player_name();
		const data: PlayerState | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		// Water movement data.
		const head: boolean =
			core.get_item_group(
				playerMechanics.get_player_head_env(player),
				"water"
			) > 0;

		const legs: boolean =
			core.get_item_group(get_player_legs_env(player), "water") > 0;

		// Check if in water.
		let in_water: boolean = data.swimming;

		if (head) {
			in_water = true;
			data.swimming = true;
		} else if (data.swimming == true) {
			let swim_unlock: boolean = player_swim_under_check(player);
			let swim_bump: boolean = player_swim_check(player);
			if (swim_unlock) {
				in_water = false;
				data.swimming = false;
				data.swim_bumped = core.get_us_time() / 1000000;
			} else if (
				swim_bump &&
				core.get_us_time() / 1000000 - data.swim_bumped > 1
			) {
				if (player.get_velocity().y <= 0) {
					data.swim_bumped = core.get_us_time() / 1000000;
					player.add_velocity(vector.create3d(0, 9, 0));
				}
			}
		}

		if ((in_water != data.was_in_water) ||
			(data.state != data.old_state) ||
			((data.state == 1 || data.state == 2) && hunger <= 6)) {
				if (! in_water && data.was_in_water) {
					player.set_physics_override({
						sneak   : true,
					})
					// todo: this depends on crafter player api.
					// force_update_animation(player)

					player.set_properties({
						collisionbox : [-0.3, 0.0, -0.3, 0.3, 1.7, 0.3],
					})
				} else if (in_water && ! data.was_in_water) {
					player.set_physics_override({
						sneak   : false,
					})
					// todo: this depends on crafter player api.
					// force_update_animation(player)

					player.set_properties({
						collisionbox : [-0.3, 0.8, -0.3, 0.3, 1.6, 0.3],
					})
					player.set_eye_offset(vector.create3d({x:0,y:0,z:0}),vector.create3d({x:0,y:0,z:0}))
				}
		
				// Running/swimming fov modifier.
				if (hunger > 6 && (data.state == 1 || data.state == 2)) {
		// 			player:set_fov(1.25, true, 0.15)
		// 			if temp_pool.state == 2 then
		// 				player:set_physics_override({speed=1.75})
		// 			elseif temp_pool.state == 1 then
		// 				player:set_physics_override({speed=1.5})
		// 			end

				} else if ((not in_water and temp_pool.state ~= 1 and temp_pool.state ~= 2 and
				(temp_pool.old_state == 1 or temp_pool.old_state == 2)) or
				(in_water and temp_pool.state ~= 1 and temp_pool.state ~= 2 and temp_pool.state ~= 3 and
				(temp_pool.old_state == 1 or temp_pool.old_state == 2 or temp_pool.old_state == 3))) {

		// 			player:set_fov(1, true,0.15)
		// 			player:set_physics_override({speed=1})
		// 			send_running_cancellation(player,temp_pool.state==3) //preserve network data
		// 		elseif (temp_pool.state == 1 or temp_pool.state == 2) and hunger <= 6 then
		// 			player:set_fov(1, true,0.15)
		// 			player:set_physics_override({speed=1})
		// 			send_running_cancellation(player,false) //preserve network data
		// 		end
		// 		//sneaking
		// 		if temp_pool.state == 3 and in_water then
		// 			//send_running_cancellation(player,false)
		// 		elseif not in_water and temp_pool.state == 3 and temp_pool.old_state ~= 3 then
		// 			player:set_eye_offset({x=0,y=-1,z=0},{x=0,y=0,z=0})
		// 		elseif not in_water and temp_pool.old_state == 3 and temp_pool.state ~= 3 then
		// 			player:set_eye_offset({x=0,y=0,z=0},{x=0,y=0,z=0})
		// 		end
		// 		temp_pool.old_state    = state
		// 		temp_pool.was_in_water = in_water
		// 	// water movement
			} else if (in_water) {
		// 		if not temp_pool.was_in_water then
		// 			player:set_physics_override({
		// 				sneak   = false ,
		// 			})
		// 		end
		// 		temp_pool.old_state    = temp_pool.old_state
		// 		temp_pool.was_in_water = in_water
			}
	}

	// core.register_globalstep(function(dtime)
	// 	for _,player in ipairs(core.get_connected_players()) do
	// 		control_state(player)
	// 	end
	// end)
}
