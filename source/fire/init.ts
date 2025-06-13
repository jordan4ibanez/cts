namespace fire {
	core.register_node("crafter_fire:fire", {
		description: "Fire",
		drawtype: Drawtype.firelike,
		tiles: [
			{
				name: "fire.png",
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 0.3,
				},
			},
		],
		inventory_image: "fire.png",
		groups: { dig_immediate: 1, fire: 1, hurt_inside: 1 },
		sounds: crafter.stoneSound(),
		floodable: true,
		drop: "",
		walkable: false,
		is_ground_content: false,
		light_source: 11,
		on_construct: (pos: Vec3) => {
			const under: string = core.get_node(
				vector.create3d(pos.x, pos.y - 1, pos.z)
			).name;
			// Makes nether portal.
			if (under == "nether:obsidian") {
				core.remove_node(pos);
				// Todo: depends on the nether mod.
				// create_nether_portal(pos)

				// Fire lasts forever on netherrack.
			} else if (under != "nether:netherrack") {
				const timer: NodeTimerObject = core.get_node_timer(pos);
				timer.start(math.random(0, 2) + math.random());
			}
		},

		on_timer: (pos: Vec3, elapsed: Number) => {
			const [find_flammable, _] = core.find_nodes_in_area(
				vector.subtract(pos, 1),
				vector.add(pos, 1),
				["group:flammable"]
			);
			// print(dump(find_flammable));

			for (const [_, p_pos] of ipairs(find_flammable)) {
				if (math.random() > 0.9) {
					core.set_node(p_pos, { name: "crafter_fire:fire" });
					const timer: NodeTimerObject = core.get_node_timer(p_pos);
					timer.start(math.random(0, 2) + math.random());
				}
			}
			if (math.random() > 0.85) {
				core.remove_node(pos);
			} else {
				const timer: NodeTimerObject = core.get_node_timer(pos);
				timer.start(math.random(0, 2) + math.random());
			}
		},
	});

	// Flint and steel.
	core.register_tool("crafter_fire:flint_and_steel", {
		description: "Flint and Steel",
		inventory_image: "flint_and_steel.png",
		tool_capabilities: {
			groupcaps: {
				_namespace_reserved: {
					times: { [1]: 5555 },
					uses: 0,
					maxlevel: 1,
				},
			},
		},
		groups: { flint: 1 },
		sound: { breaks: { name: "tool_break", gain: 0.4 } },
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		) => {
			if (
				pointed_thing.type != PointedThingType.node ||
				pointed_thing.above == null
			) {
				return;
			}
			if (core.get_node(pointed_thing.above).name != "air") {
				core.sound_play("flint_failed", { pos: pointed_thing.above });
				return;
			}
			// Can't make fire in the aether.
			if (pointed_thing.above.y >= 20000) {
				core.sound_play("flint_failed", {
					pos: pointed_thing.above,
					pitch: math.random(75, 95) / 100,
				});
				return;
			}
			core.add_node(pointed_thing.above, { name: "crafter_fire:fire" });
			core.sound_play("flint_and_steel", { pos: pointed_thing.above });
			itemstack.add_wear(100);
			return itemstack;
		},
	});

	core.register_craft({
		type: CraftRecipeType.shapeless,
		output: "crafter_fire:flint_and_steel",
		recipe: ["main:flint", "main:iron"],
	});

	// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// //fire object
	// local fire = {}
	// fire.initial_properties = {
	// 	hp_max = 1,
	// 	physical = false,
	// 	collide_with_objects = false,
	// 	collisionbox = {0, 0, 0, 0, 0, 0},
	// 	visual = "cube",
	// 	textures = {"nothing.png","nothing.png","fire.png","fire.png","fire.png","fire.png"},
	// 	visual_size = {x = 1, y = 1, z = 1},
	// 	//textures = {"nothing.png","nothing.png","fire.png","fire.png","fire.png","fire.png"},//, animation={type="vertical_frames", aspect_w=16, aspect_h=16, length=8.0}},
	// 	is_visible = true,
	// 	pointable = false,
	// }
	// fire.on_activate = function(self)
	// 	local texture_list = {
	// 		"nothing.png",
	// 		"nothing.png",
	// 		"fire.png^[opacity:180^[verticalframe:8:0",
	// 		"fire.png^[opacity:180^[verticalframe:8:0",
	// 		"fire.png^[opacity:180^[verticalframe:8:0",
	// 		"fire.png^[opacity:180^[verticalframe:8:0",
	// 	}
	// 	self.object:set_properties({textures=texture_list})
	// end
	// //animation stuff
	// fire.frame = 0
	// fire.frame_timer = 0
	// fire.frame_update = function(self)
	// 	self.frame = self.frame + 1
	// 	if self.frame > 7 then
	// 		self.frame = 0
	// 	end
	// 	local texture_list = {
	// 		"nothing.png",
	// 		"nothing.png",
	// 		"fire.png^[opacity:180^[verticalframe:8:"+self.frame,
	// 		"fire.png^[opacity:180^[verticalframe:8:"+self.frame,
	// 		"fire.png^[opacity:180^[verticalframe:8:"+self.frame,
	// 		"fire.png^[opacity:180^[verticalframe:8:"+self.frame,
	// 	}
	// 	self.object:set_properties({textures=texture_list})
	// end
	// fire.glow = -1
	// fire.timer = 0
	// fire.life = 0
	// fire.on_step = function(self,dtime)
	// 	if self.owner and (self.owner:is_player() or self.owner:get_luaentity()) then
	// 		if self.owner:is_player() and self.owner:get_hp() <= 0 then
	// 			put_fire_out(self.owner)
	// 		end
	// 		self.timer = self.timer + dtime
	// 		self.life = self.life + dtime
	// 		if self.life >= 7 then
	// 			put_fire_out(self.owner)
	// 			self.object:remove()
	// 			return
	// 		end
	// 		if self.timer >= 1 then
	// 			self.timer = 0
	// 			if self.owner:is_player() then
	// 				self.owner:set_hp(self.owner:get_hp()-1)
	// 			elseif self.owner:get_luaentity() then
	// 				self.owner:punch(self.object, 2,
	// 					{
	// 					full_punch_interval=0,
	// 					damage_groups = {damage=2},
	// 				})
	// 			end
	// 		end
	// 	else
	// 		self.object:remove()
	// 	end
	// 	self.frame_timer = self.frame_timer + dtime
	// 	if self.frame_timer >= 0.015 then
	// 		self.frame_timer = 0
	// 		self.frame_update(self)
	// 	end
	// end
	// core.register_entity("crafter_fire:fire",fire)
	// //fire handling
	// local pool = {}
	// local fire_channels = {}
	// local name
	// core.register_on_joinplayer(function(player)
	// 	name = player:get_player_name()
	// 	fire_channels[name] = core.mod_channel_join(name+":fire_state")
	// end)
	// local name
	// function is_player_on_fire(player)
	// 	return(pool[player:get_player_name()] ~= nil)
	// end
	// function is_entity_on_fire(object)
	// 	return(pool[object] ~= nil)
	// end
	// local name
	// local fire_obj
	// function start_fire(object)
	// 	if object:is_player() then
	// 		name = object:get_player_name()
	// 		if not pool[name] or pool[name] and not pool[name]:get_luaentity() then
	// 			fire_obj = core.add_entity(object:get_pos(),"crafter_fire:fire")
	// 			fire_obj:get_luaentity().owner = object
	// 			fire_obj:set_attach(object, "", vector.new(0,11,0),vector.new(0,0,0))
	// 			fire_obj:set_properties({visual_size=vector.new(1,2,1)})
	// 			pool[name] = fire_obj
	// 			fire_channels[name]:send_all("1")
	// 		elseif pool[name]:get_luaentity() then
	// 			pool[name]:get_luaentity().life = 0
	// 		end
	// 	elseif object and object:get_luaentity() then
	// 		if not object:get_luaentity().fire_entity or
	// 	object:get_luaentity().fire_entity and not object:get_luaentity().fire_entity:get_luaentity() then
	// 			object:get_luaentity().on_fire = true
	// 			fire_obj = core.add_entity(object:get_pos(),"crafter_fire:fire")
	// 			fire_obj:get_luaentity().owner = object
	// 			local entity_fire_def = object:get_luaentity().fire_table
	// 			fire_obj:set_attach(object, "", entity_fire_def.position,vector.new(0,0,0))
	// 			fire_obj:set_properties({visual_size=entity_fire_def.visual_size})
	// 			object:get_luaentity().fire_entity = fire_obj
	// 		else
	// 			object:get_luaentity().fire_entity:get_luaentity().life = 0
	// 		end
	// 	end
	// end
	// local name
	// local fire_obj
	// function put_fire_out(object)
	// 	if object:is_player() then
	// 		name = object:get_player_name()
	// 		if pool[name] then
	// 			fire_obj = pool[name]
	// 			if fire_obj:get_luaentity() then
	// 				fire_obj:remove()
	// 			end
	// 			pool[name] = nil
	// 			fire_channels[name]:send_all("0")
	// 			core.sound_play("fire_extinguish", {object=object,gain=0.3,pitch=math.random(80,100)/100})
	// 		end
	// 	elseif object and object:get_luaentity() then
	// 		if object:get_luaentity().fire_entity and object:get_luaentity().fire_entity:get_luaentity() then
	// 			object:get_luaentity().fire_entity:remove()
	// 		end
	// 		object:get_luaentity().on_fire = false
	// 		object:get_luaentity().fire_entity = nil
	// 		//core.sound_play("fire_extinguish", {object=object,gain=0.3,pitch=math.random(80,100)/100})
	// 	end
	// end
	// core.register_on_respawnplayer(function(player)
	// 	put_fire_out(player)
	// end)
}
