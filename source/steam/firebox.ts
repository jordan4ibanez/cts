namespace steam {
	const timerStart = kickOnSteamNodeTimer;

	const fireboxEntities = new Map<number, ObjectRef>();

	const fireBoxSounds = new Map<number, number>();

	const fireEntityWidth = (1 / 16) * 14;
	const coalIncrement = 0.05;
	const fireSoundLevelClosed = 0.4;
	const fireSoundLevelOpened = 1.0;

	// Burn rates.
	const coalBurnRateOpened = 0.002;
	const coalBurnRateClosed = 0.001;

	// Temperature control components.
	const temperatureIncrementOpened = 20;
	const temperatureIncrementClosed = 10;
	const temperatureDecrementOpened = 10;
	const temperatureDecrementClosed = 5;
	const maxTempOpened = 1800 - temperatureIncrementOpened;
	const maxTempClosed = 700;
	const maxTempIncreasingClosed = maxTempClosed - temperatureIncrementClosed;

	class FireboxMeta extends utility.CrafterMeta {
		onFire: boolean = false;
		coalLevel: number = 0;
		isSoot: boolean = false;
		temperature: number = 0;
	}

	const fireboxData: FireboxMeta = new FireboxMeta(vector.create3d());

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

	const sootTexturing = [
		"steam_soot_block.png",
		"steam_soot_block.png",
		"steam_soot_block.png",
		"steam_soot_block.png",
		"steam_soot_block.png",
		"steam_soot_block.png",
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

		fireboxData.move(pos);

		if (fireboxData.onFire && fireboxData.isSoot) {
			throw new Error(
				`Logic error. Cannot be soot and on fire! At: ${pos}`
			);
		}

		if (fireboxData.coalLevel <= 0) {
			entity.set_properties({
				visual_size: vector.create3d(0, 0, 0),
			});
		} else {
			entity.set_pos(
				vector.create3d(
					pos.x,
					pos.y - 0.5 + fireboxData.coalLevel / 2,
					pos.z
				)
			);
			entity.set_properties({
				visual_size: vector.create3d(
					fireEntityWidth,
					fireboxData.coalLevel,
					fireEntityWidth
				),
			});

			if (fireboxData.onFire) {
				entity.set_properties({
					textures: onFireTexturing,
					glow: 10,
				});
			} else if (fireboxData.isSoot) {
				entity.set_properties({
					textures: sootTexturing,
					glow: 0,
				});
			} else {
				entity.set_properties({
					textures: coalTexturing,
					glow: 0,
				});
			}
		}
	}

	function burnFuelAndDoSideEffects(pos: Vec3, opened: boolean): void {
		fireboxData.move(pos);

		const hash = core.hash_node_position(pos);

		let soundHandle = fireBoxSounds.get(hash);

		// print("firebox temp: ", temperature);

		if (fireboxData.onFire) {
			fireboxData.coalLevel -= opened
				? coalBurnRateOpened
				: coalBurnRateClosed;
			fireboxData.write();

			const soundLevel = opened
				? fireSoundLevelOpened
				: fireSoundLevelClosed;

			if (soundHandle == null) {
				soundHandle = core.sound_play("steam_firebox_on_fire", {
					pos: pos,
					pitch: (math.random(80, 99) + math.random()) / 100,
					gain: soundLevel,
					loop: true,
				});

				fireBoxSounds.set(hash, soundHandle);
			}
			core.sound_fade(soundHandle, 1, soundLevel);

			if (opened) {
				// This is a great way to blow up the boiler!
				if (fireboxData.temperature <= maxTempOpened) {
					fireboxData.temperature += temperatureIncrementOpened;
				}
			} else {
				if (fireboxData.temperature > maxTempClosed) {
					fireboxData.temperature -= temperatureDecrementClosed;
				} else if (fireboxData.temperature <= maxTempIncreasingClosed) {
					fireboxData.temperature += temperatureIncrementClosed;
				}
			}
			meta.set_float("firebox_temperature", temperature);
		} else {
			if (temperature > 0) {
				// Basically this is the "oh shit I ran out of fuel" control.
				// If you close the doors the firebox will retain more heat.
				temperature -= opened
					? temperatureDecrementOpened
					: temperatureDecrementClosed;

				if (temperature < 0) {
					temperature = 0;
				}
				meta.set_float("firebox_temperature", temperature);
			}

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
			groups: { stone: 1 },
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

			on_punch(position, node, puncher, pointedThing) {
				if (currentState == "closed" || puncher == null) {
					return;
				}

				const isShovel =
					core.get_item_group(
						puncher.get_wielded_item().get_name(),
						"shovel"
					) > 0;

				if (!isShovel) {
					return;
				}

				fireboxData.move(position);

				// You might want to put the fire out first.
				if (fireboxData.onFire) {
					return;
				}

				if (fireboxData.coalLevel <= 0) {
					fireboxData.coalLevel = 0;
					fireboxData.isSoot = false;
					fireboxData.write();
					return;
				}

				const wasSoot = fireboxData.isSoot;

				if (fireboxData.isSoot) {
					core.sound_play("steam_soot_shovel", {
						pos: position,
						pitch: (math.random(80, 99) + math.random()) / 100,
					});
				} else {
					core.sound_play("steam_coal_add", {
						pos: position,
						pitch: (math.random(80, 99) + math.random()) / 100,
					});
				}

				fireboxData.coalLevel -= coalIncrement;
				fireboxData.coalLevel =
					math.round(fireboxData.coalLevel * 100) / 100;

				let triggerReturn = false;
				// That last bit is lost.
				if (fireboxData.coalLevel < 0) {
					triggerReturn = true;
					fireboxData.coalLevel = 0;
					fireboxData.isSoot = false;
				}

				fireboxData.write();
				manipulateFireEntity(position, getOrCreateEntity(position));

				if (triggerReturn) {
					return;
				}

				const param2 = node.param2;
				if (param2 == null) {
					core.log(
						LogLevel.error,
						`Param2 dissapeared at ${position}`
					);
					return;
				}

				const dir = vector.multiply(core.fourdir_to_dir(param2), -1);
				const outputPos = vector.add(
					position,
					vector.multiply(dir, 0.5)
				);

				if (wasSoot) {
					// todo: particle spawner and soot item.
				} else {
					// todo: particle spawner

					const entity = core.add_item(outputPos, "crafter:coal");
					if (entity == null) {
						core.log(
							LogLevel.error,
							`Player lost their coal at ${position}`
						);
						return;
					}
					entity.set_velocity(dir);
				}
			},

			on_rightclick(position, node, clicker, itemStack, pointedThing) {
				const meta = core.get_meta(position);
				const onFire = meta.get_int("coal_on_fire") > 0;
				const isSoot = meta.get_int("coal_is_soot") > 0;
				let coalLevel = meta.get_float("coal_level");

				const itemStackName = itemStack.get_name();

				// Basically gets disabled until you clean out the soot.
				if (
					!isSoot &&
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
					!isSoot &&
					currentState == "open" &&
					!onFire &&
					core.get_item_group(itemStackName, "torch") > 0 &&
					coalLevel > 0
				) {
					itemStack.take_item();
					meta.set_int("coal_on_fire", 1);
					manipulateFireEntity(position, getOrCreateEntity(position));
					return itemStack;
				} else if (
					!isSoot &&
					itemStackName == "crafter:bucket_water" &&
					onFire
				) {
					const hash = core.hash_node_position(position);
					const data = fireBoxSounds.get(hash);

					if (data != null) {
						core.sound_stop(data);
						fireBoxSounds.delete(hash);
					}

					meta.set_int("coal_on_fire", 0);
					meta.set_int("coal_is_soot", 1);
					manipulateFireEntity(position, getOrCreateEntity(position));

					clicker?.set_wielded_item(ItemStack("crafter:bucket"));
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
				const amount = coalLevel / coalIncrement;

				if (!onFire) {
					if (amount > 0) {
						itemHandling.throw_item(
							position,
							`crafter:coal ${amount}`
						);
					}
				} else {
					// todo: throw ash
				}

				const soundHandle = fireBoxSounds.get(hash);
				if (soundHandle != null) {
					core.sound_stop(soundHandle);
					fireBoxSounds.delete(hash);
				}
			},
		});
	}
}
