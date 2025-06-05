namespace experience {
	const mod_storage: MetaRef = core.get_mod_storage();

	// Minetest library.
	const get_node_or_nil = core.get_node_or_nil;
	const get_time = core.get_us_time;
	const get_player_by_name = core.get_player_by_name;
	const yaw_to_dir = core.yaw_to_dir;
	const dir_to_yaw = core.dir_to_yaw;
	const get_item_group = core.get_item_group;
	const serialize = core.serialize;
	const deserialize = core.deserialize;
	const play_sound = core.sound_play;

	// Vector library.
	const new_vec = vector.create3d;
	const vec_distance = vector.distance;
	const add_vec = vector.add;
	const multiply_vec = vector.multiply;
	const vec_direction = vector.direction;

	// Math library.
	const pi = math.pi;
	const random = math.random;
	const abs = math.abs;

	// String library.
	const s_sub = string.sub;
	const s_len = string.len;

	class ExpData {
		xp_level: number = 0;
		xp_bar: number = 0;
		buffer: number = 0;
		last_time: number = 0;
		constructor(player: ObjectRef) {
			const name = player.get_player_name();
			if (mod_storage.get_int(name + ":crafter_experience_save") > 0) {
				this.xp_level = mod_storage.get_int(
					name + ":crafter_experience_level"
				);
				this.xp_bar = mod_storage.get_int(
					name + ":crafter_experience_bar"
				);
			}
			this.last_time = get_time() / 1000000;
		}
	}

	const pool = new Map<string, ExpData>();

	// Loads data from mod storage.
	function load_data(player: ObjectRef) {
		pool.set(player.get_player_name(), new ExpData(player));
	}

	// Saves data to be utilized on next login.
	function save_data(name: string): void {
		const data: ExpData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		mod_storage.set_int(name + ":crafter_experience_level", data.xp_level);
		mod_storage.set_int(name + ":crafter_experience_bar", data.xp_bar);
		mod_storage.set_int(name + ":crafter_experience_save", 1);

		pool.delete(name);
	}

	// Saves specific users data for when they relog.
	core.register_on_leaveplayer((player: ObjectRef) => {
		save_data(player.get_player_name());
	});

	// Is used for shutdowns to save all data.
	function save_all(): void {
		for (const name of pool.keys()) {
			save_data(name);
		}
	}

	// Save all data to mod storage on shutdown.
	core.register_on_shutdown(() => {
		save_all();
	});

	export function get_player_xp_level(player: ObjectRef): number {
		const name: string = player.get_player_name();
		const data: ExpData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.xp_level;
	}

	export function set_player_xp_level(
		player: ObjectRef,
		level: number
	): void {
		const name: string = player.get_player_name();
		const data: ExpData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		data.xp_level = level;

		hudManager.change_hud({
			player: player,
			hudName: "xp_level_fg",
			element: "text",
			data: tostring(level),
		});

		hudManager.change_hud({
			player: player,
			hudName: "xp_level_bg",
			element: "text",
			data: tostring(level),
		});
	}

	core.hud_replace_builtin(HudReplaceBuiltinOption.health, {
		type: HudElementType.statbar,
		position: { x: 0.5, y: 1 },
		text: "heart.png",
		number: core.PLAYER_MAX_HP_DEFAULT,
		direction: 0,
		size: { x: 24, y: 24 },
		offset: { x: -10 * 24 - 25, y: -(48 + 24 + 38) },
	});

	core.register_on_joinplayer((player: ObjectRef) => {
		load_data(player);

		const name: string = player.get_player_name();
		const data: ExpData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		hudManager.add_hud(player, "heart_bar_bg", {
			type: HudElementType.statbar,
			position: { x: 0.5, y: 1 },
			text: "heart_bg.png",
			number: core.PLAYER_MAX_HP_DEFAULT,
			direction: 0,
			size: { x: 24, y: 24 },
			offset: { x: -10 * 24 - 25, y: -(48 + 24 + 38) },
		});

		hudManager.add_hud(player, "experience_bar_background", {
			type: HudElementType.statbar,
			position: { x: 0.5, y: 1 },
			name: "experience bar background",
			text: "experience_bar_background.png",
			number: 36,
			direction: 0,
			offset: { x: -8 * 28 - 29, y: -(48 + 24 + 16) },
			size: { x: 28, y: 28 },
			z_index: 0,
		});

		hudManager.add_hud(player, "experience_bar", {
			type: HudElementType.statbar,
			position: { x: 0.5, y: 1 },
			name: "experience bar",
			text: "experience_bar.png",
			number: data.xp_bar,
			direction: 0,
			offset: { x: -8 * 28 - 29, y: -(48 + 24 + 16) },
			size: { x: 28, y: 28 },
			z_index: 0,
		});

		hudManager.add_hud(player, "xp_level_bg", {
			type: HudElementType.text,
			position: { x: 0.5, y: 1 },
			name: "xp_level_bg",
			text: tostring(data.xp_level),
			number: 0x000000,
			offset: { x: 0, y: -(48 + 24 + 24) },
			z_index: 0,
		});

		hudManager.add_hud(player, "xp_level_fg", {
			type: HudElementType.text,
			position: { x: 0.5, y: 1 },
			name: "xp_level_fg",
			text: tostring(data.xp_level),
			number: 0xffffff,
			offset: { x: -1, y: -(48 + 24 + 25) },
			z_index: 0,
		});
	});

	function level_up_experience(player: ObjectRef): void {
		const name: string = player.get_player_name();
		const data: ExpData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		data.xp_level += 1;

		hudManager.change_hud({
			player: player,
			hudName: "xp_level_fg",
			element: "text",
			data: tostring(data.xp_level),
		});

		hudManager.change_hud({
			player: player,
			hudName: "xp_level_bg",
			element: "text",
			data: tostring(data.xp_level),
		});
	}

	function add_experience(player: ObjectRef, experience: number): void {
		const name: string = player.get_player_name();
		const data: ExpData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		data.xp_bar += experience;

		const time: number = get_time() / 1000000;

		if (data.xp_bar > 36) {
			if (time - data.last_time > 0.04) {
				play_sound("level_up", { gain: 0.2, to_player: name });
				data.last_time = time;
			}
			data.xp_bar -= 36;
			level_up_experience(player);
		} else {
			if (time - data.last_time > 0.01) {
				data.last_time = time;
				play_sound("experience", {
					gain: 0.1,
					to_player: name,
					pitch: random(75, 99) / 100,
				});
			}
		}
		hudManager.change_hud({
			player: player,
			hudName: "experience_bar",
			element: "number",
			data: data.xp_bar,
		});
	}

	// Reset player level.
	core.register_on_dieplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		const data: ExpData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		const xp_amount: number = data.xp_level;
		data.xp_bar = 0;
		data.xp_level = 0;

		hudManager.change_hud({
			player: player,
			hudName: "xp_level_fg",
			element: "text",
			data: tostring(data.xp_level),
		});

		hudManager.change_hud({
			player: player,
			hudName: "xp_level_bg",
			element: "text",
			data: tostring(data.xp_level),
		});

		hudManager.change_hud({
			player: player,
			hudName: "experience_bar",
			element: "number",
			data: data.xp_bar,
		});

		item_handling.throw_experience(player.get_pos(), xp_amount);
	});

	class ExperienceEntity extends types.Entity {
		name: string = "crafter_experience:orb";
		initial_properties = {
			hp_max: 1,
			physical: true,
			collide_with_objects: false,
			collisionbox: [-0.2, -0.2, -0.2, 0.2, 0.2, 0.2],
			visual: EntityVisual.sprite,
			visual_size: { x: 0.4, y: 0.4 },
			textures: {
				name: "experience_orb.png",
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 2.0,
				},
			},
			spritediv: { x: 1, y: 14 },
			initial_sprite_basepos: { x: 0, y: 0 },
			is_visible: true,
			pointable: false,
			static_save: false,
		};
		moving_state: boolean = true;
		slippery_state: boolean = false;
		physical_state: boolean = true;
		// Item expiry.
		age: number = 0;
		// Pushing item out of solid nodes.
		force_out: string | null = null;
		force_out_start: string | null = null;
		//Collection Variables
		collectable: boolean = false;
		try_timer: number = 0;
		collected: boolean = false;
		delete_timer: number = 0;
		radius: number = 4;
		collector: string | null = null;

		on_step(dtime: number) {
			// If orb set to be collected then only execute go to player.
			if (this.collected == true) {
				if (this.collector == null) {
					this.collected = false;
					return;
				}

				const collector: ObjectRef | null = get_player_by_name(
					this.collector
				);

				const pos: Vec3 = this.object.get_pos();

				if (
					collector &&
					collector.get_hp() > 0 &&
					vec_distance(pos, collector.get_pos()) < 5
				) {
					const data: ExpData | undefined = pool.get(this.collector);
					if (data == null) {
						throw new Error(
							`Player [${this.collector}] was never added to the pool.`
						);
					}

					this.object.set_acceleration(new_vec(0, 0, 0));

					// todo: enable this.
					// this.disable_physics(self)

					// Get the variables.

					const pos2: Vec3 = collector.get_pos();
					const player_velocity: Vec3 = collector.get_velocity();
					pos2.y += 0.8;
					const direction: Vec3 = vec_direction(pos, pos2);
					const distance: number = vec_distance(pos2, pos);
					let multiplier: number = distance;
					if (multiplier < 1) {
						multiplier = 1;
					}
					const goal: Vec3 = multiply_vec(direction, multiplier);
					const currentvel = this.object.get_velocity();

					if (distance > 1) {
						multiplier = 20 - distance;
						const velocity: Vec3 = multiply_vec(
							direction,
							multiplier
						);
						const goal: Vec3 = velocity;
						const acceleration: Vec3 = new_vec(
							goal.x - currentvel.x,
							goal.y - currentvel.y,
							goal.z - currentvel.z
						);
						this.object.add_velocity(
							add_vec(acceleration, player_velocity)
						);
					} else if (distance > 0.9 && data.buffer > 0) {
						data.buffer -= dtime;
						multiplier = 20 - distance;
						const velocity: Vec3 = multiply_vec(
							direction,
							multiplier
						);
						let goal: Vec3 = multiply_vec(
							yaw_to_dir(
								dir_to_yaw(
									vec_direction(
										new_vec(pos.x, 0, pos.z),
										new_vec(pos2.x, 0, pos2.z)
									)
								) +
									pi / 2
							),
							10
						);
						goal = add_vec(player_velocity, goal);
						const acceleration: Vec3 = new_vec(
							goal.x - currentvel.x,
							goal.y - currentvel.y,
							goal.z - currentvel.z
						);
						this.object.add_velocity(acceleration);
					}

					if (distance < 0.4 && data.buffer <= 0) {
						data.buffer = 0.04;
						print("adding 1");
						add_experience(collector, 2);
						this.object.remove();
					}
					return;
				} else {
					this.collector = null;

					// todo: enable this.
					// this.enable_physics(self)
				}
			}

			this.age += dtime;
			if (this.age > 300) {
				this.object.remove();
				return;
			}
			const pos: Vec3 = this.object.get_pos();

			const node: NodeTable | null = get_node_or_nil(
				new_vec({
					x: pos.x,
					y: pos.y - 0.25,
					z: pos.z,
				})
			);

			// Remove nodes in 'ignore' or unloaded areas.
			if (node == null || node.name == "ignore") {
				this.object.remove();
				return;
			}

			if (!this.physical_state) {
				// Don't do anything.
				return;
			}

			// Slide on slippery nodes.
			const vel: Vec3 = this.object.get_velocity();
			const def: NodeDefinition | undefined =
				core.registered_nodes[node.name];

			const is_moving: boolean =
				(def != null && !def.walkable) ||
				vel.x != 0 ||
				vel.y != 0 ||
				vel.z != 0;
			let is_slippery: boolean = false;
			if (def != null && def.walkable) {
				// 		slippery = get_item_group(node.name, "slippery")
				// 		is_slippery = slippery ~= 0
				// 		if is_slippery and (abs(vel.x) > 0.2 or abs(vel.z) > 0.2) then
				// 			// Horizontal deceleration
				// 			slip_factor = 4.0 / (slippery + 4)
				// 			this.object:set_acceleration({
				// 				x = -vel.x * slip_factor,
				// 				y = 0,
				// 				z = -vel.z * slip_factor
				// 			})
				// 		elseif vel.y == 0 then
				// 			is_moving = false
				// 		end
			}

			// 	if this.moving_state == is_moving and this.slippery_state == is_slippery then
			// 		// Do not update anything until the moving state changes
			// 		return
			// 	end
			// 	this.moving_state = is_moving
			// 	this.slippery_state = is_slippery
			// 	if is_moving then
			// 		this.object:set_acceleration({x = 0, y = -9.81, z = 0})
			// 	else
			// 		this.object:set_acceleration({x = 0, y = 0, z = 0})
			// 		this.object:set_velocity({x = 0, y = 0, z = 0})
			// 	end
		}

		// core.register_entity("experience:orb", {

		// 	on_activate = function(self, staticdata, dtime_s)
		// 		self.object:set_velocity(new_vec(
		// 			random(-2,2)*random(),
		// 			random(2,5),
		// 			random(-2,2)*random()
		// 		))
		// 		self.object:set_armor_groups({immortal = 1})
		// 		self.object:set_velocity({x = 0, y = 2, z = 0})
		// 		self.object:set_acceleration({x = 0, y = -9.81, z = 0})
		//         size = random(20,36)/100
		//         self.object:set_properties({
		// 			visual_size = {x = size, y = size},
		// 			glow = 14,
		// 		})
		// 		self.object:set_sprite({x=1,y=random(1,14)}, 14, 0.05, false)
		// 	end,
		// 	enable_physics = function(self)
		// 		if not self.physical_state then
		// 			self.physical_state = true
		// 			self.object:set_properties({physical = true})
		// 			self.object:set_velocity({x=0, y=0, z=0})
		// 			self.object:set_acceleration({x=0, y=-9.81, z=0})
		// 		end
		// 	end,
		// 	disable_physics = function(self)
		// 		if self.physical_state then
		// 			self.physical_state = false
		// 			self.object:set_properties({physical = false})
		// 			self.object:set_velocity({x=0, y=0, z=0})
		// 			self.object:set_acceleration({x=0, y=0, z=0})
		// 		end
		// 	end,
		// 	on_step = function(self, dtime)
		// 		xp_step(self, dtime)
		// 	end,
		// })
	}
	utility.registerTSEntity(ExperienceEntity);
	// core.register_chatcommand("xp", {
	// 	params = "nil",
	// 	description = "Spawn x amount of a mob, used as /spawn 'mob' 10 or /spawn 'mob' for one",
	// 	privs = {server=true},
	// 	func = function(name)
	// 		local player = get_player_by_name(name)
	// 		local pos = player:get_pos()
	// 		pos.y = pos.y + 1.2
	// 		core.throw_experience(pos, 1000)
	// 	end,
	// })
}
