// local minetest,math,vector,pairs,ItemStack,ipairs = minetest,math,vector,pairs,ItemStack,ipairs

namespace item_handling {
	utility.loadFiles(["magnet"]);

	const creative_mode: boolean =
		core.settings.get_bool("creative_mode") || false;

	// Handle node drops.

	//? Survival.

	if (!creative_mode) {
		core.handle_node_drops = (
			pos: Vec3,
			drops: (string | ItemStackObject)[],
			digger: ObjectRef
		) => {
			const meta: MetaRef = digger.get_wielded_item().get_meta();
			//careful = meta:get_int("careful")
			// todo: why is the fortune enchant disabled?
			const fortune: number = 1; //meta:get_int("fortune") + 1
			const autorepair: number = meta.get_int("autorepair");
			// todo: why is careful enchant disabled?
			//if careful > 0 then
			//	drops = {core.get_node(pos).name}
			//end

			let count: number = 0;
			let name: string | null = null;

			for (let i = 1; i <= fortune; i++) {
				for (const [_, item] of ipairs(drops)) {
					if (typeof item == "string") {
						count = 1;
						name = item;
					} else {
						count = item.get_count();
						name = item.get_name();
					}

					for (let i = 1; i <= count; i++) {
						const object: ObjectRef | null = core.add_item(
							pos,
							name
						);
						if (object != null) {
							object.set_velocity(
								vector.create3d({
									x: math.random(-2, 2) * math.random(),
									y: math.random(2, 5),
									z: math.random(-2, 2) * math.random(),
								})
							);
						}
					}
				}

				const experience_amount: number = core.get_item_group(
					core.get_node(pos).name,
					"experience"
				);
				if (experience_amount > 0) {
					throw_experience(pos, experience_amount);
				}
			}
			// Auto repair the item.
			if (autorepair > 0 && math.random(0, 1000) < autorepair) {
				const itemstack: ItemStackObject = digger.get_wielded_item();
				itemstack.add_wear(autorepair * -100);
				digger.set_wielded_item(itemstack);
			}
		};
		//creative
	} else {
		core.handle_node_drops = (pos, drops, digger) => {};
		core.register_on_dignode((pos, oldnode, digger) => {
			// todo: if the inventory doesn't contain this item and the wielded item is nothing, set the wielded item.
			//if digger and digger:is_player() then
			//	local inv = digger:get_inventory()
			//	if inv and not inv:contains_item("main", oldnode) and inv:room_for_item("main", oldnode) then
			//		inv:add_item("main", oldnode)
			//	end
			//end
		});
		core.register_on_placenode(
			(
				pos: Vec3,
				newnode: NodeTable,
				placer: ObjectRef,
				oldnode: NodeTable,
				itemstack: ItemStackObject,
				pointed_thing: PointedThing
			) => {
				return itemstack.get_name();
			}
		);
	}

	export function throw_item(
		pos: Vec3,
		item: string | ItemStackObject
	): ObjectRef | null {
		// Take item in any format
		const stack = item;
		const object: ObjectRef | null = core.add_entity(pos, "__builtin:item");
		if (object == null) {
			return null;
		}
		const entity = object.get_luaentity() as CrafterItemEntity;

		entity.set_item(stack);

		object.set_velocity(
			vector.create3d({
				x: math.random(-2, 2) * math.random(),
				y: math.random(2, 5),
				z: math.random(-2, 2) * math.random(),
			})
		);

		return object;
	}

	export function throw_experience(pos: Vec3, amount: number): void {
		for (let i = 1; i <= amount; i++) {
			const object: ObjectRef | null = core.add_entity(
				pos,
				"experience:orb"
			);
			if (object == null) {
				print(
					`warning: failed to add experience. [${core.pos_to_string(
						pos
					)}]`
				);
				continue;
			}
			object.set_velocity(
				vector.create3d({
					x: math.random(-2, 2) * math.random(),
					y: math.random(2, 5),
					z: math.random(-2, 2) * math.random(),
				})
			);
		}
	}

	// Override drops.
	core.item_drop = (
		itemstack: ItemStackObject,
		dropper: ObjectRef,
		pos: Vec3
	): [ItemStackObject, ObjectRef] | null => {
		const dropper_is_player: boolean =
			(dropper && dropper.is_player()) || false;
		const c_pos: Vec3 = vector.copy(pos);
		let count: number = 0;

		if (dropper_is_player) {
			const sneak: boolean = dropper.get_player_control().sneak;
			c_pos.y = c_pos.y + 1.2;
			if (!sneak) {
				count = itemstack.get_count();
			} else {
				count = 1;
			}
		} else {
			count = itemstack.get_count();
		}

		const item: ItemStackObject = itemstack.take_item(count);
		const object: ObjectRef | null = core.add_item(c_pos, item);

		if (!object) {
			print(`Warning: Failed to drop item at [${pos}]`);
			return null;
		}

		if (dropper_is_player) {
			let dir: Vec3 = dropper.get_look_dir();
			dir.x = dir.x * 2.9;
			dir.y = dir.y * 2.9 + 2;
			dir.z = dir.z * 2.9;
			dir = vector.add(dir, dropper.get_velocity());

			object.set_velocity(dir);

			(object.get_luaentity() as CrafterItemEntity).dropped_by =
				dropper.get_player_name();
			(object.get_luaentity() as CrafterItemEntity).collection_timer = 0;
		}
		return [itemstack, object];
	};

