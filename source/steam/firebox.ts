namespace steam {
	const timerStart = kickOnSteamNodeTimer;

	const fireboxEntities = new Map<number, ObjectRef>();

	const fireEntityWidth = (1 / 16) * 14;

	class FireBoxFireEntity extends types.Entity {
		name: string = "crafter_steam:firebox_fire_entity";
		initial_properties: ObjectProperties = {
			pointable: false,
			visual: EntityVisual.cube,
			textures: [
				"coalblock.png",
				"coalblock.png",
				"coalblock.png",
				"coalblock.png",
				"coalblock.png",
				"coalblock.png",
			],
			visual_size: vector.create3d(0, 0, 0),
			static_save: false,
		};

		// on_step(delta: number, moveResult: MoveResult | null): void {
		// 	print("hi");
		// }
	}
	utility.registerTSEntity(FireBoxFireEntity);

	function getOrCreateEntity(pos: Vec3): ObjectRef | null {
		const hash = core.hash_node_position(pos);
		let entity = fireboxEntities.get(hash) || null;
		if (entity == null) {
			entity = core.add_entity(pos, "crafter_steam:firebox_fire_entity");
			if (entity == null) {
				core.log(
					LogLevel.error,
					`Failed to add firebox entity at ${pos}`
				);
				return null;
			}
		}
		fireboxEntities.set(hash, entity);
		return entity;
	}

	function manipulateFireEntity(pos: Vec3, entity: ObjectRef | null): void {
		if (entity == null) {
			// Cannot continue without an entity.
			core.log(LogLevel.warning, `Missing firebox entity at ${pos}`);
			return;
		}

		const meta = core.get_meta(pos);
		let coalLevel = meta.get_float("coal_level");

		if (coalLevel <= 0) {
			entity.set_properties({
				visual_size: vector.create3d(0, 0, 0),
			});
		} else {
			entity.set_properties({
				visual_size: vector.create3d(
					fireEntityWidth,
					coalLevel,
					fireEntityWidth
				),
			});
			entity.set_pos(
				vector.create3d(pos.x, pos.y - 0.5 + coalLevel / 2, pos.z)
			);
		}
	}

	const states = ["open", "closed"];
	for (const index of $range(0, 1)) {
		const currentState = states[index];
		core.register_node("crafter_steam:firebox_" + currentState, {
			drawtype: Drawtype.mesh,
			use_texture_alpha: TextureAlpha.clip,
			mesh: `steam_firebox_${currentState}.gltf`,
			tiles: ["steam_firebox.png", "steam_firebox_doors.png"],
			paramtype2: ParamType2["4dir"],
			groups: { stone: 1, pathable: 1 },
			sounds: crafter.stoneSound(),

			on_timer(position, elapsed) {
				manipulateFireEntity(position, getOrCreateEntity(position));
				timerStart(position);
			},

			on_construct(position) {
				getOrCreateEntity(position);
				timerStart(position);
			},
			on_punch(position, node, puncher, pointedThing) {
				//? DEBUG
				const meta = core.get_meta(position);
				meta.set_float("coal_level", 0);
			},

			on_rightclick(position, node, clicker, itemStack, pointedThing) {
				const meta = core.get_meta(position);
				let coalLevel = meta.get_float("coal_level");

				if (
					currentState == "open" &&
					itemStack.get_name() == "crafter:coal" &&
					coalLevel < 0.6
				) {
					coalLevel += 0.05;
					print(coalLevel);
					meta.set_float("coal_level", coalLevel);

					manipulateFireEntity(position, getOrCreateEntity(position));
				} else {
					const newIndex = (index + 1) % 2;
					const newState = states[newIndex];
					core.swap_node(position, {
						name: "crafter_steam:firebox_" + newState,
						param2: node.param2,
					});
					core.sound_play("steam_boiler_door", {
						pos: pointedThing.under!,
						pitch: (math.random(80, 99) + math.random()) / 100,
					});
				}
			},

			on_destruct(position) {
				const hash = core.hash_node_position(position);
				const entity = fireboxEntities.get(hash);
				if (entity != null) {
					entity.remove();
				}
				fireboxEntities.delete(hash);
			},
		});
	}
}
