namespace serverUtilities {
	const mod_storage: MetaRef = core.get_mod_storage();

	const timeout = 3;

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

	const travelHomeQueue = new Map<string, number>();

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
			const data: HomeTimeout | undefined = pool.get(name);
			if (data == null) {
				throw new Error(
					`Player [${name}] was never added to the pool.`
				);
			}

			const time: number = core.get_us_time() / 1000000;
			const diff = timeout - math.ceil(time - data.setHome);

			data.setHome = time;

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
			}
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
			data.home = time;

			if (diff <= 0) {
				const serializedData: string = mod_storage.get_string(
					name + ":crafter_home"
				);
				if (serializedData == "") {
					core.chat_send_player(name, "No home set.");
					return;
				}

				const newpos: Vec3 | null = core.deserialize(
					serializedData
				) as Vec3 | null;

				if (newpos == null) {
					core.chat_send_player(name, "No home set.");
					return;
				}

				core.chat_send_player(name, "Sending you home.");

				player.add_velocity(vector.multiply(player.get_velocity(), -1));
				player.move_to(newpos);
			} else {
				const s = diff == 1 ? "" : "s";

				core.chat_send_player(
					name,
					diff +
						" more second" +
						s +
						" until you can run that command."
				);
			}
		},
	});

	core.register_globalstep((delta: number) => {
		if (travelHomeQueue.size == 0) {
			return;
		}
	});
}
