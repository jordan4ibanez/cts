namespace serverUtilities {
	const mod_storage: MetaRef = core.get_mod_storage();

	// local pool = {}

	const home_timeout: number = 60;

	// This does not terminate data because player's can spam
	// leave and come back in to reset the home timout.
	core.register_chatcommand("sethome", {
		params: "nil",
		description:
			"Use this to set your home. Can be returned to by setting /home",
		privs: {},
		func: (name) => {
			const time: number = core.get_us_time() / 1000000;
			const player: ObjectRef | null = core.get_player_by_name(name);

			if (player == null) {
				core.log(
					LogLevel.warning,
					`Player [${name}] ran command and instantly became null.`
				);
				return;
			}

			// 		local pos = player:get_pos()
			// 		if not pool[name] or pool[name] and time-pool[name] > home_timeout then
			// 			mod_storage:set_string(name+"home", core.serialize(pos))
			// 			pool[name] = time
			// 			core.chat_send_player(name, "Home set.")
			// 		elseif pool[name] then
			// 			local diff = home_timeout-math.ceil(time-pool[name])+1
			// 			local s = "s"
			// 			if diff == 1 then
			// 				s = ""
			// 			end
			// 			core.chat_send_player(name, diff+" more second"+s+" until you can run that command.")
			// 		end
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
