namespace playerMechanics {
	// local
	// minetest,vector,math,pairs
	// =
	// minetest,vector,math,pairs
	// local pool = {}
	// local legs
	// local flowing
	// local c_flow
	// local vel
	// local acceleration
	// local newvel
	// local flow_dir
	// local name

	const pool = new Map<string, Vec3>();

	core.register_globalstep(() => {
		for (const [_, player] of ipairs(core.get_connected_players())) {
			const flow_dir = flowLib.flow(player.get_pos());
			const name: string = player.get_player_name();
			if (flow_dir != null) {
				// Buffer continuation.

				let data: Vec3 | undefined = pool.get(name);

				if (data != null) {
					//                 c_flow = pool[name]
					//                 vel = player:get_player_velocity()
					//                 acceleration = nil
					//                 if c_flow.x ~= 0 then
					//                     acceleration = vector.new(c_flow.x,0,0)
					//                 elseif c_flow.z ~= 0 then
					//                     acceleration = vector.new(0,0,c_flow.z)
					//                 end
					//                 acceleration = vector.multiply(acceleration, 0.075)
					//                 player:add_player_velocity(acceleration)
					//                 newvel = player:get_player_velocity()
					//                 if newvel.x ~= 0 or newvel.z ~= 0 then
					//                     return
					//                 else
					//                     pool[name] = nil
					//                 end
				} else {
					//                 flow_dir = vector.multiply(flow_dir,10)
					//                 vel = player:get_player_velocity()
					//                 acceleration = nil
					//                 if flow_dir.x ~= 0 then
					//                     acceleration = vector.new(flow_dir.x,0,0)
					//                 elseif flow_dir.z ~= 0 then
					//                     acceleration = vector.new(0,0,flow_dir.z)
					//                 end
					//                 acceleration = vector.multiply(acceleration, 0.075)
					//                 player:add_player_velocity(acceleration)
					//                 pool[name] = flow_dir
				}
			} else {
				pool.delete(name);
			}
		}
	});
	// todo: coal armor stops fire from hurting you
	// todo: also why is this todo here?
}
