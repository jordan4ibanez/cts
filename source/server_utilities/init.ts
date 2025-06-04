namespace serverUtilities {
	const mod_storage: MetaRef = core.get_mod_storage();

	const timeout = 60;

	class HomeTimeout {
		setHome: number;
		home: number;
		constructor() {
			const currentTime = core.get_us_time() / 1000000;
			this.setHome = currentTime;
			this.home = currentTime;
		}
	}

	const pool = new Map<string, HomeTimeout>();

	core.register_on_joinplayer((player: ObjectRef) => {
		pool.set(player.get_player_name(), new HomeTimeout());
	});

	core.register_on_leaveplayer((player: ObjectRef) => {
		pool.delete(player.get_player_name());
	});

	core.register_chatcommand("sethome", {
		params: "nil",
		description:
			"Use this to set your home. Can be returned to by setting /home",
		privs: {},
		func: (name) => {
			const player: ObjectRef | null = core.get_player_by_name(name);

			if (player == null) {
				core.log(
					LogLevel.warning,
					`Player [${name}] ran command and instantly became null.`
				);
				return;
			}
			const data: HomeTimeout | undefined = pool.get(name);
			if (data == null) {
				throw new Error(
					`Player [${name}] was never added to the pool.`
				);
			}

			const time: number = core.get_us_time() / 1000000;
			const diff = timeout - math.ceil(time - data.setHome);

			const pos: Vec3 = player.get_pos();

			if (diff <= 0) {
				// 			mod_storage:set_string(name+"home", core.serialize(pos))
				// 			pool[name] = time
				// 			core.chat_send_player(name, "Home set.")
			} else {
				const s = diff == 1 ? "s" : "";
				core.chat_send_player(
					name,
					tostring(diff) +
						" more second" +
						s +
						" until you can run that command."
				);
			}
		},
	});
	// core.register_chatcommand("home", {
	// 	params = "nil",
	// 	description = "Use this to set your home. Can be returned to by setting /home",
	// 	privs = {},
	// 	func = function(name)
	// 		local time = core.get_us_time()/1000000
	// 		local player = core.get_player_by_name(name)
	// 		if not pool[name] or pool[name] and time-pool[name] > home_timeout then
	// 			local newpos = core.deserialize(mod_storage:get_string(name+"home"))
	// 			if newpos then
	// 				player:add_player_velocity(vector.multiply(player:get_player_velocity(),-1))
	// 				player:move_to(newpos)
	// 				pool[name] = time
	// 			else
	// 				core.chat_send_player(name, "No home set.")
	// 			end
	// 		elseif pool[name] then
	// 			local diff = home_timeout-math.ceil(time-pool[name])+1
	// 			local s = "s"
	// 			if diff == 1 then
	// 				s = ""
	// 			end
	// 			core.chat_send_player(name, diff+" more second"+s+" until you can run that command.")
	// 		end
	// 	end,
	// })
}
