namespace playerAPI {
	// Todo: current animation enum.

	interface ApiPlayerData {
		visual: EntityVisual;
		mesh: string;
		animation_speed: number;
		visual_size: Vec3;
		textures: string[];
		current_animation: string;
		swimming: boolean;
		collisionbox: number[];
		old_controls: PlayerControlObject;
		stepheight: number;
		eye_height: number;
		attached: boolean;
		wield_item: ObjectRef | null;
		sleeping: boolean;
	}

	const pool = new Map<string, ApiPlayerData>();

	// Set player wield item.
	function update_wield_item(player: ObjectRef) {
		const name = player.get_player_name();

		const data: ApiPlayerData | undefined = pool.get(name);

		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		let object: ObjectRef | null = data.wield_item;
		const item: string = player.get_wielded_item().get_name();

		let entity;

		if (
			object == null ||
			(object != null && object.get_luaentity() == null)
		) {
			object = core.add_entity(player.get_pos(), "player_api:item");
			if (object == null) {
				core.log(
					LogLevel.warning,
					`Failed to add wield entity to player [${name}]. Bailing out.`
				);
				return;
			}
			entity = object.get_luaentity() as PlayerHoldingItemEntity | null;

			if (entity != null) {
				entity.set_item(item);
				// 			entity.wielder = name
				// 			object:set_attach(player, "Right_Hand", vector.new(0,0,0), vector.new(0,0,0))
				// 			temp_pool.wield_item = object
			} else {
				return; // catch it
			}
		}

		// 	entity = object:get_luaentity()

		// 	object_string = entity.itemstring

		// 	if object_string ~= item then
		// 		entity.itemstring = item
		// 		entity.set_item(entity,item)
		// 	end
	}

	// Easy way to allocate new players.
	function set_all_properties(player: ObjectRef) {
		const name = player.get_player_name();
		const newData: ApiPlayerData = {
			visual: EntityVisual.mesh,
			mesh: "player.b3d",
			animation_speed: 24,
			visual_size: vector.create3d({ x: 1, y: 1, z: 1 }),
			textures: ["player.png", "blank_skin.png"],
			current_animation: "stand",
			swimming: false,
			collisionbox: [-0.3, 0.0, -0.3, 0.3, 1.7, 0.3],
			old_controls: player.get_player_control(),
			stepheight: 0.6,
			eye_height: 1.47,
			attached: false,
			wield_item: null,
			sleeping: false,
		};

		player.set_properties({
			visual: newData.visual,
			mesh: newData.mesh,
			textures: newData.textures,
			collisionbox: newData.collisionbox,
			eye_height: newData.eye_height,
			stepheight: newData.stepheight,
			visual_size: newData.visual_size,
		});

		pool.set(name, newData);
	}

	// // easy way to set textures
	// local set_textures = function(player, textures)
	// 	player:set_properties({textures = textures})
	// end

	// local animation_list = {
	// 	stand            = { x = 5  , y = 5   },
	// 	lay              = { x = 162, y = 162 },
	// 	walk             = { x = 168, y = 187 },
	// 	mine             = { x = 189, y = 198 },
	// 	walk_mine        = { x = 200, y = 219 },
	// 	sit              = { x = 81 , y = 160 },
	// 	sneak            = { x = 60 , y = 60  },
	// 	sneak_mine_stand = { x = 20 , y = 30  },
	// 	sneak_walk       = { x = 60 , y = 80  },
	// 	sneak_mine_walk  = { x = 40 , y = 59  },
	// 	swim             = { x = 221, y = 241 },
	// 	swim_still       = { x = 226, y = 226 },
	// 	die              = { x = 242, y = 253 },
	// }

	// // easy way to set animation
	// local name
	// local temp_pool
	// local current_animation
	// local set_animation = function(player, animation_name, speed, loop)
	// 	name = player:get_player_name()
	// 	temp_pool = pool[name]
	// 	current_animation = temp_pool.animation
	// 	if current_animation == animation_name then
	// 		return
	// 	end
	// 	temp_pool.animation = animation_name
	// 	player:set_animation(animation_list[animation_name], speed, 0, loop)
	// end

	// // allows mods to force update animation
	// local name
	// force_update_animation = function(player)
	// 	name = player:get_player_name()
	// 	pool[name].force_update = true
	// end

	// // force updates the player
	// local name
	// local create_force_update = function(player)
	// 	name = player:get_player_name()
	// 	pool[name].force_update = true
	// end

	// // allows other mods to set animations per player
	// set_player_animation = function(player,animation,speed,loop)
	// 	set_animation(player, animation, speed, loop)
	// end