	export class CrafterItemEntity extends types.Entity {
		name: string = ":__builtin:item";
		itemstring: string = "";
		collector: string = "";
		dropped_by: string = "";
		moving_state = true;
		slippery_state = false;
		physical_state = true;
		// Item expiry
		age = 0;
		// Pushing item out of solid nodes
		force_out = null;
		force_out_start = null;
		// Collection Variables
		collection_timer = 2;
		collectable = false;
		try_timer = 0;
		collected = false;
		delete_timer = 0;
		// Used for server delay
		magnet_timer = 0;
		poll_timer = 0;
		initial_properties = {
			hp_max: 1,
			visual: EntityVisual.wielditem,
			physical: true,
			textures: [""],
			automatic_rotate: 1.5,
			is_visible: true,
			pointable: false,
			collide_with_objects: false,
			collisionbox: [-0.21, -0.21, -0.21, 0.21, 0.21, 0.21],
			selectionbox: [-0.21, -0.21, -0.21, 0.21, 0.21, 0.21],
			visual_size: vector.create2d(0.21, 0.21),
		};
		set_item(input: string | ItemStackObject) {}
	}

	// local stack
	// local itemname
	// local def
	// local set_item = function(self, item)
	// 	stack = ItemStack(item or self.itemstring)
	// 	self.itemstring = stack:to_string()
	// 	if self.itemstring == "" then
	// 		// item not yet known
	// 		return
	// 	end

	// 	itemname = stack:is_known() and stack:get_name() or "unknown"

	// 	def = core.registered_nodes[itemname]

	// 	self.object:set_properties({
	// 		textures = {itemname},
	// 		wield_item = self.itemstring,
	// 		glow = def and def.light_source,
	// 	})
	// end

	// local get_staticdata = function(self)
	// 	return core.serialize({
	// 		itemstring = self.itemstring,
	// 		age = self.age,
	// 		dropped_by = self.dropped_by,
	// 		collection_timer = self.collection_timer,
	// 		collectable = self.collectable,
	// 		try_timer = self.try_timer,
	// 		collected = self.collected,
	// 		delete_timer = self.delete_timer,
	// 		collector = self.collector,
	// 		magnet_timer = self.magnet_timer,
	// 	})
	// end

	// local data
	// local on_activate = function(self, staticdata, dtime_s)
	// 	if string.sub(staticdata, 1, string.len("return")) == "return" then
	// 		data = core.deserialize(staticdata)
	// 		if data and type(data) == "table" then
	// 			self.itemstring = data.itemstring
	// 			self.age = (data.age or 0) + dtime_s
	// 			self.dropped_by = data.dropped_by
	// 			self.magnet_timer = data.magnet_timer
	// 			self.collection_timer = data.collection_timer
	// 			self.collectable = data.collectable
	// 			self.try_timer = data.try_timer
	// 			self.collected = data.collected
	// 			self.delete_timer = data.delete_timer
	// 			self.collector = data.collector
	// 		end
	// 	else
	// 		self.itemstring = staticdata
	// 	end
	// 	self.object:set_armor_groups({immortal = 1})
	// 	self.object:set_velocity({x = 0, y = 2, z = 0})
	// 	self.object:set_acceleration({x = 0, y = -9.81, z = 0})
	// 	set_item(self,self.itemstring)
	// end

	// local enable_physics = function(self)
	// 	if not self.physical_state then
	// 		self.physical_state = true
	// 		self.object:set_properties({physical = true})
	// 		self.object:set_velocity({x=0, y=0, z=0})
	// 		self.object:set_acceleration({x=0, y=-9.81, z=0})
	// 	end
	// end

	// local disable_physics = function(self)
	// 	if self.physical_state then
	// 		self.physical_state = false
	// 		self.object:set_properties({physical = false})
	// 		self.object:set_velocity({x=0, y=0, z=0})
	// 		self.object:set_acceleration({x=0, y=0, z=0})
	// 	end
	// end

