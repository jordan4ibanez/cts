namespace bed {
	//? This depends on the crafter client mod.

	// const mod_storage: MetaRef = core.get_mod_storage();

	const timeNightBegin = 19000;
	const timeNightEnd = 5500;

	const sleep_channel = new Map<string, ModChannel>();

	interface SleepData {
		sleeping: boolean;
		pos: Vec3;
	}

	const pool = new Map<string, SleepData>();

	let sleep_loop: boolean = false;

	core.register_on_joinplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		sleep_channel.set(
			name,
			core.mod_channel_join(name + ":crafter_sleep_channel")
		);
	});

	function csm_send_player_to_sleep(player: ObjectRef): void {
		const name: string = player.get_player_name();
		const channel: ModChannel | undefined = sleep_channel.get(name);
		if (channel == null) {
			throw new Error(`Player [${name}] has no sleep channel.`);
		}
		channel.send_all("1");
	}

	function csm_wake_player_up(player: ObjectRef): void {
		const name: string = player.get_player_name();
		const channel: ModChannel | undefined = sleep_channel.get(name);
		if (channel == null) {
			throw new Error(`Player [${name}] has no sleep channel.`);
		}
		channel.send_all("0");
	}

	core.register_on_modchannel_message((channel_name, sender, message) => {
		const channel_decyphered: string = string.gsub(
			channel_name,
			sender,
			""
		)[0];
		if (channel_decyphered == ":crafter_sleep_channel") {
			const data: SleepData | undefined = pool.get(sender);
			if (!data) {
				throw new Error(
					`Player [${sender}] was never added to the pool`
				);
			}
			data.sleeping = true;
		}
	});

	function wake_up(player: ObjectRef): void {
		const name: string = player.get_player_name();
		playerAPI.player_is_sleeping(player, false);
		player.set_eye_offset(
			vector.create3d({ x: 0, y: 0, z: 0 }),
			vector.create3d({ x: 0, y: 0, z: 0 })
		);
		pool.delete(name);
		core.close_formspec(name, "bed");
		csm_wake_player_up(player);
	}

	function global_sleep_check(): void {
		sleep_loop = true;
		// core.chat_send_all("sleep looping" + tostring(math.random()));

		const sleep_table = new Set<string>();

		for (const [_, player] of ipairs(core.get_connected_players())) {
			const name: string = player.get_player_name();
			sleep_table.add(name);
		}

		let bed_count: number = 0;

		for (const [name, data] of pool) {
			if (typeof name != "string") {
				throw new Error("how");
			}
			const player: ObjectRef | null = core.get_player_by_name(name);
			if (player == null) {
				throw new Error("Null player in pool.");
			}
			bed_count += 1;
			if (data.sleeping) {
				sleep_table.delete(name);
			}
			player.move_to(data.pos);
		}
		let count: number = sleep_table.size;

		if (count == 0) {
			core.set_timeofday(timeNightEnd / 24000);
			for (const [_, player] of ipairs(core.get_connected_players())) {
				wake_up(player);
			}
			sleep_loop = false;
			return;
		}

		if (bed_count == 0) {
			sleep_loop = false;
		}
	}

	let global_step_timer: number = 0;
	core.register_globalstep((dtime: number) => {
		if (!sleep_loop) {
			global_step_timer = 0;
			return;
		}
		global_step_timer += dtime;
		if (global_step_timer < 0.25) {
			return;
		}
		global_step_timer = 0;
		global_sleep_check();
	});
	// Delete data on player leaving.

	core.register_on_leaveplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		pool.delete(name);
	});

	const bed_gui: string =
		"size[16,12]" +
		"position[0.5,0.5]" +
		"bgcolor[#00000000]" +
		"button[5.5,8.5;5,2;button;leave bed]";

	const yaw_translation: Dictionary<number, number> = {
		[0]: math.pi,
		[1]: math.pi / 2,
		[2]: 0,
		[3]: math.pi * 1.5,
	};

	function do_sleep(player: ObjectRef, pos: Vec3, dir: number): void {
		const time: number = core.get_timeofday() * 24000;
		const name: string = player.get_player_name();
		if (time < timeNightBegin && time > timeNightEnd) {
			core.chat_send_player(name, "You can only sleep at night");
			return;
		}
		const real_dir: Vec3 = core.facedir_to_dir(dir);
		player.add_velocity(vector.multiply(player.get_velocity(), -1));
		const new_pos: Vec3 = vector.subtract(pos, vector.divide(real_dir, 2));
		player.move_to(new_pos);
		player.set_look_vertical(0);
		const newYaw: number | undefined = yaw_translation[dir];
		if (newYaw == null) {
			throw new Error("Failure.");
		}
		player.set_look_horizontal(newYaw);
		core.show_formspec(name, "bed", bed_gui);
		playerAPI.player_is_sleeping(player, true);
		playerAPI.set_player_animation(player, "lay", 0, false);
		player.set_eye_offset(
			vector.create3d({ x: 0, y: -12, z: -7 }),
			vector.create3d({ x: 0, y: 0, z: 0 })
		);
		pool.set(name, { pos: new_pos, sleeping: false });
		csm_send_player_to_sleep(player);
		sleep_loop = true;
	}

	core.register_on_player_receive_fields(
		(player: ObjectRef, formname: string) => {
			if (formname == "bed") {
				wake_up(player);
			}
		}
	);

	core.register_on_respawnplayer((player: ObjectRef) => {
		wake_up(player);
	});

	// These are beds.
	core.register_node("crafter_bed:bed", {
		description: "Bed",
		inventory_image: "bed.png",
		wield_image: "bed.png",
		paramtype2: ParamType2.facedir,
		tiles: [
			"bed_top.png^[transform1",
			"wood.png",
			"bed_side.png",
			"bed_side.png^[transform4",
			"bed_front.png",
			"nothing.png",
		],
		groups: { wood: 1, hard: 1, axe: 1, hand: 3, instant: 1 },
		sounds: crafter.woodSound({ placing: "" }),
		drawtype: Drawtype.nodebox,
		node_placement_prediction: "",
		on_place: (itemstack, placer, pointed_thing) => {
			if (
				pointed_thing.type == PointedThingType.object ||
				pointed_thing.above == null ||
				pointed_thing.under == null
			) {
				return;
			}

			const sneak: boolean = placer.get_player_control().sneak;
			const noddef: NodeDefinition | undefined =
				core.registered_nodes[core.get_node(pointed_thing.under).name];

			if (!sneak && noddef?.on_rightclick) {
				core.item_place(itemstack, placer, pointed_thing);
				return;
			}
			const [_, pos] = core.item_place_node(
				ItemStack("crafter_bed:bed_front"),
				placer,
				pointed_thing
			);
			if (pos != null) {
				const param2: number = core.get_node(pos).param2 || 0;

				const pos2: Vec3 = vector.add(
					pos,
					vector.multiply(core.facedir_to_dir(param2), -1)
				);
				const buildable: boolean =
					core.registered_nodes[core.get_node(pos2).name]
						?.buildable_to || false;

				if (!buildable) {
					core.remove_node(pos);
					return itemstack;
				} else {
					core.add_node(pos2, {
						name: "crafter_bed:bed_back",
						param2: param2,
					});
					itemstack.take_item();
					core.sound_play("wood", {
						pos: pos,
					});
					return itemstack;
				}
			}
			return itemstack;
		},
	});

	core.register_node("crafter_bed:bed_front", {
		description: "Bed",
		paramtype: ParamType1.light,
		paramtype2: ParamType2.facedir,
		tiles: [
			"bed_top.png^[transform1",
			"wood.png",
			"bed_side.png",
			"bed_side.png^[transform4",
			"bed_front.png",
			"nothing.png",
		],
		groups: { wood: 1, hard: 1, axe: 1, hand: 3, instant: 1, bouncy: 50 },
		sounds: crafter.woodSound({ placing: "" }),
		drawtype: Drawtype.nodebox,
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				[-0.5, -5 / 16, -0.5, 0.5, 0.06, 0.5],
				[-0.5, -0.5, 0.5, -5 / 16, -5 / 16, 5 / 16],
				[0.5, -0.5, 0.5, 5 / 16, -5 / 16, 5 / 16],
			],
		},
		node_placement_prediction: "",
		drop: "crafter_bed:bed",
		on_dig: (pos, node, digger) => {
			const param2: number = core.get_node(pos).param2 || 0;
			let facedir: Vec3 = core.facedir_to_dir(param2);
			facedir = vector.multiply(facedir, -1);
			core.remove_node(pos);
			core.remove_node(vector.add(pos, facedir));
			//remove_spawnpoint(pos,digger)
			//remove_spawnpoint(vector.add(pos,facedir),digger)
			core.punch_node(vector.create3d(pos.x, pos.y + 1, pos.z));
		},

		on_rightclick: (pos, node, clicker, itemstack, pointed_thing) => {
			if (pos.y <= -10033) {
				// todo: depends on the tnt mod.
				// tnt(pos,10)
				return;
			}
			const param2: number = core.get_node(pos).param2 || 0;
			do_sleep(clicker, pos, param2);
		},
	});

	core.register_node("crafter_bed:bed_back", {
		description: "Bed",
		paramtype: ParamType1.light,
		paramtype2: ParamType2.facedir,
		tiles: [
			"bed_top_end.png^[transform1",
			"wood.png",
			"bed_side_end.png",
			"bed_side_end.png^[transform4",
			"nothing.png",
			"bed_end.png",
		],
		groups: { wood: 1, hard: 1, axe: 1, hand: 3, instant: 1, bouncy: 50 },
		sounds: crafter.woodSound(),
		drawtype: Drawtype.nodebox,
		node_placement_prediction: "",
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				[-0.5, -5 / 16, -0.5, 0.5, 0.06, 0.5],
				[-0.5, -0.5, -0.5, -5 / 16, -5 / 16, -5 / 16],
				[0.5, -0.5, -0.5, 5 / 16, -5 / 16, -5 / 16],
			],
		},
		drop: "",
		on_dig: (pos, node, digger) => {
			const param2: number = core.get_node(pos).param2 || 0;
			const facedir: Vec3 = core.facedir_to_dir(param2);
			core.remove_node(pos);
			core.remove_node(vector.add(pos, facedir));
			//remove_spawnpoint(pos,digger)
			//remove_spawnpoint(vector.add(pos,facedir),digger)
			core.punch_node(vector.create3d(pos.x, pos.y + 1, pos.z));
		},

		on_rightclick: (pos, node, clicker, itemstack, pointed_thing) => {
			if (pos.y <= -10033) {
				// todo: depends on the tnt mod.
				// tnt(pos,10)
				return;
			}
			const param2: number = core.get_node(pos).param2 || 0;
			const dir: Vec3 = core.facedir_to_dir(param2);
			do_sleep(clicker, vector.add(pos, dir), param2);
		},
	});

	core.register_craft({
		output: "crafter_bed:bed",
		recipe: [
			[
				"crafter:dropped_leaves",
				"crafter:dropped_leaves",
				"crafter:dropped_leaves",
			],
			["crafter:wood", "crafter:wood", "crafter:wood"],
		],
	});
}
