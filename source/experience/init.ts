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

	
	// local function xp_step(self, dtime)
	// 	//if item set to be collected then only execute go to player
	// 	if self.collected == true then
	// 		if not self.collector then
	// 			self.collected = false
	// 			return
	// 		end
	// 		collector = get_player_by_name(self.collector)
	// 		if collector and collector:get_hp() > 0 and vec_distance(self.object:get_pos(),collector:get_pos()) < 5 then
	// 			temp_pool = pool[self.collector]
	// 			self.object:set_acceleration(new_vec(0,0,0))
	// 			self.disable_physics(self)
	// 			//get the variables
	// 			pos = self.object:get_pos()
	// 			pos2 = collector:get_pos()
	// 			player_velocity = collector:get_player_velocity()
	// 			pos2.y = pos2.y + 0.8
	// 			direction = vec_direction(pos,pos2)
	// 			distance = vec_distance(pos2,pos)
	// 			multiplier = distance
	// 			if multiplier < 1 then
	// 				multiplier = 1
	// 			end
	// 			goal = multiply_vec(direction,multiplier)
	// 			currentvel = self.object:get_velocity()
	// 			if distance > 1 then
	// 				multiplier = 20 - distance
	// 				velocity = multiply_vec(direction,multiplier)
	// 				goal = velocity
	// 				acceleration = new_vec(goal.x-currentvel.x,goal.y-currentvel.y,goal.z-currentvel.z)
	// 				self.object:add_velocity(add_vec(acceleration,player_velocity))
	// 			elseif distance > 0.9 and temp_pool.buffer > 0 then
	// 				temp_pool.buffer = temp_pool.buffer - dtime
	// 				multiplier = 20 - distance
	// 				velocity = multiply_vec(direction,multiplier)
	// 				goal = multiply_vec(yaw_to_dir(dir_to_yaw(vec_direction(new_vec(pos.x,0,pos.z),new_vec(pos2.x,0,pos2.z)))+pi/2),10)
	// 				goal = add_vec(player_velocity,goal)
	// 				acceleration = new_vec(goal.x-currentvel.x,goal.y-currentvel.y,goal.z-currentvel.z)
	// 				self.object:add_velocity(acceleration)
	// 			end
	// 			if distance < 0.4 and temp_pool.buffer <= 0 then
	// 				temp_pool.buffer = 0.04
	// 				add_experience(collector,2)
	// 				self.object:remove()
	// 			end
	// 			return
	// 		else
	// 			self.collector = nil
	// 			self.enable_physics(self)
	// 		end
	// 	end
	// 	self.age = self.age + dtime
	// 	if self.age > 300 then
	// 		self.object:remove()
	// 		return
	// 	end
	// 	pos = self.object:get_pos()
	// 	if pos then
	// 		node = get_node_or_nil({
	// 			x = pos.x,
	// 			y = pos.y -0.25,
	// 			z = pos.z
	// 		})
	// 	else
	// 		return
	// 	end
	// 	// Remove nodes in 'ignore'
	// 	if node and node.name == "ignore" then
	// 		self.object:remove()
	// 		return
	// 	end
	// 	if not self.physical_state then
	// 		return // Don't do anything
	// 	end
	// 	// Slide on slippery nodes
	// 	vel = self.object:get_velocity()
	// 	def = node and registered_nodes[node.name]
	// 	is_moving = (def and not def.walkable) or
	// 		vel.x ~= 0 or vel.y ~= 0 or vel.z ~= 0
	// 	is_slippery = false
	// 	if def and def.walkable then
	// 		slippery = get_item_group(node.name, "slippery")
	// 		is_slippery = slippery ~= 0
	// 		if is_slippery and (abs(vel.x) > 0.2 or abs(vel.z) > 0.2) then
	// 			// Horizontal deceleration
	// 			slip_factor = 4.0 / (slippery + 4)
	// 			self.object:set_acceleration({
	// 				x = -vel.x * slip_factor,
	// 				y = 0,
	// 				z = -vel.z * slip_factor
	// 			})
	// 		elseif vel.y == 0 then
	// 			is_moving = false
	// 		end
	// 	end
	// 	if self.moving_state == is_moving and self.slippery_state == is_slippery then
	// 		// Do not update anything until the moving state changes
	// 		return
	// 	end
	// 	self.moving_state = is_moving
	// 	self.slippery_state = is_slippery
	// 	if is_moving then
	// 		self.object:set_acceleration({x = 0, y = -9.81, z = 0})
	// 	else
	// 		self.object:set_acceleration({x = 0, y = 0, z = 0})
	// 		self.object:set_velocity({x = 0, y = 0, z = 0})
	// 	end
	// end
	// core.register_entity("experience:orb", {
	// 	initial_properties = {
	// 		hp_max = 1,
	// 		physical = true,
	// 		collide_with_objects = false,
	// 		collisionbox = {-0.2, -0.2, -0.2, 0.2, 0.2, 0.2},
	// 		visual = "sprite",
	// 		visual_size = {x = 0.4, y = 0.4},
	// 		textures = {name="experience_orb.png", animation={type="vertical_frames", aspect_w=16, aspect_h=16, length=2.0}},
	// 		spritediv = {x = 1, y = 14},
	// 		initial_sprite_basepos = {x = 0, y = 0},
	// 		is_visible = true,
	// 		pointable = false,
	// 		static_save = false,
	// 	},
	// 	moving_state = true,
	// 	slippery_state = false,
	// 	physical_state = true,
	// 	// Item expiry
	// 	age = 0,
	// 	// Pushing item out of solid nodes
	// 	force_out = nil,
	// 	force_out_start = nil,
	// 	//Collection Variables
	// 	collectable = false,
	// 	try_timer = 0,
	// 	collected = false,
	// 	delete_timer = 0,
	// 	radius = 4,
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