	// local burn_nodes = {
	// 	["fire:fire"]       = true,
	// 	["nether:lava"]     = true,
	// 	["nether:lavaflow"] = true,
	// 	["main:lava"]       = true,
	// 	["main:lavaflow"]   = true
	// }
	// local order = {
	// 	{x=1, y=0, z=0}, {x=-1, y=0, z= 0},
	// 	{x=0, y=0, z=1}, {x= 0, y=0, z=-1},
	// }
	// local collector
	// local pos
	// local pos2
	// local player_velocity
	// local direction
	// local distance
	// local multiplier
	// local velocity
	// local node
	// local is_stuck
	// local snode
	// local shootdir
	// local cnode
	// local cdef
	// local fpos
	// local vel
	// local def
	// local slip_factor
	// local change
	// local slippery
	// local i_node
	// local flow_dir
	// local item_step = function(self, dtime, moveresult)
	// 	pos = self.object:get_pos()
	// 	if not pos then
	// 		return
	// 	end

	// 	//if item set to be collected then only execute go to player
	// 	if self.collected == true then
	// 		if not self.collector then
	// 			self.object:remove()
	// 			return
	// 		end

	// 		collector = core.get_player_by_name(self.collector)
	// 		if collector then
	// 			self.magnet_timer = self.magnet_timer + dtime

	// 			disable_physics(self)

	// 			//get the variables
	// 			pos2 = collector:get_pos()
	// 			player_velocity = collector:get_player_velocity()
	// 			pos2.y = pos2.y + 0.5

	// 			distance = vector.distance(pos2,pos)

	// 			if distance > 2 or distance < 0.3 or self.magnet_timer > 0.2 or self.old_magnet_distance and self.old_magnet_distance < distance then
	// 				self.object:remove()
	// 				return
	// 			end

	// 			direction = vector.normalize(vector.subtract(pos2,pos))

	// 			multiplier = 10 - distance // changed

	// 			velocity = vector.add(player_velocity,vector.multiply(direction,multiplier))

	// 			self.object:set_velocity(velocity)

	// 			self.old_magnet_distance = distance

	// 			return
	// 		else
	// 			// the collector doesn't exist
	// 			self.object:remove()
	// 			return
	// 		end
	// 	end

	// 	//allow entity to be collected after timer
	// 	if self.collectable == false and self.collection_timer >= 2.5 then
	// 		self.collectable = true
	// 	elseif self.collectable == false then
	// 		self.collection_timer = self.collection_timer + dtime
	// 	end

	// 	self.age = self.age + dtime
	// 	if self.age > 300 then
	// 		self.object:remove()
	// 		return
	// 	end
	// 	// polling eases the server load
	// 	if self.poll_timer > 0 then
	// 		self.poll_timer = self.poll_timer - dtime
	// 		if self.poll_timer <= 0 then
	// 			self.poll_timer = 0
	// 		end
	// 		return
	// 	end

	// 	if moveresult and moveresult.touching_ground and table.getn(moveresult.collisions) > 0 then
	// 		node = core.get_node_or_nil(moveresult.collisions[1].node_pos)
	// 	else
	// 		node = nil
	// 	end

	// 	i_node = core.get_node_or_nil(pos)

	// 	// Remove nodes in 'ignore' and burns items
	// 	if i_node then
	// 		if i_node.name == "ignore" then
	// 			self.object:remove()
	// 			return
	// 		elseif i_node and burn_nodes[i_node.name] then
	// 			core.add_particlespawner({
	// 				amount = 6,
	// 				time = 0.001,
	// 				minpos = pos,
	// 				maxpos = pos,
	// 				minvel = vector.new(-1,0.5,-1),
	// 				maxvel = vector.new(1,1,1),
	// 				minacc = {x=0, y=1, z=0},
	// 				maxacc = {x=0, y=2, z=0},
	// 				minexptime = 1.1,
	// 				maxexptime = 1.5,
	// 				minsize = 1,
	// 				maxsize = 2,
	// 				collisiondetection = false,
	// 				vertical = false,
	// 				texture = "smoke.png",
	// 			})
	// 			core.sound_play("fire_extinguish", {pos=pos,gain=0.3,pitch=math.random(80,100)/100})
	// 			self.object:remove()
	// 			return
	// 		end
	// 	end

	// 	is_stuck = false
	// 	snode = core.get_node_or_nil(pos)
	// 	if snode and snode ~= "air" then
	// 		snode = core.registered_nodes[snode.name] or {}
	// 		is_stuck = (snode.walkable == nil or snode.walkable == true)
	// 			and (snode.collision_box == nil or snode.collision_box.type == "regular")
	// 			and (snode.node_box == nil or snode.node_box.type == "regular")
	// 	end

	// 	// Push item out when stuck inside solid node
	// 	if is_stuck then
	// 		shootdir = nil
	// 		// Check which one of the 4 sides is free
	// 		for o = 1, #order do
	// 			cnode = core.get_node(vector.add(pos, order[o])).name
	// 			cdef = core.registered_nodes[cnode] or {}
	// 			if cnode ~= "ignore" and cdef.walkable == false then
	// 				shootdir = order[o]
	// 				break
	// 			end
	// 		end

