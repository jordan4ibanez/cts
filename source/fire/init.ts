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
		recipe: ["crafter:flint", "crafter:iron"],
	});

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Fire object.

	class FireEntity extends types.Entity {
		name: string = "crafter_fire:fire";

		initial_properties: ObjectProperties = {
			hp_max: 1,
			physical: false,
			collide_with_objects: false,
			collisionbox: [0, 0, 0, 0, 0, 0],
			visual: EntityVisual.cube,
			textures: [
				"nothing.png",
				"nothing.png",
				"fire.png",
				"fire.png",
				"fire.png",
				"fire.png",
			],
			visual_size: { x: 1, y: 1, z: 1 },
			//textures : {"nothing.png","nothing.png","fire.png","fire.png","fire.png","fire.png"},//, animation:{type:"vertical_frames", aspect_w:16, aspect_h:16, length:8.0}},
			is_visible: true,
			pointable: false,
		};

		glow: number = -1;
		timer: number = 0;
		life: number = 0;
		frame: number = 0;
		frame_timer: number = 0;
		owner: ObjectRef | null = null;

		on_activate() {
			// todo: why aren't these in the initial properties?
			const texture_list = [
				"nothing.png",
				"nothing.png",
				"fire.png^[opacity:180^[verticalframe:8:0",
				"fire.png^[opacity:180^[verticalframe:8:0",
				"fire.png^[opacity:180^[verticalframe:8:0",
				"fire.png^[opacity:180^[verticalframe:8:0",
			];
			this.object.set_properties({ textures: texture_list });
		}

		// Animation stuff.
		frame_update() {
			this.frame += 1;
			if (this.frame > 7) {
				this.frame = 0;
			}

			const texture_list = [
				"nothing.png",
				"nothing.png",
				"fire.png^[opacity:180^[verticalframe:8:" + this.frame,
				"fire.png^[opacity:180^[verticalframe:8:" + this.frame,
				"fire.png^[opacity:180^[verticalframe:8:" + this.frame,
				"fire.png^[opacity:180^[verticalframe:8:" + this.frame,
			];

			this.object.set_properties({ textures: texture_list });
		}

		on_step(dtime: number) {
			if (
				this.owner == null ||
				(!this.owner.is_player() && this.owner.get_luaentity() == null)
			) {
				this.object.remove();
				return;
			}

			const isPlayer: boolean = this.owner.is_player();

			// todo: Check if this is an item or a mob.

			if (isPlayer && this.owner.get_hp() <= 0) {
				put_fire_out(this.owner);
			}

			this.timer += dtime;
			this.life += dtime;

			if (this.life >= 7) {
				put_fire_out(this.owner);
				this.object.remove();
				return;
			}

			if (this.timer >= 1) {
				this.timer = 0;
				if (this.owner.is_player()) {
					this.owner.set_hp(this.owner.get_hp() - 1);
				} else if (this.owner.get_luaentity()) {
					this.owner.punch(this.object, 2, {
						full_punch_interval: 0,
						damage_groups: { damage: 2 },
					});
				}
			}

			this.frame_timer += dtime;
			if (this.frame_timer >= 0.015) {
				this.frame_timer = 0;
				this.frame_update();
			}
		}
	}

	utility.registerTSEntity(FireEntity);

	//? Fire handling.

	const pool = new Map<string, ObjectRef>();
	const fire_channels = new Map<string, ModChannel>();

	core.register_on_joinplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		fire_channels.set(name, core.mod_channel_join(name + ":fire_state"));
	});

	export function is_player_on_fire(player: ObjectRef): boolean {
		return pool.has(player.get_player_name());
	}

	export function is_entity_on_fire(object: ObjectRef): boolean {
		const luaEntity: types.Entity | null =
			object.get_luaentity() as types.Entity | null;
		if (luaEntity == null) {
			core.log(LogLevel.warning, "Entity's LuaEntity is null.");
			return false;
		}
		return luaEntity.fireEntity != null;
	}

	export function start_fire(object: ObjectRef): void {
		if (object.is_player()) {
			const name: string = object.get_player_name();

			const data = pool.get(name);

			if (data == null || data.get_luaentity() == null) {
				const fire_obj: ObjectRef | null = core.add_entity(
					object.get_pos(),
					"crafter_fire:fire"
				);
				if (fire_obj == null) {
					core.log(
						LogLevel.warning,
						`Failed to add fire entity to player [${name}]. ObjectRef was null.`
					);
					return;
				}
				const fireEntity: FireEntity | null =
					fire_obj.get_luaentity() as FireEntity | null;

				if (fireEntity == null) {
					core.log(
						LogLevel.warning,
						`Failed to add fire entity to player [${name}]. LuaEntity was null.`
					);
					return;
				}

				fireEntity.owner = object;
				fire_obj.set_attach(
					object,
					"",
					vector.create3d(0, 11, 0),
					vector.create3d(0, 0, 0)
				);
				fire_obj.set_properties({
					visual_size: vector.create3d(1, 2, 1),
				});
				pool.set(name, fire_obj);

				const channel: ModChannel | undefined = fire_channels.get(name);
				if (channel == null) {
					throw new Error(
						`Player [${name}] was never added to the mod channel list.`
					);
				}

				channel.send_all("1");
			} else if (data.get_luaentity() != null) {
				(data.get_luaentity() as FireEntity).life = 0;
			}
		} else if (object.get_luaentity() != null) {
			const luaEntity: types.Entity | null =
				object.get_luaentity() as types.Entity | null;

			if (luaEntity == null) {
				core.log(LogLevel.warning, "Entity became instantly null.");
				return;
			}

			if (
				luaEntity.fireEntity == null ||
				luaEntity.fireEntity.get_luaentity() == null
			) {
				const fireObject: ObjectRef | null = core.add_entity(
					object.get_pos(),
					"crafter_fire:fire"
				);

				if (fireObject == null) {
					core.log(
						LogLevel.warning,
						`Failed to add fire to entity. ObjectRef was null.`
					);
					return;
				}

				const fireLuaEntity: FireEntity | null =
					fireObject.get_luaentity() as FireEntity | null;

				if (fireLuaEntity == null) {
					core.log(
						LogLevel.warning,
						`Failed to add fire to entity. LuaEntity was null.`
					);
					return;
				}

				let entityFireTable: types.EntityFireTable | null =
					luaEntity.fireTable;

				if (entityFireTable == null) {
					// This will spam the terminal because nothing that can light on fire
					// should be missing a fire table.
					core.log(
						LogLevel.warning,
						`Entity: ${luaEntity.name} is missing a fire table!`
					);
					entityFireTable = {
						position: vector.create3d(0, 0, 0),
						visualSize: vector.create2d(1, 1),
					};
				}

				fireLuaEntity.owner = object;

				fireObject.set_attach(
					object,
					"",
					entityFireTable.position,
					vector.create3d(0, 0, 0)
				);
				fireObject.set_properties({
					visual_size: entityFireTable.visualSize,
				});
				luaEntity.fireEntity = fireObject;
			} else {
				const fireLuaEntity: FireEntity | null =
					luaEntity.fireEntity.get_luaentity() as FireEntity | null;

				if (fireLuaEntity == null) {
					core.log(
						LogLevel.warning,
						"Entity's fire entity became instantly null."
					);
					return;
				}

				fireLuaEntity.life = 0;
			}
		}
	}

	export function put_fire_out(object: ObjectRef): void {
		if (object.is_player()) {
			const name: string = object.get_player_name();
			const fireObject: ObjectRef | undefined = pool.get(name);

			if (fireObject == null) {
				// This will help solve logic issues.
				core.log(
					LogLevel.warning,
					`Tried to extinguish player [${name}] but they were not on fire.`
				);
				return;
			}

			// If this entity still exists, remove it.
			if (fireObject.get_luaentity() != null) {
				fireObject.remove();
			}

			pool.delete(name);
			const channel: ModChannel | undefined = fire_channels.get(name);
			if (channel == null) {
				throw new Error(
					`Player [${name}] was never added to fire channels.`
				);
			}
			channel.send_all("0");
			core.sound_play("fire_extinguish", {
				object: object,
				gain: 0.3,
				pitch: math.random(80, 100) / 100,
			});
		} else if (object.get_luaentity()) {
			const luaEntity: types.Entity | null =
				object.get_luaentity() as types.Entity | null;

			if (luaEntity == null) {
				core.log(LogLevel.warning, "Entity's LuaTable became null.");
				return;
			}

			const fireEntity: ObjectRef | null = luaEntity.fireEntity;

			if (fireEntity != null && fireEntity.get_luaentity() != null) {
				fireEntity.remove();
			}

			luaEntity.fireEntity = null;
			core.sound_play("fire_extinguish", {
				object: object,
				gain: 0.3,
				pitch: math.random(80, 100) / 100,
			});
		}
	}

	core.register_on_respawnplayer((player: ObjectRef) => {
		put_fire_out(player);
	});
}
