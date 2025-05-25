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

	const burn_nodes: { [id: string]: boolean } = {
		"fire:fire": true,
		"nether:lava": true,
		"nether:lavaflow": true,
		"crafter:lava": true,
		"crafter:lavaflow": true,
	};
	const order: Vec3[] = [
		vector.create3d({ x: 1, y: 0, z: 0 }),
		vector.create3d({ x: -1, y: 0, z: 0 }),
		vector.create3d({ x: 0, y: 0, z: 1 }),
		vector.create3d({ x: 0, y: 0, z: -1 }),
	];

	export class CrafterItemEntity extends types.Entity {
		name: string = ":__builtin:item";
		itemstring: string = "";
		collector: string | null = null;
		dropped_by: string = "";
		moving_state: boolean = true;
		slippery_state: boolean = false;
		physical_state: boolean = true;
		// Item expiry
		age: number = 0;
		// Collection Variables
		collection_timer: number = 2;
		collectable: boolean = false;
		try_timer: number = 0;
		collected: boolean = false;
		delete_timer: number = 0;
		// Used for server delay
		magnet_timer: number = 0;
		old_magnet_distance: number = 0;
		poll_timer: number = 0;
		magnet_trigger: boolean = false;
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

		trigger_collection_calculation(): void {
			this.magnet_trigger = true;
		}

		set_item(item: string | ItemStackObject) {
			const stack = ItemStack(item || this.itemstring);
			this.itemstring = stack.to_string();
			if (this.itemstring == "") {
				// Item not yet known.
				return;
			}

			const itemname: string =
				(stack.is_known() && stack.get_name()) || "unknown";

			const def: ItemDefinition = core.registered_items[itemname];

			this.object.set_properties({
				textures: [itemname],
				wield_item: this.itemstring,
				glow: def && def.light_source,
			});
		}
		get_staticdata(): string {
			return core.serialize({
				itemstring: this.itemstring,
				age: this.age,
				dropped_by: this.dropped_by,
				collection_timer: this.collection_timer,
				collectable: this.collectable,
				try_timer: this.try_timer,
				collected: this.collected,
				delete_timer: this.delete_timer,
				collector: this.collector,
				magnet_timer: this.magnet_timer,
			});
		}
		on_activate(staticdata: string, dtime_s: number): void {
			if (string.sub(staticdata, 1, string.len("return")) == "return") {
				const data: any = core.deserialize(staticdata);
				if (data && type(data) == "table") {
					this.itemstring = data.itemstring;
					this.age = (data.age || 0) + dtime_s;
					this.dropped_by = data.dropped_by;
					this.magnet_timer = data.magnet_timer;
					this.collection_timer = data.collection_timer;
					this.collectable = data.collectable;
					this.try_timer = data.try_timer;
					this.collected = data.collected;
					this.delete_timer = data.delete_timer;
					this.collector = data.collector;
				}
			} else {
				this.itemstring = staticdata;
			}
			this.object.set_armor_groups({ immortal: 1 });
			this.object.set_velocity(vector.create3d({ x: 0, y: 2, z: 0 }));
			this.object.set_acceleration(
				vector.create3d({ x: 0, y: -9.81, z: 0 })
			);
			this.set_item(this.itemstring);
		}

		enable_physics(): void {
			if (!this.physical_state) {
				this.physical_state = true;
				this.object.set_properties({ physical: true });
				this.object.set_velocity(vector.zero());
				this.object.set_acceleration(
					vector.create3d({ x: 0, y: -9.81, z: 0 })
				);
			}
		}

		disable_physics(): void {
			if (this.physical_state) {
				this.physical_state = false;
				this.object.set_properties({ physical: false });
				this.object.set_velocity(vector.zero());
				this.object.set_acceleration(vector.zero());
			}
		}

		on_step(dtime: number, moveresult: MoveResult): void {
			const pos: Vec3 = this.object.get_pos();

			// If item set to be collected then only execute go to player.
			if (this.collected == true) {
				if (this.collector == null) {
					this.object.remove();
					return;
				}

				const collector: ObjectRef | null = core.get_player_by_name(
					this.collector
				);
				if (collector != null) {
					this.magnet_timer += dtime;

					this.disable_physics();

					// Get the variables.
					const pos2: Vec3 = collector.get_pos();
					const player_velocity: Vec3 = collector.get_velocity();
					pos2.y += 1;

					const distance: number = vector.distance(pos2, pos);
					if (this.magnet_trigger) {
						this.old_magnet_distance = distance;
						this.magnet_trigger = false;
					}

					if (
						distance > 2 ||
						distance < 0.3 ||
						this.magnet_timer > 0.2 ||
						this.old_magnet_distance < distance
					) {
						this.object.remove();
						return;
					}

					const direction: Vec3 = vector.normalize(
						vector.subtract(pos2, pos)
					);

					const multiplier: number = 10 - distance; // changed

					const velocity: Vec3 = vector.add(
						player_velocity,
						vector.multiply(direction, multiplier)
					);

					this.object.set_velocity(velocity);

					this.old_magnet_distance = distance;

					return;
				} else {
					// The collector doesn't exist.
					this.object.remove();
					return;
				}
			}

			// Allow entity to be collected after timer.
			if (this.collectable == false && this.collection_timer >= 2.5) {
				this.collectable = true;
			} else if (this.collectable == false) {
				this.collection_timer += dtime;
			}

			this.age += dtime;
			if (this.age > 300) {
				this.object.remove();
				return;
			}
			// Polling eases the server load.
			if (this.poll_timer > 0) {
				this.poll_timer -= dtime;
				if (this.poll_timer <= 0) {
					this.poll_timer = 0;
				}
				return;
			}

			let node: NodeTable | null = null;

			if (
				moveresult &&
				moveresult.touching_ground &&
				moveresult.collisions.length > 0
			) {
				node = core.get_node_or_nil(moveresult.collisions[0].node_pos);
			}

			const i_node: NodeTable | null = core.get_node_or_nil(pos);

			// Remove nodes in 'ignore' and burns items.
			if (i_node != null) {
				if (i_node.name == "ignore") {
					this.object.remove();
					return;
				} else if (i_node && burn_nodes[i_node.name]) {
					core.add_particlespawner({
						amount: 6,
						time: 0.001,
						minpos: pos,
						maxpos: pos,
						minvel: vector.create3d(-1, 0.5, -1),
						maxvel: vector.create3d(1, 1, 1),
						minacc: vector.create3d({ x: 0, y: 1, z: 0 }),
						maxacc: vector.create3d({ x: 0, y: 2, z: 0 }),
						minexptime: 1.1,
						maxexptime: 1.5,
						minsize: 1,
						maxsize: 2,
						collisiondetection: false,
						vertical: false,
						texture: "smoke.png",
					});
					core.sound_play("fire_extinguish", {
						pos: pos,
						gain: 0.3,
						pitch: math.random(80, 100) / 100,
					});
					this.object.remove();
					return;
				}
			}

			let is_stuck: boolean = false;
			const snode: NodeTable | null = core.get_node_or_nil(pos);
			if (snode && snode.name != "air") {
				const snodeDef = core.registered_nodes[snode.name] || null;

				if (snodeDef == null) {
					core.log(
						LogLevel.warning,
						`Node is stuck in unknown at ${core.pos_to_string(pos)}`
					);
					is_stuck = true;
				} else {
					is_stuck =
						(snodeDef.walkable == null ||
							snodeDef.walkable == true) &&
						(snodeDef.collision_box == null ||
							snodeDef.collision_box.type ==
								Nodeboxtype.regular) &&
						(snodeDef.node_box == null ||
							snodeDef.node_box.type == Nodeboxtype.regular);
				}
			}

			// Push item out when stuck inside solid node.
			if (is_stuck) {
				let shootdir: Vec3 | null = null;
				// Check which one of the 4 sides is free
				for (let o = 1; o <= order.length; o++) {
					const cnode: string = core.get_node(
						vector.add(pos, order[o])
					).name;
					const cdef: NodeDefinition =
						core.registered_nodes[cnode] || null;
					if (cdef == null) {
						core.log(
							LogLevel.warning,
							`got a null node def for ${cnode}`
						);
					} else if (cnode != "ignore" && cdef.walkable == false) {
						shootdir = order[o];
						break;
					}
				}

				// If none of the 4 sides is free, check upwards.
				if (shootdir == null) {
					shootdir = vector.create3d({ x: 0, y: 1, z: 0 });
					const cnode: string = core.get_node(
						vector.add(pos, shootdir)
					).name;
					if (cnode == "ignore") {
						// Do not push into ignore.
						shootdir = null;
					}
				}

				if (shootdir != null) {
					// Shove that thing outta there.
					const fpos: Vec3 = vector.round(pos);
					if (shootdir.x != 0) {
						shootdir = vector.multiply(shootdir, 0.74);
						this.object.move_to(
							vector.create3d(fpos.x + shootdir.x, pos.y, pos.z)
						);
					} else if (shootdir.y != 0) {
						shootdir = vector.multiply(shootdir, 0.72);
						this.object.move_to(
							vector.create3d(pos.x, fpos.y + shootdir.y, pos.z)
						);
					} else if (shootdir.z != 0) {
						shootdir = vector.multiply(shootdir, 0.74);
						this.object.move_to(
							vector.create3d(pos.x, pos.y, fpos.z + shootdir.z)
						);
					}
					return;
				}
			}

			// fixme: this was using the flow library mod.
			// let flow_dir: Vec3 | null = flow(pos)

			// if (flow_dir != null) {
			// 	flow_dir = vector.multiply(flow_dir,10)
			// 	const vel: Vec3 = this.object.get_velocity();
			// 	let acceleration: Vec3 = vector.create3d(flow_dir.x-vel.x,flow_dir.y-vel.y,flow_dir.z-vel.z)
			// 	acceleration = vector.multiply(acceleration, 0.01)
			// 	this.object.add_velocity(acceleration)
			// 	return
			// }

			let change: boolean = false;
			// Slide on slippery nodes
			const def: NodeDefinition | null =
				node && core.registered_nodes[node.name];
			const vel = this.object.get_velocity();
			if (node && def && def.walkable) {
				const slippery: number = core.get_item_group(
					node.name,
					"slippery"
				);
				if (slippery != 0) {
					if (math.abs(vel.x) > 0.2 || math.abs(vel.z) > 0.2) {
						// Horizontal deceleration
						const slip_factor: number = 4.0 / (slippery + 4);
						this.object.set_acceleration(
							vector.create3d({
								x: -vel.x * slip_factor,
								y: -9.81,
								z: -vel.z * slip_factor,
							})
						);
						change = true;
					} else if (
						(vel.x != 0 || vel.z != 0) &&
						math.abs(vel.x) <= 0.2 &&
						math.abs(vel.z) <= 0.2
					) {
						this.object.set_velocity(vector.create3d(0, vel.y, 0));
						this.object.set_acceleration(
							vector.create3d(0, -9.81, 0)
						);
					}
				} else {
					if (math.abs(vel.x) > 0.2 || math.abs(vel.z) > 0.2) {
						this.object.add_velocity(
							vector.create3d({
								x: -vel.x * 0.15,
								y: 0,
								z: -vel.z * 0.15,
							})
						);
						change = true;
					} else if (
						(vel.x != 0 || vel.z != 0) &&
						math.abs(vel.x) <= 0.2 &&
						math.abs(vel.z) <= 0.2
					) {
						this.object.set_velocity(vector.create3d(0, vel.y, 0));
						this.object.set_acceleration(
							vector.create3d(0, -9.81, 0)
						);
					}
				}
			} else if (vel.x != 0 || vel.y != 0 || vel.z != 0) {
				change = true;
			}

			if (change == false && this.poll_timer == 0) {
				this.poll_timer = 0.5;
			}
		}
	}

	utility.registerTSEntity(CrafterItemEntity);

	core.register_chatcommand("gimme", {
		params: "nil",
		description:
			"Spawn x amount of a mob, used as /spawn 'mob' 10 or /spawn 'mob' for one",
		privs: { server: true },
		func(name: string): void {
			const player = core.get_player_by_name(name);
			if (!player) {
				core.log(
					LogLevel.warning,
					`Player [${name}] ran a command and they don't exist.`
				);
				return;
			}
			const pos: Vec3 = player.get_pos();
			pos.y = pos.y + 5;
			pos.x = pos.x + 8;
			for (let i = 1; i <= 1000; i++) {
				item_handling.throw_item(pos, "crafter:dirt");
			}
		},
	});
}
