namespace tnt {
	//! Begin localization and required constants.

	const round = math.round;
	const raycast = core.raycast;
	const random = math.random;
	const distance = vector.distance;

	// Use raycasting to create actual explosion.
	const air: number = core.get_content_id("air");
	// todo: fix this when the nether mod is in.
	// const obsidian: number = core.get_content_id("nether:obsidian");
	// const bedrock: number = core.get_content_id("nether:bedrock");
	const obsidian: number = core.get_content_id("crafter:tree");
	const bedrock: number = core.get_content_id("crafter:tree");

	const tntID: number = 0;
	core.register_on_mods_loaded(() => {
		// Cast away using this idea in your mods.
		(tntID as number) = core.get_content_id("crafter_tnt:tnt");
	});
	let boomTime: number = core.get_us_time() / 1000000;

	const diggingNodes = new Set<number>();
	for (const node of [
		"crafter_chest:chest_open",
		"crafter_chest:chest",
		"crafter_furnace:furnace_active",
		"crafter_furnace:furnace",
	]) {
		diggingNodes.add(core.get_content_id(node));
	}

	export function addDigNodes(data: string[]): void {
		for (const node of data) {
			diggingNodes.add(core.get_content_id(node));
		}
	}

	const fallingNodes = new Set<number>();
	core.register_on_mods_loaded(() => {
		for (const [name, def] of pairs(core.registered_nodes)) {
			const groups: Dictionary<string, number> | undefined = def.groups;
			if (groups == null) {
				continue;
			}
			if (groups.falling_node || 0 > 0 || groups.attached_node || 0 > 0) {
				const id = core.get_content_id(name);
				// print("added: ", name, "as", id);
				fallingNodes.add(id);
			}
		}
	});

	//! End localization and required constants.

	interface ExplosionComponent {
		pos: Vec3;
		range: number;
	}

	const queue = new utility.QueueFIFO<ExplosionComponent>();

	/**
	 * Set off a TNT explosion at a position.
	 * @param pos The position.
	 * @param range The diameter of the explosion. // todo: rename this
	 */
	export function tnt(pos: Vec3, range: number) {
		queue.push({
			pos: pos,
			range: range,
		});
		// print(queue.length());
	}

	core.register_globalstep(() => {
		if (queue.length() == 0) {
			return;
		}
		for (const _ of $range(1, 20)) {
			const thisComponent: ExplosionComponent | undefined = queue.pop();

			if (thisComponent == null) {
				break;
			}

			internalTNT(thisComponent.pos, thisComponent.range);
		}
	});

	// Explosion item drops.
	function dropItem(
		pos: Vec3,
		range: number,
		currentID: number,
		under: Vec3
	) {
		const nodeName: string = core.get_name_from_content_id(currentID);

		const item = core.get_node_drops(nodeName, "crafter:diamondpick");

		if (item.length == 0) {
			return;
		}

		const ppos = vector.create3d({
			x: under.x,
			y: under.y,
			z: under.z,
		});
		const obj: ObjectRef | null = core.add_item(ppos, item[0]);
		if (obj != null) {
			const power: number = (range - distance(pos, ppos)) * 2;
			const dir: Vec3 = vector.subtract(ppos, pos);
			const force: Vec3 = vector.multiply(dir, power);
			obj.set_velocity(force);
		}
	}

