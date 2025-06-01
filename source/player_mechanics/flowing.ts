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
					const c_flow: Vec3 = data;

					let acceleration: Vec3 | null = null;

					if (c_flow.x != 0) {
						acceleration = vector.create3d(c_flow.x, 0, 0);
					} else if (c_flow.z != 0) {
						acceleration = vector.create3d(0, 0, c_flow.z);
					}
					acceleration = acceleration as Vec3;

					acceleration = vector.multiply(acceleration, 0.075);
					player.add_velocity(acceleration);
					const newvel: Vec3 = player.get_velocity();
					if (newvel.x != 0 || newvel.z != 0) {
						continue;
					} else {
						pool.delete(name);
					}
				} else {
					const newFlow = vector.multiply(flow_dir, 10);
					let acceleration: Vec3 | null = null;
					if (newFlow.x != 0) {
						acceleration = vector.create3d(newFlow.x, 0, 0);
					} else if (newFlow.z != 0) {
						acceleration = vector.create3d(0, 0, newFlow.z);
					}
					acceleration = acceleration as Vec3;
					acceleration = vector.multiply(acceleration, 0.075);
					player.add_velocity(acceleration);
					pool.set(name, newFlow);
				}
			} else {
				pool.delete(name);
			}
		}
	});
	// todo: coal armor stops fire from hurting you
	// todo: also why is this todo here?
}