	// local name
	// player_is_attached = function(player,truth)
	// 	name = player:get_player_name()
	// 	pool[name].attached = truth
	// end

	// local name
	// get_if_player_attached = function(player)
	// 	name = player:get_player_name()
	// 	return(pool[name].attached)
	// end

	// local name
	// player_is_sleeping = function(player,truth)
	// 	name = player:get_player_name()
	// 	pool[name].sleeping = truth
	// end

	// local name
	// get_if_player_sleeping = function(player)
	// 	name = player:get_player_name()
	// 	return(pool[name].sleeping)
	// end

	// // toggles nametag visibility
	// local opacity
	// local show_nametag = function(player,boolean)
	// 	if boolean then
	// 		opacity = 255
	// 	else
	// 		opacity = 0
	// 	end
	// 	player:set_nametag_attributes({
	// 		color = {
	// 			r = 255,
	// 			b = 255,
	// 			a = opacity,
	// 			g = 255
	// 		}
	// 	})
	// end

	// // remove all player data
	// local name
	// core.register_on_leaveplayer(function(player)
	// 	name = player:get_player_name()
	// 	pool[name] = nil
	// end)

	// // converts yaw to degrees
	// local degrees = function(yaw)
	// 	return(yaw*180.0/math.pi)
	// end

	// // controls head bone
	// local state
	// local swimming
	// local pitch
	// local pitch_look = function(player,sneak)
	// 	state = get_player_state(player)
	// 	swimming = is_player_swimming(player)
	// 	pitch = degrees(player:get_look_vertical()) * -1
	// 	if swimming then
	// 		pitch = pitch + 90
	// 	elseif sneak then
	// 		pitch = pitch + 15
	// 	end
	// 	player:set_bone_position("Head", vector.new(0,6.3,0), vector.new(pitch,0,0))
	// end

	// // checks if the player has done anything with their keyboard/mouse
	// local name
	// local temp_pool
	// local old_control
	// local control_check = function(player,control_table)
	// 	name = player:get_player_name()
	// 	temp_pool = pool[name]
	// 	if not temp_pool.old_controls then
	// 		temp_pool.old_controls = control_table
	// 		return(true)
	// 	end
	// 	if temp_pool.force_update then
	// 		temp_pool.old_controls = control_table
	// 		return(true)
	// 	end
	// 	for i,k in pairs(temp_pool.old_controls) do
	// 		if control_table[i] ~= k then
	// 			temp_pool.old_controls = control_table
	// 			return(true)
	// 		end
	// 	end
	// 	temp_pool.old_controls = control_table
	// 	return(false)
	// end

	// // movement to animation translations
	// local translation_table = {
	// 	["walk"] = {
	// 		["keys"]    = { // required keys
	// 			up      = true,
	// 			down    = true,
	// 			left    = true,
	// 			right   = true,
	// 		},
	// 		["states" ] = { // states
	// 			[false] = { // mouse input
	// 				[0] = {animation = "walk", speed = 24},
	// 				[1] = {animation = "walk", speed = 36},
	// 				[2] = {animation = "walk", speed = 42},
	// 			},
	// 			[true ] = {
	// 				[0] = {animation = "walk_mine", speed = 24},
	// 				[1] = {animation = "walk_mine", speed = 36},
	// 				[2] = {animation = "walk_mine", speed = 42},
	// 			}
	// 		}
	// 	},
	// 	["sneak"] = {
	// 		["keys"]    = {
	// 			up      = true,
	// 			down    = true,
	// 			left    = true,
	// 			right   = true,
	// 		},
	// 		["states" ] = {
	// 			[true ] = { // moving
	// 				//mouse input
	// 				[false] = {animation = "sneak_walk"     , speed = 24},
	// 				[true ] = {animation = "sneak_mine_walk", speed = 24},
	// 			},
	// 			[false] = { // moving
	// 				//mouse input
	// 				[false] = {animation = "sneak"           , speed = 0 },
	// 				[true ] = {animation = "sneak_mine_stand", speed = 24},
	// 			}
	// 		}
	// 	},
	// 	["stand"]   = {
	// 		[true ] = {animation = "mine" , speed = 24},
	// 		[false] = {animation = "stand", speed = 0 },
	// 	},
	// 	["swim"] = {
	// 		["keys"]    = { // required keys
	// 			up      = true,
	// 			down    = true,
	// 			left    = true,
	// 			right   = true,
	// 		},
	// 		["states"]  = {
	// 			[true ] = {animation = "swim"      , speed = 24},
	// 			[false] = {animation = "swim_still", speed = 0 },
	// 		}
	// 	}
	// }