	// Raycast explosion.
	function explosion(
		pos: Vec3,
		range: number,
		vm: VoxelManipObject,
		data: number[],
		area: VoxelAreaObject
	): void {
		// const start: number = core.get_us_time();
		const range_calc: number = range / 100;
		const explosion_depletion: number = range / 2;

		// Java techniques in typescript compiling into lua. Amazing.
		const workerVec: Vec3 = vector.create3d();

		let ray: RaycastObject;

		for (const x of $range(-range, range)) {
			for (const y of $range(-range, range)) {
				for (const z of $range(-range, range)) {
					workerVec.x = pos.x + x;
					workerVec.y = pos.y + y;
					workerVec.z = pos.z + z;

					const currentDistance: number = round(
						distance(pos, workerVec)
					);
					if (
						currentDistance > range ||
						currentDistance == range - 1
					) {
						continue;
					}
					ray = raycast(
						pos,
						vector.create3d(pos.x + x, pos.y + y, pos.z + z),
						false,
						false
					);

					let explosion_force: number = range;

					for (const pointed_thing of ray) {
						explosion_force = explosion_force - math.random();
						if (explosion_force < explosion_depletion) {
							break;
						}

						if (pointed_thing.under == null) {
							core.log(
								LogLevel.warning,
								"Missing pointed thing under."
							);
							break;
						}

						const n_pos: number = area.index(
							pointed_thing.under.x,
							pointed_thing.under.y,
							pointed_thing.under.z
						);

						const currentID: number | undefined = data[n_pos - 1];

						if (currentID == null) {
							continue;
						}

						if (currentID == obsidian || currentID == bedrock) {
							break;
						} else if (diggingNodes.has(currentID)) {
							core.dig_node(
								vector.create3d({
									x: pointed_thing.under.x,
									y: pointed_thing.under.y,
									z: pointed_thing.under.z,
								})
							);
							data[n_pos - 1] = air;
						} else if (currentID == tntID) {
							data[n_pos - 1] = air;

							core.after(
								0,
								(thisRange: number, under: Vec3) => {
									const serialData: SerialTntData = {
										range: thisRange,
										timer: random(),
										exploded: false,
									};
									core.add_entity(
										vector.create3d({
											x: under.x,
											y: under.y,
											z: under.z,
										}),
										"crafter_tnt:tnt",
										core.serialize(serialData)
									);
								},
								range,
								pointed_thing.under
							);
						} /* fixme: elseif (! string.match(node2, "mob_spawners:")) then*/ else {
							const currentID: number = data[n_pos - 1];
							data[n_pos - 1] = air;
							if (fallingNodes.has(currentID)) {
								core.after(
									0,
									(pointed_thing: PointedThing) => {
										if (pointed_thing.under == null) {
											core.log(
												LogLevel.warning,
												"Pointed thing became null?"
											);
											return;
										}
										core.check_for_falling(
											vector.create3d({
												x: pointed_thing.under.x,
												y: pointed_thing.under.y + 1,
												z: pointed_thing.under.z,
											})
										);
									},
									pointed_thing
								);
							}

							if (
								range_calc < 1 &&
								random() > 0.98 + range_calc
							) {
								dropItem(
									pos,
									range,
									currentID,
									pointed_thing.under
								);
							}
						}
					}
				}
			}
		}

		vm.set_data(data);
		vm.update_liquids();
		vm.write_to_map();
		// const end: number = core.get_us_time();

		// print("took: ", (end - start) / 1000000, "sec");
	}

