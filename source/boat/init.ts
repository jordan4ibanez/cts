namespace boat {
	// function lavaflow(): void {
	// pos = this.object.get_pos()
	// pos.y = pos.y + this.object.get_properties().collisionbox[2]
	// pos = vector.round(pos)
	// node = core.get_node(pos).name
	// node_above = core.get_node(vector.new(pos.x,pos.y+1,pos.z)).name
	// goalx = 0
	// goalz = 0
	// found = false
	// if node == "main:lavaflow" then
	// 	currentvel = this.object.get_velocity()
	// 	level = core.get_node_level(pos)
	// 	for x = -1,1 do
	// 		for z = -1,1 do
	// 			if found == false then
	// 				nodename = core.get_node(vector.new(pos.x+x,pos.y,pos.z+z)).name
	// 				level2 = core.get_node_level(vector.new(pos.x+x,pos.y,pos.z+z))
	// 				if level2 > level and nodename == "main:lavaflow" or nodename == "main:lava" then
	// 					goalx = -x
	// 					goalz = -z
	// 					//diagonal flow
	// 					if goalx ~= 0 and goalz ~= 0 then
	// 						found = true
	// 					end
	// 				end
	// 			end
	// 		end
	// 	end
	// 	//only add velocity if there is one
	// 	//else this stops the player
	// 	if goalx ~= 0 and goalz ~= 0 then
	// 		acceleration = vector.new(goalx-currentvel.x,0,goalz-currentvel.z)
	// 		this.object.add_velocity(acceleration)
	// 	elseif goalx ~= 0 or goalz ~= 0 then
	// 		acceleration = vector.new(goalx-currentvel.x,0,goalz-currentvel.z)
	// 		this.object.add_velocity(acceleration)
	// 	end
	// end
	// }

	// //core.get_node_level(pos)

	class BoatEntity extends types.Entity {
		name: string = "boat:boat";

		initial_properties = {
			hp_max: 1,
			physical: true,
			collide_with_objects: false,
			collisionbox: [-0.4, 0, -0.4, 0.4, 0.5, 0.4],
			visual: EntityVisual.mesh,
			mesh: "boat.x",
			textures: ["boat.png"],
			visual_size: vector.create3d({ x: 1, y: 1, z: 1 }),
			is_visible: true,
			automatic_face_movement_dir: -90.0,
			automatic_face_movement_max_rotation_per_sec: 600,
		};

		lag_check: number = 0;
		swimming: boolean = false;
		moving: boolean = false;
		on_land: boolean = false;
		rider: string | null = null;
		old_pos: Vec3 = vector.create3d();
		old_velocity: Vec3 = vector.create3d();


		// todo: boat???
		boat: boolean = true;

		get_staticdata(): string {
			return "";
		}

		on_activate(): void {
			this.object.set_armor_groups({ immortal: 1 });
			this.object.set_velocity(vector.create3d({ x: 0, y: 0, z: 0 }));
			this.object.set_acceleration(vector.create3d({ x: 0, y: 0, z: 0 }));
			this.lag_check = core.get_us_time() / 1000000;
			this.old_pos = this.object.get_pos()
			this.old_velocity = this.object.get_velocity();
		}

		on_punch(): void {
			const pos: Vec3 = this.object.get_pos();
			core.add_item(pos, "boat:boat");
			this.object.remove();
		}

		on_rightclick(clicker: ObjectRef): void {
			if (!clicker.is_player()) {
				return;
			}

			const player_name: string = clicker.get_player_name();

			if (this.rider != null && player_name == this.rider) {
				clicker.set_detach();
				const pos: Vec3 = this.object.get_pos();
				pos.y += 1;
				clicker.move_to(pos);
				clicker.add_velocity(vector.create3d(0, 11, 0));
				this.rider = null;
				playerAPI.player_is_attached(clicker, false);
				playerAPI.force_update_animation(clicker);
			} else if (this.rider == null) {
				this.rider = player_name;
				clicker.set_attach(
					this.object,
					"",
					vector.create3d({ x: 0, y: 2, z: 0 }),
					vector.create3d({ x: 0, y: 0, z: 0 })
				);
				playerAPI.set_player_animation(clicker, "sit", 0);
				playerAPI.player_is_attached(clicker, true);
			}
		}

		// Check if the boat is stuck on land.
		check_if_on_land(): void {
			const pos: Vec3 = this.object.get_pos();
			pos.y -= 0.37;
			const bottom_node: string = core.get_node(pos).name;
			if (
				bottom_node == "main:water" ||
				bottom_node == "main:waterflow" ||
				bottom_node == "air"
			) {
				this.on_land = false;
			} else {
				this.on_land = true;
			}
		}

		// Players drive the boat.
		drive(): void {
			if (this.rider == null) {
				this.moving = false;
				return;
			}

			const rider: ObjectRef | null = core.get_player_by_name(this.rider);

			if (rider == null) {
				this.rider = null;
				this.moving = false;
				return;
			}

			const move: boolean = rider.get_player_control().up;
			this.moving = false;

			if (!move) {
				return;
			}

			const currentvel: Vec3 = this.object.get_velocity();
			let goal: Vec3 = rider.get_look_dir();
			if (this.on_land) {
				goal = vector.multiply(goal, 1);
			} else {
				goal = vector.multiply(goal, 20);
			}
			let acceleration: Vec3 = vector.create3d(
				goal.x - currentvel.x,
				0,
				goal.z - currentvel.z
			);
			acceleration = vector.multiply(acceleration, 0.01);
			this.object.add_velocity(acceleration);
			this.moving = true;
		}
		// Players push boat.
		push(): void {
			const pos: Vec3 = this.object.get_pos();
			for (const [_, object] of ipairs(
				core.get_objects_inside_radius(pos, 1)
			)) {
				if (
					!object.is_player() ||
					object.get_player_name() != this.rider
				) {
					continue;
				}

				// Convert to 2d.
				const player_pos: Vec3 = object.get_pos();
				pos.y = 0;
				player_pos.y = 0;
				const currentvel: Vec3 = this.object.get_velocity();
				let vel: Vec3 = vector.subtract(pos, player_pos);
				vel = vector.normalize(vel);
				let distance: number = vector.distance(pos, player_pos);
				distance = (1 - distance) * 10;
				vel = vector.multiply(vel, distance);
				let acceleration: Vec3 = vector.create3d(
					vel.x - currentvel.x,
					0,
					vel.z - currentvel.z
				);
				this.object.add_velocity(acceleration);
				acceleration = vector.multiply(acceleration, -1);
				object.add_velocity(acceleration);
			}
		}

		// Makes the boat float.
		float(): void {
			const pos: Vec3 = this.object.get_pos();
			const node: string = core.get_node(pos).name;
			this.swimming = false;

			// Flow normally if floating else don't.
			if (node != "main:water" && node != "main:waterflow") {
				this.object.set_acceleration(vector.create3d(0, -10, 0));
				return;
			}

			this.object.set_acceleration(vector.create3d(0, 0, 0));
			this.swimming = true;
			const vel: Vec3 = this.object.get_velocity();
			const goal: number = 9;
			let acceleration: Vec3 = vector.create3d(0, goal - vel.y, 0);
			acceleration = vector.multiply(acceleration, 0.01);
			this.object.add_velocity(acceleration);

			// Unused code?
			//this.object.set_acceleration(vector.new(0,0,0))
		}

		// Slows the boat down.
		slowdown(): void {
			if (this.moving) {
				return;
			}
			const vel: Vec3 = this.object.get_velocity();
			const acceleration: Vec3 = vector.create3d(-vel.x, 0, -vel.z);
			const deceleration: Vec3 = vector.multiply(acceleration, 0.01);
			this.object.add_velocity(deceleration);
		}

		lag_correction(dtime: number): void {
			const pos: Vec3 = this.object.get_pos();
			const velocity: Vec3 = this.object.get_velocity();

			const chugent: number =
				core.get_us_time() / 1000000 - this.lag_check;
			// print("lag = " + chugent + " ms");

				if (chugent > 1 &&  this.old_pos && this.old_velocity) {
			// 		this.object.move_to(this.old_pos)
			// 		this.object.set_velocity(this.old_velocity)
				}

			// this.old_pos = pos
			// this.old_velocity = velocity
			// this.lag_check = core.get_us_time()/1000000
		}

		// 	flow = function(self)
		// 		local flow_dir = flow(this.object.get_pos())
		// 		if flow_dir then
		// 			flow_dir = vector.multiply(flow_dir,10)
		// 			local vel = this.object.get_velocity()
		// 			local acceleration = vector.new(flow_dir.x-vel.x,flow_dir.y-vel.y,flow_dir.z-vel.z)
		// 			acceleration = vector.multiply(acceleration, 0.01)
		// 			this.object.add_velocity(acceleration)
		// 		end
		// 	end,
		// 	on_step = function(self, dtime)
		// 		this.check_if_on_land(self)
		// 		this.push(self)
		// 		this.drive(self)
		// 		this.float(self)
		// 		this.flow(self)
		// 		this.slowdown(self)
		// 		this.lag_correction(self,dtime)
		// 	end,
	}

	// core.register_craftitem("boat:boat", {
	// 	description = "Boat",
	// 	inventory_image = "boatitem.png",
	// 	wield_image = "boatitem.png",
	// 	liquids_pointable = true,
	// 	on_place = function(itemstack, placer, pointed_thing)
	// 		if not pointed_thing.type == "node" then
	// 			return
	// 		end
	// 		local sneak = placer:get_player_control().sneak
	// 		local noddef = core.registered_nodes[core.get_node(pointed_thing.under).name]
	// 		if not sneak and noddef.on_rightclick then
	// 			core.item_place(itemstack, placer, pointed_thing)
	// 			return
	// 		end
	// 		core.add_entity(pointed_thing.above, "boat:boat")
	// 		itemstack:take_item()
	// 		return itemstack
	// 	end,
	// })
	// core.register_craft({
	// 	output = "boat:boat",
	// 	recipe = {
	// 		{"main:wood", "", "main:wood"},
	// 		{"main:wood", "main:wood", "main:wood"},
	// 	},
	// })
	// //////////////////////////////////
	// core.register_entity("boat:iron_boat", {
	// 	initial_properties = {
	// 		hp_max = 1,
	// 		physical = true,
	// 		collide_with_objects = false,
	// 		collisionbox = {-0.4, 0, -0.4, 0.4, 0.5, 0.4},
	// 		visual = "mesh",
	// 		mesh = "boat.x",
	// 		textures = {"iron_boat.png"},
	// 		visual_size = {x=1,y=1,z=1},
	// 		is_visible = true,
	// 		automatic_face_movement_dir = -90.0,
	// 		automatic_face_movement_max_rotation_per_sec = 600,
	// 	},
	// 	rider = nil,
	// 	iron_boat = true,
	// 	get_staticdata = function(self)
	// 		return core.serialize({
	// 			//itemstring = this.itemstring,
	// 		})
	// 	end,
	// 	on_activate = function(self, staticdata, dtime_s)
	// 		if string.sub(staticdata, 1, string.len("return")) == "return" then
	// 			local data = core.deserialize(staticdata)
	// 			if data and type(data) == "table" then
	// 				//this.itemstring = data.itemstring
	// 			end
	// 		else
	// 			//this.itemstring = staticdata
	// 		end
	// 		this.object.set_armor_groups({immortal = 1})
	// 		this.object.set_velocity({x = 0, y = 0, z = 0})
	// 		this.object.set_acceleration({x = 0, y = 0, z = 0})
	// 	end,
	// 	on_punch = function(self, puncher, time_from_last_punch, tool_capabilities, dir)
	// 		local pos = this.object.get_pos()
	// 		core.add_item(pos, "boat:iron_boat")
	// 		this.object.remove()
	// 	end,
	// 	on_rightclick = function(self,clicker)
	// 		if not clicker or not clicker:is_player() then
	// 			return
	// 		end
	// 		local player_name = clicker:get_player_name()
	// 		if this.rider and player_name == this.rider then
	// 			clicker:set_detach()
	// 			local pos = this.object.get_pos()
	// 			pos.y = pos.y + 1
	// 			clicker:move_to(pos)
	// 			clicker:add_player_velocity(vector.new(0,11,0))
	// 			this.rider = nil
	// 			player_is_attached(clicker,false)
	// 			force_update_animation(clicker)
	// 		elseif not this.rider then
	// 			this.rider = player_name
	// 			clicker:set_attach(this.object, "", {x=0, y=2, z=0}, {x=0, y=0, z=0})
	// 			set_player_animation(clicker,"sit",0)
	// 			player_is_attached(clicker,true)
	// 		end
	// 	end,
	// 	//check if the boat is stuck on land
	// 	check_if_on_land = function(self)
	// 		local pos = this.object.get_pos()
	// 		pos.y = pos.y - 0.37
	// 		local bottom_node = core.get_node(pos).name
	// 		if (bottom_node == "nether:lava" or bottom_node == "nether:lavaflow" or bottom_node == "air") then
	// 			this.on_land = false
	// 		else
	// 			this.on_land = true
	// 		end
	// 	end,
	// 	//players drive the baot
	// 	drive = function(self)
	// 		if this.rider and not this.on_land == true then
	// 			local rider = core.get_player_by_name(this.rider)
	// 			local move = rider:get_player_control().up
	// 			this.moving = nil
	// 			if move then
	// 				local currentvel = this.object.get_velocity()
	// 				local goal = rider:get_look_dir()
	// 				goal = vector.multiply(goal,20)
	// 				local acceleration = vector.new(goal.x-currentvel.x,0,goal.z-currentvel.z)
	// 				acceleration = vector.multiply(acceleration, 0.01)
	// 				this.object.add_velocity(acceleration)
	// 				this.moving = true
	// 			end
	// 		else
	// 			this.moving = nil
	// 		end
	// 	end,
	// 	//players push boat
	// 	push = function(self)
	// 		local pos = this.object.get_pos()
	// 		for _,object in ipairs(core.get_objects_inside_radius(pos, 1)) do
	// 			if object:is_player() and object:get_player_name() ~= this.rider then
	// 				local player_pos = object:get_pos()
	// 				pos.y = 0
	// 				player_pos.y = 0
	// 				local currentvel = this.object.get_velocity()
	// 				local vel = vector.subtract(pos, player_pos)
	// 				vel = vector.normalize(vel)
	// 				local distance = vector.distance(pos,player_pos)
	// 				distance = (1-distance)*10
	// 				vel = vector.multiply(vel,distance)
	// 				local acceleration = vector.new(vel.x-currentvel.x,0,vel.z-currentvel.z)
	// 				this.object.add_velocity(acceleration)
	// 				acceleration = vector.multiply(acceleration, -1)
	// 				object:add_player_velocity(acceleration)
	// 			end
	// 		end
	// 	end,
	// 	//makes the boat float
	// 	float = function(self)
	// 		local pos = this.object.get_pos()
	// 		local node = core.get_node(pos).name
	// 		this.swimming = false
	// 		//flow normally if floating else don't
	// 		if node == "nether:lava" or node =="nether:lavaflow" then
	// 			this.swimming = true
	// 			local vel = this.object.get_velocity()
	// 			local goal = 9
	// 			local acceleration = vector.new(0,goal-vel.y,0)
	// 			acceleration = vector.multiply(acceleration, 0.01)
	// 			this.object.add_velocity(acceleration)
	// 			//this.object.set_acceleration(vector.new(0,0,0))
	// 		else
	// 			local vel = this.object.get_velocity()
	// 			local goal = -9.81
	// 			local acceleration = vector.new(0,goal-vel.y,0)
	// 			acceleration = vector.multiply(acceleration, 0.01)
	// 			this.object.add_velocity(acceleration)
	// 			//this.object.set_acceleration(vector.new(0,0,0))
	// 		end
	// 	end,
	// 	//slows the boat down
	// 	slowdown = function(self)
	// 		if not this.moving == true then
	// 			local vel = this.object.get_velocity()
	// 			local acceleration = vector.new(-vel.x,0,-vel.z)
	// 			local deceleration = vector.multiply(acceleration, 0.01)
	// 			this.object.add_velocity(deceleration)
	// 		end
	// 	end,
	// 	lag_correction = function(self,dtime)
	// 		local pos = this.object.get_pos()
	// 		local velocity = this.object.get_velocity()
	// 		if this.lag_check then
	// 			local chugent = core.get_us_time()/1000000- this.lag_check
	// 			//print("lag = "+chugent+" ms")
	// 			if chugent > 70 and  this.old_pos and this.old_velocity then
	// 				this.object.move_to(this.old_pos)
	// 				this.object.set_velocity(this.old_velocity)
	// 			end
	// 		end
	// 		this.old_pos = pos
	// 		this.old_velocity = velocity
	// 		this.lag_check = core.get_us_time()/1000000
	// 	end,
	// 	on_step = function(self, dtime)
	// 		this.check_if_on_land(self)
	// 		this.push(self)
	// 		this.drive(self)
	// 		this.float(self)
	// 		lavaflow(self)
	// 		this.slowdown(self)
	// 		this.lag_correction(self,dtime)
	// 	end,
	// })
	// core.register_craftitem("boat:iron_boat", {
	// 	description = "Nether Iron Boat",
	// 	inventory_image = "iron_boatitem.png",
	// 	wield_image = "iron_boatitem.png",
	// 	liquids_pointable = true,
	// 	on_place = function(itemstack, placer, pointed_thing)
	// 		if not pointed_thing.type == "node" then
	// 			return
	// 		end
	// 		local sneak = placer:get_player_control().sneak
	// 		local noddef = core.registered_nodes[core.get_node(pointed_thing.under).name]
	// 		if not sneak and noddef.on_rightclick then
	// 			core.item_place(itemstack, placer, pointed_thing)
	// 			return
	// 		end
	// 		core.add_entity(pointed_thing.above, "boat:iron_boat")
	// 		itemstack:take_item()
	// 		return itemstack
	// 	end,
	// })
	// core.register_craft({
	// 	output = "boat:iron_boat",
	// 	recipe = {
	// 		{"main:iron", "main:coal", "main:iron"},
	// 		{"main:iron", "main:iron", "main:iron"},
	// 	},
	// })
}
