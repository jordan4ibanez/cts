namespace fishing {
	const players_fishing = new Map<string, ObjectRef>();

	function fishingPoleUsage(
		itemstack: ItemStackObject,
		user: ObjectRef,
		pointed_thing: PointedThing
	): ItemStackObject | void {
		const name = user.get_player_name();
		const fishingLure: ObjectRef | undefined = players_fishing.get(name);

		if (fishingLure == null || fishingLure.get_luaentity() == null) {
			const pos: Vec3 = user.get_pos();

			pos.y += 1.625;

			const lureObject: ObjectRef | null = core.add_entity(
				pos,
				"crafter_fishing:lure"
			);
			if (lureObject == null) {
				core.log(
					LogLevel.warning,
					`Failed to add fishing lure to player [${name}]. ObjectRef is null.`
				);
				return;
			}

			const lureLuaEntity: FishingLure | null =
				lureObject.get_luaentity() as FishingLure | null;

			if (lureLuaEntity == null) {
				core.log(
					LogLevel.warning,
					`Failed to add fishing lure to player [${name}]. LuaEntity is null.`
				);
				return;
			}

			lureLuaEntity.player = name;

			core.sound_play("woosh", { pos: pos });

			const dir: Vec3 = user.get_look_dir();
			const force: Vec3 = vector.multiply(dir, 20);
			lureObject.set_velocity(force);

			players_fishing.set(name, lureObject);
		}
	}

	core.register_craftitem("crafter_fishing:pole", {
		description: "Fishing Pole",
		inventory_image: "fishing_rod.png",
		stack_max: 1,
		on_place: fishingPoleUsage,
		on_secondary_use: fishingPoleUsage,
	});

	core.register_craft({
		output: "crafter_fishing:pole",
		recipe: [
			["", "", "crafter:stick"],
			["", "crafter:stick", "crafter_mobs:string"],
			["crafter:stick", "", "crafter_mobs:string"],
		],
	});

	class FishingLure extends types.Entity {
		name: string = "crafter_fishing:lure";
		player: string | null = null;

		initial_properties = {
			physical : false,
			collide_with_objects : false,
			collisionbox : {-0.1, -0.1, -0.1, 0.1, 0.1, 0.1},
			visual : "sprite",
			visual_size : {x : 0.25, y : 0.25},
			textures : {"lure.png"},
			is_visible : true,
			pointable : false,
		// 	//glow : -1,
		// 	//automatic_face_movement_dir : 0.0,
		// 	//automatic_face_movement_max_rotation_per_sec : 600,
		}

		// lure.in_water = false
		// lure.interplayer = nil
		// lure.catch_timer = 0

		// lure.on_activate = function(self)
		// 	self.object:set_acceleration(vector.new(0,-10,0))
		// end

		// lure.on_step = function(self, dtime)
		// 	local pos = self.object:get_pos()
		// 	local node = core.get_node(pos).name
		// 	if node == "crafter:water" then
		// 		self.in_water = true
		// 		local new_pos = vector.floor(pos)
		// 		new_pos.y = new_pos.y + 0.5
		// 		self.object:move_to(vector.new(pos.x,new_pos.y,pos.z))
		// 		self.object:set_acceleration(vector.new(0,0,0))
		// 		self.object:set_velocity(vector.new(0,0,0))
		//     else
		//         local newp = table.copy(pos)
		//         newp.y = newp.y - 0.1
		//         local node = core.get_node(newp).name
		// 		if node ~= "air" and node ~= "crafter:water" and node ~= "crafter:waterflow" then
		//             if self.player then
		// 				players_fishing[self.player] = nil
		// 			end
		// 			core.sound_play("line_break",{pos=pos,gain=0.3})
		//             self.object:remove()
		//         end
		// 	end

		// 	if self.in_water == true then
		// 		if self.player then
		// 			local p = core.get_player_by_name(self.player)
		// 			if p:get_player_control().RMB then
		//                 local pos2 = p:get_pos()
		// 				local vel = vector.direction(vector.new(pos.x,0,pos.z),vector.new(pos2.x,0,pos2.z))
		// 				self.object:set_velocity(vector.multiply(vel,2))
		// 				self.catch_timer = self.catch_timer + dtime
		// 				if self.catch_timer >= 0.5 then
		// 					self.catch_timer = 0
		// 					if math.random() > 0.94 then
		// 						local obj = core.add_item(pos, "crafter_fishing:fish")
		// 						if obj then
		// 							local distance = vector.distance(pos,pos2)
		// 							local dir = vector.direction(pos,pos2)
		// 							local force = vector.multiply(dir,distance)
		// 							force.y = 6
		// 							obj:set_velocity(force)
		// 							core.sound_play("splash",{pos=obj:get_pos(),gain=0.25})
		// 						end
		// 						players_fishing[self.player] = nil
		// 						self.object:remove()
		// 					end
		//                 end
		// 			else
		// 				self.object:set_velocity(vector.new(0,0,0))
		// 			end
		//             if p then
		//                 local pos2 = p:get_pos()
		//                 if vector.distance(vector.new(pos.x,0,pos.z),vector.new(pos2.x,0,pos2.z)) < 1 then
		// 					players_fishing[self.player] = nil
		// 					core.sound_play("line_break",{pos=pos,gain=0.3,pitch=0.5})
		//                     self.object:remove()
		//                 end
		//             end
		// 		end
		// 	end
		// 	if self.player == nil then
		// 		self.object:remove()
		// 	end
		// end
	}

	// core.register_craft({
	// 	type = "cooking",
	// 	output = "crafter_fishing:fish_cooked",
	// 	recipe = "crafter_fishing:fish",
	// })
	// core.register_food("crafter_fishing:fish",{
	// 	description = "Raw Fish",
	// 	texture = "fish.png",
	// 	satiation=6,
	// 	hunger=3,
	// })
	// core.register_food("crafter_fishing:fish_cooked",{
	// 	description = "Cooked Fish",
	// 	texture = "fish_cooked.png",
	// 	satiation=22,
	// 	hunger=5,
	// })
}