	function internalTNT(pos: Vec3, range: number) {
		const in_node: string = core.get_node(pos).name;
		const in_water =
			in_node == "crafter:water" || in_node == "crafter:waterflow";

		const min: Vec3 = vector.add(pos, range);
		const max: Vec3 = vector.subtract(pos, range);
		const vm: VoxelManipObject = core.get_voxel_manip(min, max);
		const data: number[] = vm.get_data();
		const [emin, emax] = vm.read_from_map(min, max);
		const area: VoxelAreaObject = VoxelArea(emin, emax);

		if (!in_water) {
			explosion(pos, range, vm, data, area);
		}

		if (core.get_us_time() / 1000000 - boomTime >= 0.1) {
			boomTime = core.get_us_time() / 1000000;
			core.sound_play("tnt_explode", {
				pos: pos,
				gain: 1.0,
				max_hear_distance: 64,
			}); //hear twice as far away
		}

		// Throw players and items.
		for (const [_, object] of ipairs(
			core.get_objects_inside_radius(pos, range)
		)) {
			const isPlayer: boolean = object.is_player();

			const luaEntity: LuaEntity | null = isPlayer
				? null
				: object.get_luaentity();

			const workableEntity: boolean =
				luaEntity == null
					? false
					: luaEntity.name == "__builtin:item" ||
					  luaEntity.name == "crafter_tnt:tnt" || // todo: cast this into a mob entity class.
					  (luaEntity as any).is_mob == true;

			if (isPlayer || workableEntity) {
				const ppos: Vec3 = object.get_pos();
				if (
					!isPlayer &&
					luaEntity != null &&
					luaEntity.name == "crafter_tnt:tnt"
				) {
					const in_node: string = core.get_node(ppos).name;
					if (
						in_node == "crafter:water" ||
						in_node == "crafter:waterflow"
					) {
						continue;
					}
				}

				if (isPlayer) {
					ppos.y = ppos.y + 1;
				}
				const ray: RaycastObject = core.raycast(
					pos,
					ppos,
					false,
					false
				);
				let clear: boolean = true;
				for (const pointed_thing of ray) {
					if (pointed_thing.under == null) {
						core.log(
							LogLevel.warning,
							"Missing pointed thing under."
						);
						continue;
					}
					const n_pos: number = area.index(
						pointed_thing.under.x,
						pointed_thing.under.y,
						pointed_thing.under.z
					);
					const node2: number = data[n_pos - 1];
					if (node2 == obsidian || node2 == bedrock) {
						clear = false;
					}
				}
				if (clear) {
					const power: number =
						(range - vector.distance(pos, ppos)) * 10;
					const dir: Vec3 = vector.direction(pos, ppos);
					const force: Vec3 = vector.multiply(dir, power);

					if (isPlayer) {
						// Damage the player.
						const hp: number = object.get_hp();
						if (hp > 0) {
							//object:set_hp(hp - math.floor(power*2))
							object.punch(object, 2, {
								full_punch_interval: 1.5,
								damage_groups: { damage: math.floor(power) },
							});
						}
						object.add_velocity(force);
					} else if (workableEntity) {
						if (luaEntity == null) {
							throw new Error("LuaEntity became null.");
						}
						if (luaEntity.name == "crafter_tnt:tnt") {
							(luaEntity as TntEntity).shot = true;
						} /* todo: cast as a mob */ else if (
							(luaEntity as any).is_mob
						) {
							object.punch(object, 2, {
								full_punch_interval: 1.5,
								damage_groups: { damage: math.floor(power) },
							});
						} else if (luaEntity.name == "__builtin:item") {
							(
								luaEntity as itemHandling.CrafterItemEntity
							).poll_timer = 0;
						}
						object.add_velocity(force);
					}
				}
			}
		}

		// Stop client from lagging.
		if (range > 15) {
			range = 15;
		}
		core.add_particlespawner({
			amount: range,
			time: 0.001,
			minpos: pos,
			maxpos: pos,
			minvel: vector.create3d(-range, -range, -range),
			maxvel: vector.create3d(range, range, range),
			minacc: vector.create3d({ x: 0, y: 0, z: 0 }),
			maxacc: vector.create3d({ x: 0, y: 0, z: 0 }),
			minexptime: 1.1,
			maxexptime: 1.5,
			minsize: 1,
			maxsize: 2,
			collisiondetection: true,
			collision_removal: true,
			vertical: false,
			texture: "smoke.png",
		});
	}

	// Serialization data for the tnt.
	interface SerialTntData {
		range: number;
		timer: number;
		exploded: boolean;
	}

	class TntEntity extends types.Entity {
		name: string = "crafter_tnt:tnt";

		initial_properties: ObjectProperties = {
			hp_max: 1,
			physical: true,
			collide_with_objects: false,
			collisionbox: [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5],
			visual: EntityVisual.cube,
			visual_size: { x: 1, y: 1 },
			textures: [
				"tnt_top.png",
				"tnt_bottom.png",
				"tnt_side.png",
				"tnt_side.png",
				"tnt_side.png",
				"tnt_side.png",
			],
			is_visible: true,
			pointable: true,
		};

		static readonly timer_max: number = 5;
		shot: boolean = false;
		timer: number = TntEntity.timer_max;
		range: number = 7;
		sound_played: boolean = false;
		exploded: boolean = false;
		redstone_activated: boolean = false;

		on_step(dtime: number): void {
			this.timer -= dtime;
			if (!this.shot || !this.redstone_activated) {
				let vel = this.object.get_velocity();
				vel = vector.multiply(vel, -0.05);
				this.object.add_velocity(vector.create3d(vel.x, 0, vel.z));
			}
			if (this.timer <= 0) {
				core.after(
					0,
					(pos: Vec3, range: number) => {
						tnt(pos, range);
					},
					this.object.get_pos(),
					this.range
				);
				this.object.remove();
			}
		}