	// // translate input and combine with state
	// local name
	// local temp_pool
	// local state
	// //local swimming
	// local mouse
	// local translated
	// local control_translation = function(player,control)
	// 	name = player:get_player_name()
	// 	temp_pool = pool[name]
	// 	state = get_player_state(player)
	// 	swimming = is_player_swimming(player)
	// 	mouse = (control.LMB or control.RMB)
	// 	if swimming then
	// 		for k,i in pairs(control) do
	// 			if i and translation_table.swim.keys[k] then
	// 				translated = translation_table.swim.states[true]
	// 				set_animation(player, translated.animation, translated.speed)
	// 				return
	// 			end
	// 		end
	// 		translated = translation_table.swim.states[false]
	// 		set_animation(player, translated.animation, translated.speed)
	// 		return
	// 	else
	// 		if control.sneak then
	// 			for k,i in pairs(control) do
	// 				if i and translation_table.sneak.keys[k] then
	// 					translated = translation_table.sneak.states[true][mouse]
	// 					set_animation(player, translated.animation, translated.speed)
	// 					return
	// 				end
	// 			end
	// 			translated = translation_table.sneak.states[false][mouse]
	// 			set_animation(player, translated.animation, translated.speed)
	// 			return
	// 		else
	// 			for k,i in pairs(control) do
	// 				if i and translation_table.walk.keys[k] then
	// 					translated = translation_table.walk.states[mouse][state]
	// 					if translated then
	// 						set_animation(player, translated.animation, translated.speed)
	// 						return
	// 					end
	// 				end
	// 			end
	// 		end
	// 		translated = translation_table.stand[mouse]
	// 		set_animation(player, translated.animation, translated.speed)
	// 	end
	// end

	// // translates player movement to animation
	// local control_table
	// local update
	// local name
	// local temp_pool
	// local do_animations = function(player)
	// 	name = player:get_player_name()
	// 	temp_pool = pool[name]
	// 	control_table = player:get_player_control()
	// 	pitch_look(player,control_table.sneak)
	// 	if player:get_hp() <= 0 then
	// 		set_animation(player,"die",40,false)
	// 	elseif not temp_pool.sleeping and (not temp_pool.attached or not player:get_attach()) then
	// 		temp_pool.attached = false
	// 		update = control_check(player,control_table)
	// 		update_wield_item(player)
	// 		if update and player:get_hp() > 0 then
	// 			control_translation(player,control_table)
	// 		end
	// 	end
	// end

	// // Update appearance when the player joins
	// core.register_on_joinplayer(function(player)
	// 	set_all_properties(player)
	// end)

	// core.register_on_respawnplayer(function(player)
	// 	create_force_update(player)
	// end)

	// // inject into global loop
	// core.register_globalstep(function()
	// 	for _,player in ipairs(core.get_connected_players()) do
	// 		do_animations(player)
	// 	end
	// end)

	// local stack
	// local itemname
	// local def
	// local set_item = function(self, item)
	// 	stack = ItemStack(item or self.itemstring)
	// 	self.itemstring = stack:to_string()
	// 	itemname = stack:is_known() and stack:get_name() or "unknown"
	// 	def = core.registered_nodes[itemname]
	// 	self.object:set_properties({
	// 		textures = {itemname},
	// 		wield_item = self.itemstring,
	// 		glow = def and def.light_source,
	// 	})
	// end

	class PlayerHoldingItemEntity extends types.Entity {
		name: string = "player_api:item";
		set_item(item: string): void {}
	}

	// core.register_entity("player_api:item", {
	// 	initial_properties = {
	// 		hp_max           = 1,
	// 		visual           = "wielditem",
	// 		physical         = false,
	// 		textures         = {""},
	// 		automatic_rotate = 1.5,
	// 		is_visible       = true,
	// 		pointable        = false,
	// 		collide_with_objects = false,
	// 		collisionbox = {-0.21, -0.21, -0.21, 0.21, 0.21, 0.21},
	// 		selectionbox = {-0.21, -0.21, -0.21, 0.21, 0.21, 0.21},
	// 		visual_size  = {x = 0.21, y = 0.21},
	// 	},
	// 	itemstring = "",
	// 	set_item = set_item,
	// 	on_step = function(self, dtime)
	// 		if not self.wielder or (self.wielder and not core.get_player_by_name(self.wielder)) then
	// 			self.object:remove()
	// 		end
	// 	end,
	// })
}
