namespace steam {
	const timerStart = kickOnSteamNodeTimer;

	const fireboxEntities = new Map<number, ObjectRef>();

	const fireBoxSounds = new Map<number, number>();

	const fireEntityWidth = (1 / 16) * 14;
	const coalBurnRateOpened = 0.002;
	const coalBurnRateClosed = 0.001;
	const coalIncrement = 0.05;
	const fireSoundLevelClosed = 0.8;
	const fireSoundLevelOpened = 1.2;

	const coalTexturing = [
		"coalblock.png",
		"coalblock.png",
		"coalblock.png",
		"coalblock.png",
		"coalblock.png",
		"coalblock.png",
	];

	const onFireTexturing = [
		"steam_firebox_fire.png",
		"steam_firebox_fire.png",
		"steam_firebox_fire.png",
		"steam_firebox_fire.png",
		"steam_firebox_fire.png",
		"steam_firebox_fire.png",
	];

	class FireBoxFireEntity extends types.Entity {
		name: string = "crafter_steam:firebox_fire_entity";
		initial_properties: ObjectProperties = {
			pointable: false,
			visual: EntityVisual.cube,
			textures: coalTexturing,
			visual_size: vector.create3d(0, 0, 0),
			static_save: false,
		};
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
		const coalLevel = meta.get_float("coal_level");
		const onFire = meta.get_int("coal_on_fire") > 0;

		if (coalLevel <= 0) {
			entity.set_properties({
				visual_size: vector.create3d(0, 0, 0),
			});
		} else {
			// todo: if on fire then change the texture.

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
			if (onFire) {
				entity.set_properties({
					textures: onFireTexturing,
					glow: 10,
				});
			}
		}
	}

	function burnFuelAndDoSideEffects(pos: Vec3, opened: boolean): void {
		const meta = core.get_meta(pos);
		const onFire = meta.get_int("coal_on_fire") > 0;
		let coalLevel = meta.get_float("coal_level");
		const hash = core.hash_node_position(pos);

		let soundHandle = fireBoxSounds.get(hash);

		if (onFire) {
			print(opened);
			coalLevel -= opened ? coalBurnRateOpened : coalBurnRateClosed;
			meta.set_float("coal_level", coalLevel);

			if (soundHandle == null) {
				soundHandle = core.sound_play("steam_firebox_on_fire", {
					pos: pos,
					pitch: (math.random(80, 99) + math.random()) / 100,
				});

				fireBoxSounds.set(hash, soundHandle);
			}

			core.sound_fade(
				soundHandle,
				0.2,
				opened ? fireSoundLevelOpened : fireSoundLevelClosed
			);
		} else {
			if (soundHandle != null) {
				core.sound_stop(soundHandle);
			}
		}

		if (coalLevel < 0) {
			meta.set_float("coal_level", 0);
			meta.set_int("coal_on_fire", 0);

			// todo: drop down into the ash pan.
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
				burnFuelAndDoSideEffects(position, index == 0);
				manipulateFireEntity(position, getOrCreateEntity(position));
				timerStart(position);
			},

			on_construct(position) {
				getOrCreateEntity(position);
				timerStart(position);
			},

			on_rightclick(position, node, clicker, itemStack, pointedThing) {
				const meta = core.get_meta(position);
				const onFire = meta.get_int("coal_on_fire") > 0;
				let coalLevel = meta.get_float("coal_level");

				const itemStackName = itemStack.get_name();

				if (
					currentState == "open" &&
					itemStackName == "crafter:coal" &&
					coalLevel < 0.6
				) {
					// This is specifically designed to allow players to jam in above 0.6 as soon as the fire is lit.
					// Never change this. It's fun.
					itemStack.take_item();
					coalLevel += coalIncrement;
					// print(coalLevel);
					meta.set_float("coal_level", coalLevel);
					manipulateFireEntity(position, getOrCreateEntity(position));
					core.sound_play("steam_coal_add", {
						pos: pointedThing.under!,
						pitch: (math.random(80, 99) + math.random()) / 100,
					});
					return itemStack;
				} else if (
					currentState == "open" &&
					!onFire &&
					core.get_item_group(itemStackName, "torch") > 0 &&
					coalLevel > 0
				) {
					itemStack.take_item();
					meta.set_int("coal_on_fire", 1);
					print("torch it");
					manipulateFireEntity(position, getOrCreateEntity(position));
					return itemStack;
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
				const meta = core.get_meta(position);
				const coalLevel = meta.get_float("coal_level");
				const onFire = meta.get_int("coal_on_fire") > 0;
				if (entity != null) {
					entity.remove();
				}
				fireboxEntities.delete(hash);
				// If you lit this on fire, say goodbye to your coal.
				if (!onFire) {
					const amount = coalLevel / coalIncrement;
					if (amount > 0) {
						itemHandling.throw_item(
							position,
							`crafter:coal ${amount}`
						);
					}
				}
			},
		});
	}
}