		on_activate(staticdata: string, dtime_s: number): void {
			this.object.set_armor_groups({ immortal: 1 });
			this.object.set_velocity(
				vector.create3d({
					x: random(-3, 3),
					y: 3,
					z: random(-3, 3),
				})
			);
			this.object.set_acceleration(
				vector.create3d({ x: 0, y: -9.81, z: 0 })
			);

			const data: SerialTntData | null = core.deserialize(
				staticdata
			) as SerialTntData | null;
			if (data != null && typeof data == "object") {
				this.range = data.range;
				this.timer = data.timer;
				this.exploded = data.exploded;
			}

			if (this.timer == TntEntity.timer_max) {
				core.add_particlespawner({
					amount: 10,
					time: 0,
					minpos: vector.create3d(0, 0.5, 0),
					minvel: vector.create3d(-0.5, 1, -0.5),
					maxvel: vector.create3d(0.5, 5, 0.5),
					minacc: vector.create3d({ x: 0, y: 0, z: 0 }),
					maxacc: vector.create3d({ x: 0, y: 0, z: 0 }),
					minexptime: 0.5,
					maxexptime: 1.0,
					minsize: 1,
					maxsize: 2,
					collisiondetection: false,
					vertical: false,
					texture: "smoke.png",
					attached: this.object,
				});
				core.sound_play("tnt_ignite", {
					object: this.object,
					gain: 1.0,
					max_hear_distance: 64,
				});
			}
		}

		get_staticdata(): string {
			const data: SerialTntData = {
				range: this.range,
				timer: this.timer,
				exploded: this.exploded,
			};
			return core.serialize(data);
		}

		on_punch() {
			itemHandling.throw_item(this.object.get_pos(), "crafter_tnt:tnt");
			this.object.remove();
		}
	}

	core.register_node("crafter_tnt:tnt", {
		description: "TNT",
		tiles: [
			"tnt_top.png",
			"tnt_bottom.png",
			"tnt_side.png",
			"tnt_side.png",
			"tnt_side.png",
			"tnt_side.png",
		],
		groups: {
			stone: 2,
			hard: 1,
			pickaxe: 2,
			hand: 4,
			redstone_activation: 1,
		},
		sounds: crafter.stoneSound(),
		redstone_activation: (pos: Vec3) => {
			const obj: ObjectRef | null = core.add_entity(
				pos,
				"crafter_tnt:tnt"
			);
			const range: number = 4;
			if (obj != null) {
				const luaEntity: TntEntity | null =
					obj.get_luaentity() as TntEntity | null;
				if (luaEntity != null) {
					luaEntity.range = range;
					luaEntity.redstone_activated = true;
					core.remove_node(pos);
				}
			}
		},

		on_punch: (pos: Vec3) => {
			const obj: ObjectRef | null = core.add_entity(
				pos,
				"crafter_tnt:tnt"
			);
			const range: number = 4;
			if (obj != null) {
				const luaEntity: TntEntity | null =
					obj.get_luaentity() as TntEntity | null;
				if (luaEntity != null) {
					luaEntity.range = range;
					core.remove_node(pos);
				}
			}
		},
	});
	utility.registerTSEntity(TntEntity);

	core.register_node("crafter_tnt:uh_oh", {
		description: "Uh Oh",
		tiles: [
			"tnt_top.png",
			"tnt_bottom.png",
			"tnt_side.png",
			"tnt_side.png",
			"tnt_side.png",
			"tnt_side.png",
		],
		groups: { stone: 2, hard: 1, pickaxe: 2, hand: 4 },
		sounds: crafter.stoneSound(),
		on_construct: (pos) => {
			const range: number = 5;
			for (const x of $range(-range, range)) {
				for (const y of $range(-range, range)) {
					for (const z of $range(-range, range)) {
						core.add_node(
							vector.create3d(pos.x + x, pos.y + y, pos.z + z),
							{ name: "crafter_tnt:tnt" }
						);
					}
				}
			}
		},
	});

	core.register_craft({
		output: "crafter_tnt:tnt",
		recipe: [
			["crafter_mob:gunpowder", "crafter:sand", "crafter_mob:gunpowder"],
			["crafter:sand", "crafter_mob:gunpowder", "crafter:sand"],
			["crafter_mob:gunpowder", "crafter:sand", "crafter_mob:gunpowder"],
		],
	});
}
