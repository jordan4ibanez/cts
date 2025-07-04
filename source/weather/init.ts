namespace weather {
	const weather_channel: ModChannel = core.mod_channel_join("weather_type");
	const weather_intake: ModChannel = core.mod_channel_join("weather_intake");
	const weather_nodes_channel: ModChannel =
		core.mod_channel_join("weather_nodes");

	// todo: Why is this doing this?
	weather_channel.send_all("");
	weather_intake.send_all("");
	weather_nodes_channel.send_all("");
	let weather_snowState: number = 0;

	const weather_max: number = 2;
	const mod_storage: MetaRef = core.get_mod_storage();

	let weather_type: number = mod_storage.get_int("weather_type");

	export function setWeatherType(newWeatherType: number): void {
		weather_type = newWeatherType;
		function_send_weather_type();
		update_player_sky();
	}

	utility.loadFiles(["commands"]);

	// todo: check if this is still true.
	// This updates players skys since it cannot be done clientside.
	function update_player_sky() {
		for (const [_, player] of ipairs(core.get_connected_players())) {
			if (weather_type != 0) {
				player.set_sky({
					base_color: "#808080",
					type: SkyParametersType.plain,
					clouds: false,
					sky_color: {
						day_sky: "#808080",
						dawn_horizon: "#808080",
						dawn_sky: "#808080",
						fog_sun_tint: "#808080",
						night_sky: "#808080",
						night_horizon: "#808080",
					},
				});
				player.set_sun({ visible: false, sunrise_visible: false });
				player.set_moon({ visible: false });
				player.set_stars({ visible: false });
			} else {
				player.set_sky({
					base_color: "#8cbafa",
					type: SkyParametersType.regular,
					clouds: true,
					sky_color: {
						day_sky: "#8cbafa",
						dawn_horizon: "#bac1f0",
						dawn_sky: "#b4bafa",
						night_sky: "#006aff",
						night_horizon: "#4090ff",
					},
				});
				player.set_sun({ visible: true, sunrise_visible: true });
				player.set_moon({ visible: true });
				player.set_stars({ visible: true });
			}
		}
	}

	// This tells the client mod to update the weather type.
	function function_send_weather_type() {
		weather_channel.send_all(tostring(weather_type));
	}
	// Index all mods.
	const all_nodes: string[] = [];

	core.register_on_mods_loaded(() => {
		for (const [name, _] of pairs(core.registered_items)) {
			if (name != "air" && name != "ignore") {
				all_nodes.push(name);
			}
		}
	});

	// todo: Why is this sending twice?

	// This sends the client all nodes that weather (particles) can be on top of, which is literally everything.
	// Have the client send the server the ready signal.
	core.register_on_modchannel_message(
		(channel_name: string, sender: string, message: string) => {
			if (channel_name != "weather_intake") {
				return;
			}
			core.after(0, () => {
				//print("sending player weather")
				// todo: figure out what this comment means: for some reason this variable assignment does not work outside the scope of this function
				const all_nodes_serialized: string = core.serialize(all_nodes);
				weather_nodes_channel.send_all(all_nodes_serialized);
				function_send_weather_type();
				update_player_sky();
			});
		}
	);

	core.register_on_joinplayer((player: ObjectRef) => {
		core.after(3, () => {
			const all_nodes_serialized: string = core.serialize(all_nodes);
			weather_nodes_channel.send_all(all_nodes_serialized);
			function_send_weather_type();
			update_player_sky();
		});
	});

	// Spawn snow nodes.
	const cDoSnow_call_count_for_blanket_coverage: number = 50; // how many calls of do_snow() are required for blanket snow coverage
	const cDoSnow_call_count_for_snowState_catchup: number = 20; // how many calls of do_snow() (at most) before weather_snowState will catch up to the pattern on the ground (e.g. if player went somewhere else while it was snowing then came back)
	// Fizzlefade constants for the shortest maximum length LFSR that can cover an 80 x 80 area (i.e. has a length larger than 6400)
	const cSnowState_LFSR_taps: number = 0x100d;
	const cSnowState_LFSR_length: number = 8191;
	const cSnow_length_x: number = 80; // (cSnow_length_x * cSnow_length_z) MUST be less than cSnowState_LFSR_length
	const cSnow_length_y: number = 80;
	const cSnow_length_z: number = 80; // (cSnow_length_x * cSnow_length_z) MUST be less than cSnowState_LFSR_length
	const snow_area: Vec3 = vector.create3d(
		cSnow_length_x,
		cSnow_length_y,
		cSnow_length_z
	);
	const snow_radius: Vec3 = vector.divide(snow_area, 2);
	const snowState_iterations_per_call: number = math.ceil(
		cSnowState_LFSR_length / cDoSnow_call_count_for_blanket_coverage
	);
	const snowState_max_catchup_per_call: number = math.ceil(
		cSnowState_LFSR_length / cDoSnow_call_count_for_snowState_catchup
	);

	const acceptable_drawtypes = new Set<Drawtype>([
		Drawtype.normal,
		Drawtype.glasslike,
		Drawtype.glasslike_framed,
		Drawtype.glasslike_framed_optional,
		Drawtype.allfaces,
		Drawtype.allfaces_optional,
	]);

	//? This is debug.
	//local average = {}

	function XOR(num1: number, num2: number): number {
		// This XOR function is excerpted from the Bitwise Operations Mod v1.2, by Leslie E. Krause
		// which is provided under the MIT License (MIT)
		// The MIT License (MIT)
		// Copyright (c) 2020, Leslie Krause (leslie@searstower.org)
		// Permission is hereby granted, free of charge, to any person obtaining a copy of this
		// software and associated documentation files (the "Software"), to deal in the Software
		// without restriction, including without limitation the rights to use, copy, modify, merge,
		// publish, distribute, sublicense, and/or sell copies of the Software, and to permit
		// persons to whom the Software is furnished to do so, subject to the following conditions:
		// The above copyright notice and this permission notice shall be included in all copies or
		// substantial portions of the Software.
		// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
		// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
		// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
		// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
		// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
		// DEALINGS IN THE SOFTWARE.
		let exp: number = 1;
		let res = 0;
		while (num1 > 0 || num2 > 0) {
			const rem1: number = num1 % 2;
			const rem2: number = num2 % 2;
			if (rem1 != rem2) {
				// Set each bit.
				res = res + exp;
			}
			num1 = (num1 - rem1) / 2;
			num2 = (num2 - rem2) / 2;
			exp = exp * 2;
		}
		return res;
	}

	function do_snow() {
		if (weather_type != 1) {
			return;
		}

		for (const [_, player] of ipairs(core.get_connected_players())) {
			//? This is debug.
			// const t0: number = core.get_us_time() / 1000000;

			const pos: Vec3 = vector.round(player.get_pos());
			const min: Vec3 = vector.subtract(pos, snow_radius);
			const max: Vec3 = vector.add(pos, snow_radius);
			const area_index: Vec3[] = core.find_nodes_in_area_under_air(
				min,
				max,
				all_nodes
			);

			// const node_search_time: number = math.ceil(
			// 	(core.get_us_time() / 1000000 - t0) * 1000
			// );

			const spawn_table: Dictionary<
				number,
				Dictionary<number, number>
			> = {};

			// The highest value is always indexed last in core.find_nodes_in_area_under_air,
			// so all that is needed is to iterate through it backwards and hook into the first
			// y value on the x and y and ignore the rest.

			let under_air_count: number = 0;

			for (const key of $range(area_index.length, 1, -1)) {
				const temp_pos: Vec3 = area_index[key - 1];

				const current: Dictionary<number, number> =
					spawn_table[temp_pos.x] || (spawn_table[temp_pos.x] = {});

				if (current[temp_pos.z] == null) {
					current[temp_pos.z] = temp_pos.y;
					under_air_count++;
				}
			}

			const bulk_list: Vec3[] = [];
			const ice_list: Vec3[] = [];
			let under_air_iterations = 0;
			let catchup_steps = 0;
			let lsfr_steps_count = 0;

			do {
				// "fizzelfade" in the snow with a Linear Feedback Shift Register (LFSR)
				// https://fabiensanglard.net/fizzlefade/index.php

				const lsb: number = weather_snowState % 2; // Get the output bit.
				weather_snowState = math.floor(weather_snowState / 2); // Shift register
				if (lsb == 1) {
					weather_snowState = XOR(
						weather_snowState,
						cSnowState_LFSR_taps
					);
				}

				lsfr_steps_count = lsfr_steps_count + 1;
				const location_bits: number = weather_snowState - 1; // LFSR values start at 1, but we want snow to be able to fall on (0, 0)
				const relative_x: number = location_bits % cSnow_length_x;
				const relative_z: number = math.floor(
					location_bits / cSnow_length_x
				);
				if (relative_z < cSnow_length_z) {
					// Align fizzelfade coords world-global.
					let x: number =
						math.floor(min.x / cSnow_length_x) * cSnow_length_x +
						relative_x;

					// Ensure it falls in the same space as area_index.
					if (x < min.x) {
						x = x + cSnow_length_x;
					}
					let x_index: Dictionary<number, number> | undefined =
						spawn_table[x];

					if (x_index != null) {
						// Align fizzelfade coords world-global.
						let z: number =
							math.floor(min.z / cSnow_length_z) *
								cSnow_length_z +
							relative_z;

						// Ensure it falls in the same space as area_index.
						if (z < min.z) {
							z = z + cSnow_length_z;
						}
						const y: number | undefined = x_index[z];
						if (y != null) {
							// We hit a location that's in the spawn_table.
							under_air_iterations = under_air_iterations + 1;
							const lightlevel: number =
								core.get_node_light(
									vector.create3d(x, y + 1, z),
									0.5
								) || 0;

							if (lightlevel >= 14) {
								// Daylight is above or near this node, so snow can fall on it.
								const node_name = core.get_node(
									vector.create3d(x, y, z)
								).name;
								const def: NodeDefinition | undefined =
									core.registered_nodes[node_name];

								if (def != null) {
									// // buildable = def.buildable_to
									const drawtype: boolean =
										(def.drawtype &&
											acceptable_drawtypes.has(
												def.drawtype
											)) ||
										false;
									const walkable: boolean =
										def.walkable || false;
									const liquid: boolean =
										def.liquidtype != LiquidType.none;

									if (
										!liquid &&
										walkable &&
										drawtype &&
										node_name != "crafter:ice"
									) {
										// 									//if buildable then
										// 									//	if node_name ~= "crafter_weather:snow" then
										// 									//		inserter(bulk_list, n_vec(x,y,z))
										// 									//	else
										// 									//		catchup_steps = catchup_steps + 1 // we've already snowed on this spot
										// 									//	end
										// 									//elseif walkable then
										if (
											core.get_node(
												vector.create3d(x, y + 1, z)
											).name != "crafter_weather:snow"
										) {
											bulk_list.push(
												vector.create3d(x, y + 1, z)
											);
										} else {
											catchup_steps = catchup_steps + 1; // we've already snowed on this spot
										}
										// 									//end
									} else if (node_name == "crafter:water") {
										ice_list.push(vector.create3d(x, y, z));
									}
								}
							}
						}
					}
				}
			} while (
				lsfr_steps_count - catchup_steps >=
					snowState_iterations_per_call ||
				catchup_steps >= snowState_max_catchup_per_call
			);

			if (bulk_list.length > 0) {
				core.bulk_set_node(bulk_list, { name: "crafter_weather:snow" });
			}
			if (ice_list.length > 0) {
				core.bulk_set_node(ice_list, { name: "crafter:ice" });
			}
			// 			//this is debug
			// 			//[[
			// 			local chugent = math.ceil((core.get_us_time()/1000000 - t0) * 1000)
			// 			print("////////////////////////////////-")
			// 			print("find_nodes_in_area_under_air() time: " .. node_search_time .. " ms")
			// 			print("New Snow generation time:            " .. chugent .. " ms  [" .. (chugent - node_search_time) .. " ms]")
			// 			inserter(average, chugent)
			// 			local a = 0
			// 			//don't cause memory leak
			// 			if get_table_size(average) > 10 then
			// 				table.remove(average,1)
			// 			end
			// 			for _,i in ipairs(average) do
			// 				a = a + i
			// 			end
			// 			print(dump(average))
			// 			a = a / get_table_size(average)
			// 			print("average = "..a.."ms")
			// 			core.chat_send_all("total nodes under air: " .. under_air_count .. ", LFSR iterations: " .. lsfr_steps_count .. ", under-air hits (nodes tested): " .. under_air_iterations .. "        Snow added: " .. (#bulk_list + #ice_list)  .. ", snow already there (catchup): " .. catchup_steps)
			// 			//print("////////////////////////////////-")
			// 			//]]//
		}
	}

	let snowTimer: number = 0;
	core.register_globalstep((delta: number) => {
		if (weather_type == 0) {
			return;
		}
		snowTimer += delta;
		if (snowTimer < 3) {
			return;
		}
		snowTimer -= 3;

		do_snow();
	});

	// This sets random weather.
	let initial_run: boolean = true;

	function randomize_weather() {
		if (!initial_run) {
			const new_weather: number = math.random(0, weather_max);
			if (new_weather != weather_type) {
				weather_type = new_weather;
			} else {
				weather_type = 0;
			}
			mod_storage.set_int("weather_type", weather_type);
		} else {
			initial_run = false;
		}
		function_send_weather_type();
		update_player_sky();
		core.after((math.random(15, 20) + math.random()) * 60, () => {
			randomize_weather();
		});
	}

	core.register_on_mods_loaded(() => {
		core.after(0, () => {
			if (mod_storage.get_int("weather_initialized") == 0) {
				mod_storage.set_int("weather_initialized", 1);
				weather_type = math.random(0, weather_max);
				mod_storage.set_int("weather_type", weather_type);
			}
			weather_snowState = math.max(
				mod_storage.get_int("weather_snowState"),
				1
			);
			randomize_weather();
		});
	});

	core.register_on_shutdown(() => {
		mod_storage.set_int("weather_type", weather_type);
		mod_storage.set_int("weather_snowState", weather_snowState);
	});

	function snowball_throw(player: ObjectRef): boolean {
		const pos: Vec3 = player.get_pos();

		pos.y = pos.y + 1.625;
		// Let other players hear the noise too.
		core.sound_play("woosh", {
			object: player,
			pitch: math.random(80, 100) / 100,
		});

		const snowball: ObjectRef | null = core.add_entity(
			pos,
			"crafter_weather:snowball"
		);

		const name: string = player.get_player_name();

		if (snowball == null) {
			core.log(
				LogLevel.error,
				`Failed to add snowball entity by ${name}`
			);
			return false;
		}

		const vel: Vec3 = player.get_velocity();
		snowball.set_velocity(
			vector.add(vel, vector.multiply(player.get_look_dir(), 20))
		);

		const luaEntity: SnowBallEntity | null =
			snowball.get_luaentity() as SnowBallEntity | null;

		if (luaEntity == null) {
			core.log(
				LogLevel.error,
				`Snowball entity was null when being thrown by ${name}`
			);
			return false;
		}

		luaEntity.thrower = name;

		return true;
	}

	core.register_node("crafter_weather:snow", {
		description: "Snow",
		tiles: ["snow_block.png"],
		groups: { pathable: 1, snow: 1, falling_node: 1 },
		sounds: crafter.woolSound(),
		paramtype: ParamType1.light,
		drawtype: Drawtype.nodebox,
		walkable: false,
		floodable: true,
		drop: {
			max_items: 5,
			items: [
				{
					items: ["crafter_weather:snowball"],
				},
				{
					items: ["crafter_weather:snowball"],
				},
				{
					items: ["crafter_weather:snowball"],
				},
				{
					items: ["crafter_weather:snowball"],
				},
				{
					rarity: 5,
					items: ["crafter_weather:snowball"],
				},
			],
		},

		buildable_to: true,
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [[-8 / 16, -8 / 16, -8 / 16, 8 / 16, -6 / 16, 8 / 16]],
		},
	});

	core.register_node("crafter_weather:snow_block", {
		description: "Snow",
		tiles: ["snow_block.png"],
		groups: { pathable: 1, snow: 1 },
		sounds: crafter.woolSound(),
		drop: {
			max_items: 5,
			items: [
				{
					items: ["crafter_weather:snowball"],
				},
				{
					items: ["crafter_weather:snowball"],
				},
				{
					items: ["crafter_weather:snowball"],
				},
				{
					items: ["crafter_weather:snowball"],
				},
				{
					rarity: 5,
					items: ["crafter_weather:snowball"],
				},
			],
		},
	});

	core.register_abm({
		label: "snow and ice melt",
		nodenames: ["crafter_weather:snow", "crafter:ice"],
		neighbors: ["air"],
		interval: 3,
		chance: 10,
		catch_up: true,
		action: (pos: Vec3) => {
			if (weather_type != 1) {
				core.remove_node(pos);
			}
		},
	});

	core.register_craftitem("crafter_weather:snowball", {
		description: "Snowball",
		inventory_image: "snowball.png",
		// 	//stack_max = 1,
		// 	//range = 0,
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		) => {
			const worked: boolean = snowball_throw(placer);
			if (worked) {
				itemstack.take_item();
			}
			return itemstack;
		},
		on_secondary_use: (
			itemstack: ItemStackObject,
			user: ObjectRef,
			pointed_thing: PointedThing
		) => {
			const worked: boolean = snowball_throw(user);
			if (worked) {
				itemstack.take_item();
			}
			return itemstack;
		},
	});

	class SnowBallEntity extends types.Entity {
		name: string = "crafter_weather:snowball";

		initial_properties: ObjectProperties = {
			hp_max: 1,
			physical: true,
			collide_with_objects: false,
			collisionbox: [-0.1, -0.1, -0.1, 0.1, 0.1, 0.1],
			visual: EntityVisual.sprite,
			visual_size: { x: 0.5, y: 0.5 },
			textures: ["snowball.png"],
			is_visible: true,
			pointable: false,
		};

		owner: ObjectRef | null = null;
		thrower: string | null = null;
		snowball: boolean = true;
		oldvel: Vec3 = vector.create3d();

		on_activate() {
			this.object.set_acceleration(vector.create3d(0, -9.81, 0));
		}
		// Make this as efficient as possible.
		// Make it so you can hit one snowball with another.
		on_step(dtime: number, moveResult: MoveResult) {
			const vel: Vec3 = this.object.get_velocity();
			let hit: boolean = false;
			const pos: Vec3 = this.object.get_pos();
			// Hit object with the snowball.
			for (const [_, object] of ipairs(
				core.get_objects_inside_radius(pos, 1)
			)) {
				if (
					(object.is_player() &&
						object.get_hp() > 0 &&
						object.get_player_name() != this.thrower) ||
					(object.get_luaentity() &&
						// todo: cast this into a mob.
						(object.get_luaentity() as any).mob == true &&
						object != this.owner)
				) {
					object.punch(this.object, 2, {
						full_punch_interval: 1.5,
						damage_groups: { damage: 0, fleshy: 0 },
					});

					hit = true;
					break;
				}
			}

			if (moveResult.collides || hit == true) {
				// Snowballs explode in the nether.
				if (pos.y <= -10033 && pos.y >= -20000) {
					this.object.remove();
					tnt.tnt(pos, 4);
					return;
				} else {
					core.sound_play("wool", {
						pos: pos,
						pitch: math.random(80, 100) / 100,
					});
					core.add_particlespawner({
						amount: 20,
						// Number of particles spawned over the time period `time`.
						time: 0.001,
						// Lifespan of spawner in seconds.
						// If time is 0 spawner has infinite lifespan and spawns the `amount` on
						// a per-second basis.
						minpos: pos,
						maxpos: pos,
						minvel: vector.create3d({ x: -2, y: 3, z: -2 }),
						maxvel: vector.create3d({ x: 2, y: 5, z: 2 }),
						minacc: vector.create3d({ x: 0, y: -9.81, z: 0 }),
						maxacc: vector.create3d({ x: 0, y: -9.81, z: 0 }),
						minexptime: 1,
						maxexptime: 3,
						minsize: 1,
						maxsize: 1,
						// The particles' properties are random values between the min and max
						// values.
						// pos, velocity, acceleration, expirationtime, size
						collisiondetection: true,
						collision_removal: true,
						object_collision: false,
						texture: "snowflake_" + math.random(1, 2) + ".png",
					});
					this.object.remove();
					return;
				}
			}
			this.oldvel = vel;
		}
	}
}