	// 		// If none of the 4 sides is free, check upwards
	// 		if not shootdir then
	// 			shootdir = {x=0, y=1, z=0}
	// 			cnode = core.get_node(vector.add(pos, shootdir)).name
	// 			if cnode == "ignore" then
	// 				shootdir = nil // Do not push into ignore
	// 			end
	// 		end

	// 		if shootdir then
	// 			// shove that thing outta there
	// 			fpos = vector.round(pos)
	// 			if shootdir.x ~= 0 then
	// 				shootdir = vector.multiply(shootdir,0.74)
	// 				self.object:move_to(vector.new(fpos.x+shootdir.x,pos.y,pos.z))
	// 			elseif shootdir.y ~= 0 then
	// 				shootdir = vector.multiply(shootdir,0.72)
	// 				self.object:move_to(vector.new(pos.x,fpos.y+shootdir.y,pos.z))
	// 			elseif shootdir.z ~= 0 then
	// 				shootdir = vector.multiply(shootdir,0.74)
	// 				self.object:move_to(vector.new(pos.x,pos.y,fpos.z+shootdir.z))
	// 			end
	// 			return
	// 		end
	// 	end

	// 	flow_dir = flow(pos)

	// 	if flow_dir then
	// 		flow_dir = vector.multiply(flow_dir,10)
	// 		local vel = self.object:get_velocity()
	// 		local acceleration = vector.new(flow_dir.x-vel.x,flow_dir.y-vel.y,flow_dir.z-vel.z)
	// 		acceleration = vector.multiply(acceleration, 0.01)
	// 		self.object:add_velocity(acceleration)
	// 		return
	// 	end

	// 	change = false
	// 	// Slide on slippery nodes
	// 	def = node and core.registered_nodes[node.name]
	// 	vel = self.object:get_velocity()
	// 	if def and def.walkable then
	// 		slippery = core.get_item_group(node.name, "slippery")
	// 		if slippery ~= 0 then
	// 			if math.abs(vel.x) > 0.2 or math.abs(vel.z) > 0.2 then
	// 				// Horizontal deceleration
	// 				slip_factor = 4.0 / (slippery + 4)
	// 				self.object:set_acceleration({
	// 					x = -vel.x * slip_factor,
	// 					y = -9.81,
	// 					z = -vel.z * slip_factor
	// 				})
	// 				change = true
	// 			elseif (vel.x ~= 0 or vel.z ~= 0) and math.abs(vel.x) <= 0.2 and math.abs(vel.z) <= 0.2 then
	// 				self.object:set_velocity(vector.new(0,vel.y,0))
	// 				self.object:set_acceleration(vector.new(0,-9.81,0))
	// 			end
	// 		elseif node then
	// 			if math.abs(vel.x) > 0.2 or math.abs(vel.z) > 0.2 then
	// 				self.object:add_velocity({
	// 					x = -vel.x * 0.15,
	// 					y = 0,
	// 					z = -vel.z * 0.15
	// 				})
	// 				change = true
	// 			elseif (vel.x ~= 0 or vel.z ~= 0) and math.abs(vel.x) <= 0.2 and math.abs(vel.z) <= 0.2 then
	// 				self.object:set_velocity(vector.new(0,vel.y,0))
	// 				self.object:set_acceleration(vector.new(0,-9.81,0))
	// 			end
	// 		end
	// 	elseif vel.x ~= 0 or vel.y ~= 0 or vel.z ~= 0 then
	// 		change = true
	// 	end

	// 	if change == false and self.poll_timer == 0 then
	// 		self.poll_timer = 0.5
	// 	end
	// end

	// core.register_entity(":__builtin:item", {

	// 	set_item = set_item,

	// 	get_staticdata = function(self)
	// 		return(get_staticdata(self))
	// 	end,
	// 	on_activate    = function(self, staticdata, dtime_s)
	// 		on_activate(self, staticdata, dtime_s)
	// 	end,

	// 	on_step = function(self, dtime, moveresult)
	// 		item_step(self, dtime, moveresult)
	// 	end,
	// })

	// core.register_chatcommand("gimme", {
	// 	params = "nil",
	// 	description = "Spawn x amount of a mob, used as /spawn 'mob' 10 or /spawn 'mob' for one",
	// 	privs = {server=true},
	// 	func = function(name)
	// 		local player = core.get_player_by_name(name)
	// 		local pos = player:get_pos()
	// 		pos.y = pos.y + 5
	// 		pos.x = pos.x + 8
	// 		for i = 1,1000 do
	// 			core.throw_item(pos, "main:dirt")
	// 		end
	// 	end,
	// })
}
