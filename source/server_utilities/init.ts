namespace serverUtilities {
	const mod_storage: MetaRef = core.get_mod_storage();

	const timeout = 30;

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

	class TravelNode {
		position: Vec3;
		timer: number = 3;
		constructor(player: ObjectRef) {
			this.position = player.get_pos();
		}
	}

	const travelHomeQueue = new Map<string, TravelNode>();

	core.register_chatcommand("sethome", {
		params: "nil",
		description:
			"Use this to set your home. Can be returned to by setting /home",
		privs: {},
		func: (name: string) => {
			const player: ObjectRef | null = core.get_player_by_name(name);

			if (player == null) {
				core.log(
					LogLevel.warning,
					`Player [${name}] ran command and instantly became null.`
				);
				return;
			}

			// Prevent any strange behavior.
			if (travelHomeQueue.has(name)) {
				core.chat_send_player(
					name,
					"You are currently in the travel queue. Cannot set home."
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

			if (diff <= 0) {
				const pos: Vec3 = player.get_pos();
				mod_storage.set_string(
					name + ":crafter_home",
					core.serialize(pos)
				);
				core.chat_send_player(name, "Home set.");
			} else {
				const s = diff == 1 ? "" : "s";
				core.chat_send_player(
					name,
					tostring(diff) +
						" more second" +
						s +
						" until you can run that command."
				);
				return;
			}

			data.setHome = time;
		},
	});

	core.register_chatcommand("home", {
		params: "nil",
		description:
			"Use this to go to your home. You can set your home by running /sethome",
		privs: {},
		func: (name: string) => {
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
			const diff = timeout - math.ceil(time - data.home);

			if (diff <= 0) {
				const serializedData: string = mod_storage.get_string(
					name + ":crafter_home"
				);
				if (serializedData == "") {
					core.chat_send_player(name, "No home set.");
					return;
				}

				// Prevent any strange behavior.
				if (travelHomeQueue.has(name)) {
					core.chat_send_player(
						name,
						"You are already in the travel queue."
					);
					return;
				}

				travelHomeQueue.set(name, new TravelNode(player));

				core.chat_send_player(
					name,
					`Traveling home. Stand still or this will cancel. In ${tostring(
						3
					)}...`
				);
			} else {
				const s = diff == 1 ? "" : "s";

				core.chat_send_player(
					name,
					diff +
						" more second" +
						s +
						" until you can run that command."
				);
				return;
			}

			data.home = time;
		},
	});

	const removalQueue: string[] = [];
	core.register_globalstep((delta: number) => {
		if (travelHomeQueue.size == 0) {
			return;
		}
		for (const [name, node] of travelHomeQueue) {
			const player: ObjectRef | null = core.get_player_by_name(name);

			// The player left.
			if (player == null) {
				removalQueue.push(name);
				continue;
			}

			if (!vector.equals(player.get_pos(), node.position)) {
				core.chat_send_player(
					name,
					"You moved. Travel home cancelled."
				);
				removalQueue.push(name);
				continue;
			}

			const oldTime = math.ceil(node.timer);
			node.timer -= delta;
			const newTime = math.ceil(node.timer);

			if (oldTime == newTime) {
				continue;
			}

			if (newTime == 0) {
				const serializedData: string = mod_storage.get_string(
					name + ":crafter_home"
				);
				// This is a double check.
				if (serializedData == "") {
					core.log(
						LogLevel.warning,
						`Player [${name}] was in queue with no home set.`
					);
					core.chat_send_player(
						name,
						"No home set. Report this bug."
					);
					continue;
				}
				const newpos: Vec3 | null = core.deserialize(
					serializedData
				) as Vec3 | null;
				if (newpos == null) {
					core.log(
						LogLevel.warning,
						`Player [${name}] was in queue with no home set.`
					);
					core.chat_send_player(
						name,
						"No home set. Report this bug."
					);
					continue;
				}
				// End double check.
				core.log(LogLevel.action, `Player [${name}] teleported home.`);
				core.chat_send_player(name, "Traveling home.");
				player.add_velocity(vector.multiply(player.get_velocity(), -1));
				player.move_to(newpos);
				removalQueue.push(name);
			} else {
				core.chat_send_player(
					name,
					`${tostring(math.abs(newTime))}...`
				);
			}
		}

		// Clear teleported players.
		if (removalQueue.length > 0) {
			while (removalQueue.length > 0) {
				const name: string | undefined = removalQueue.pop();
				if (name == null) {
					break;
				}
				travelHomeQueue.delete(name);
			}
		}
	});
}
