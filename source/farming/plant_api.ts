namespace farming {
	// Plant growth time contants (in seconds).

	const plant_min: number = 60;
	const plant_max: number = 240;

	export enum PlantGrowth {
		// Sugar cane style.
		up,
		// Wheat style.
		inPlace,
		// Pumpkin style.
		inPlaceYields,
	}

	// todo: Break this up into 3 interfaces.

	interface PlantDefinition {
		stages: number;
		grows: PlantGrowth;
		grownNode?: string;
		drop: string;
		tiles: string[];
		groups: Dictionary<string, number>;
		description: string;
		drawtype: Drawtype;
		waving?: number;
		inventory_image?: string;
		walkable?: boolean;
		climbable?: boolean;
		paramtype?: ParamType1;
		paramtype2?: ParamType2;
		buildable_to?: boolean;
		sounds?: NodeSoundSpec;
		selection_box?: NodeBox;
		node_box?: NodeBox;
		sunlight_propagates?: boolean;

		// This part is for the stem.
		stem_description?: string;
		stem_tiles?: string[];
		stem_drawtype?: Drawtype;
		stem_walkable?: boolean;
		stem_sunlight_propagates?: boolean;
		stem_paramtype?: ParamType1;
		stem_drop?: string;
		stem_groups?: Dictionary<string, number>;
		stem_sounds?: NodeSoundSpec;
		stem_node_box?: NodeBox;
		stem_selection_box?: NodeBox;

		// This part is for the fruit.
		fruit_name?: string;
		fruit_description?: string;
		fruit_tiles?: string[];
		fruit_groups?: Dictionary<string, number>;
		fruit_sounds?: NodeSoundSpec;
		fruit_drop?: string;
	}

	export function register_plant(name: string, def: PlantDefinition) {
		const max: number = def.stages;

		if (max <= 0) {
			throw new Error(`Invalid stages for [${name}]`);
		}

		if (def.grows == PlantGrowth.inPlaceYields && def.grownNode == null) {
			throw new Error(
				`Plant [${name}] uses in place yields. Requires grown node.`
			);
		}

		for (const i of $range(1, max)) {
			let nodename: string = "";

			if (def.stages > 1) {
				nodename = "farming:" + name + "_" + i;
			} else {
				nodename = "farming:" + name;
			}

			let after_dig_node:
				| ((
						position: Vec3,
						oldNode: NodeTable,
						oldMeta: string,
						digger: ObjectRef
				  ) => void)
				| undefined;

			let on_abm: ((pos: Vec3) => void) | undefined;
			let after_place_node:
				| ((
						pos: Vec3,
						placer: ObjectRef,
						itemstack: ItemStackObject,
						pointed_thing: PointedThing
				  ) => void)
				| undefined;

			// Do custom functions for each node
			// whether growing in place or up.
			if (def.grows == PlantGrowth.up) {
				after_dig_node = (
					pos: Vec3,
					node: NodeTable,
					metadata: string,
					digger: ObjectRef
				) => {
					const np = vector.create3d({
						x: pos.x,
						y: pos.y + 1,
						z: pos.z,
					});
					const nn: NodeTable = core.get_node(np);
					if (nn.name == node.name) {
						core.node_dig(np, nn, digger);
						core.sound_play("dirt", { pos: pos, gain: 0.2 });
					}
				};

				on_abm = (pos) => {
					{
						const possibleLight = core.get_node_light(pos, null);
						if (possibleLight == null || possibleLight < 10) {
							// print("failed to grow at " + dump(pos));
							return;
						}
					}
					const found: Vec3 | null = core.find_node_near(pos, 3, [
						"crafter:water",
						"crafter:waterflow",
					]);
					pos.y = pos.y - 1;

					const noder: string = core.get_node(pos).name;
					const found_soil: boolean =
						core.get_item_group(noder, "soil") > 0;
					const found_self: boolean = noder == nodename;
					if (found && (found_soil || found_self)) {
						pos.y = pos.y + 2;
						if (core.get_node(pos).name == "air") {
							core.set_node(pos, { name: "farming:" + name });
						}
					} else if (!found_self) {
						pos.y = pos.y + 1;
						core.dig_node(pos);
						core.sound_play("dirt", { pos: pos, gain: 0.2 });
					}
				};

				after_place_node = (
					pos: Vec3,
					placer: ObjectRef,
					itemstack: ItemStackObject,
					pointed_thing: PointedThing
				) => {
					pos.y = pos.y - 1;
					const noder: string = core.get_node(pos).name;
					const found: boolean =
						core.get_item_group(noder, "soil") > 0;
					if (!found) {
						pos.y = pos.y + 1;
						core.dig_node(pos);
					}
				};
				// For plants that grow in place.
			} else if (def.grows == PlantGrowth.inPlace) {
				on_abm = (pos: Vec3) => {
					{
						const possibleLight: number | null =
							core.get_node_light(pos, null);

						if (possibleLight == null || possibleLight < 10) {
							core.dig_node(pos);
							core.sound_play("dirt", { pos: pos, gain: 0.2 });
							// print("failed to grow at " + dump(pos));
							return;
						}
					}

					pos.y = pos.y - 1;
					const found: boolean =
						core.get_item_group(
							core.get_node(pos).name,
							"farmland"
						) > 0;
					// If farmland is found below.
					if (found) {
						if (i < max) {
							pos.y = pos.y + 1;
							core.set_node(pos, {
								name: "farming:" + name + "_" + tostring(i + 1),
							});
						}
						// If farmland is not found.
					} else {
						core.dig_node(pos);
						core.sound_play("dirt", { pos: pos, gain: 0.2 });
					}
				};

				after_place_node = (
					pos: Vec3,
					placer: ObjectRef,
					itemstack: ItemStackObject,
					pointed_thing: PointedThing
				) => {
					pos.y = pos.y - 1;
					const noder: string = core.get_node(pos).name;
					const found: boolean =
						core.get_item_group(noder, "farmland") > 0;
					if (!found) {
						pos.y = pos.y + 1;
						core.dig_node(pos);
					}
				};
			} else if (def.grows == PlantGrowth.inPlaceYields) {
				on_abm = (pos: Vec3) => {
					{
						const possibleLight: number | null =
							core.get_node_light(pos, null);
						if (possibleLight == null || possibleLight < 10) {
							core.dig_node(pos);
							core.sound_play("dirt", { pos: pos, gain: 0.2 });
							// print("failed to grow at " + dump(pos));
							return;
						}
					}

					pos.y = pos.y - 1;
					const found: boolean =
						core.get_item_group(
							core.get_node(pos).name,
							"farmland"
						) > 0;

					// If found farmland below.
					if (found) {
						if (i < max) {
							pos.y = pos.y + 1;
							core.set_node(pos, {
								name: "farming:" + name + "_" + (i + 1),
							});
						} else {
							pos.y = pos.y + 1;
							let found: boolean = false;
							let add_node: Vec3 | undefined;

							for (const x of $range(-1, 1)) {
								if (!found) {
									for (const z of $range(-1, 1)) {
										if (math.abs(x) + math.abs(z) == 1) {
											const node_get: boolean =
												core.get_node(
													vector.create3d(
														pos.x - x,
														pos.y,
														pos.z - z
													)
												).name == "air";
											if (node_get) {
												add_node = vector.create3d(
													pos.x - x,
													pos.y,
													pos.z - z
												);
												found = true;
											}
										}
									}
								}
							}

							if (found && add_node != null) {
								const param2: number = core.dir_to_facedir(
									vector.direction(pos, add_node)
								);

								if (def.grownNode == null) {
									throw new Error(
										`API failure for [${name}]`
									);
								}

								core.add_node(add_node, {
									name: def.grownNode,
									param2: param2,
								});
								const facedir: Vec3 =
									core.facedir_to_dir(param2);
								const inverted_facedir: Vec3 = vector.multiply(
									facedir,
									-1
								);
								core.set_node(
									vector.add(inverted_facedir, add_node),
									{
										name: "farming:" + name + "_complete",
										param2: core.dir_to_facedir(facedir),
									}
								);
							}
						}

						// If not found farmland.
					} else {
						core.dig_node(pos);
						core.sound_play("dirt", { pos: pos, gain: 0.2 });
					}
				};

				after_place_node = (
					pos: Vec3,
					placer: ObjectRef,
					itemstack: ItemStackObject,
					pointed_thing: PointedThing
				) => {
					pos.y = pos.y - 1;
					const noder: string = core.get_node(pos).name;
					const found: boolean =
						core.get_item_group(noder, "farmland") > 0;
					if (!found) {
						pos.y = pos.y + 1;
						core.dig_node(pos);
					}
				};
			}
			// Allow plants to only drop item at max stage.
			let drop: string = "";

			if (i == max && def.grows != PlantGrowth.inPlaceYields) {
				drop = def.drop;
			} else if (max == 1) {
				drop = def.drop;
			}

			let tiles: string[] = [];
			if (max > 1) {
				tiles = [def.tiles[0] + "_" + i + ".png"];
			} else {
				tiles = def.tiles;
			}
			def.groups.plants = 1;
			core.register_node(nodename, {
				description: def.description,
				drawtype: def.drawtype,
				waving: def.waving,
				inventory_image: def.inventory_image,
				walkable: def.walkable,
				climbable: def.climbable,
				paramtype: def.paramtype,
				tiles: tiles,
				paramtype2: def.paramtype2,
				buildable_to: def.buildable_to,
				groups: def.groups,
				sounds: def.sounds,
				selection_box: def.selection_box,
				drop: drop,
				sunlight_propagates: def.sunlight_propagates,
				node_box: def.node_box,
				node_placement_prediction: "",
				is_ground_content: false,
				// Flooding function.
				floodable: true,
				on_flood: (pos, oldnode, newnode) => {
					core.dig_node(pos);
				},
				after_dig_node: after_dig_node,
				after_place_node: after_place_node,
			});

			if (on_abm != null) {
				core.register_abm({
					label: nodename + " Grow",
					nodenames: [nodename],
					neighbors: ["air"],
					interval: 6,
					chance: 250,
					catch_up: true,
					action: (pos: Vec3) => {
						on_abm(pos);
					},
				});
			}
		}

		// Create final stage for grow in place plant stems that create food.
		if (def.grows == PlantGrowth.inPlaceYields) {
			core.register_node("farming:" + name + "_complete", {
				description: def.stem_description,
				tiles: def.stem_tiles,
				drawtype: def.stem_drawtype,
				walkable: def.stem_walkable,
				sunlight_propagates: def.stem_sunlight_propagates,
				paramtype: def.stem_paramtype,
				drop: def.stem_drop,
				groups: def.stem_groups,
				sounds: def.stem_sounds,
				node_box: def.stem_node_box,
				selection_box: def.stem_selection_box,
				paramtype2: ParamType2.facedir,
			});

			if (def.fruit_name == null) {
				throw new Error(`Plant [${name}] fruit is missing a name.`);
			}

			core.register_node("farming:" + def.fruit_name, {
				description: def.fruit_description,
				tiles: def.fruit_tiles,
				groups: def.fruit_groups,
				sounds: def.fruit_sounds,
				drop: def.fruit_drop,
				// This is hardcoded to work no matter what.
				paramtype2: ParamType2.facedir,
				after_destruct: (pos, oldnode) => {
					// local facedir = oldnode.param2
					// facedir = core.facedir_to_dir(facedir)
					// local dir = vector.multiply(facedir,-1)
					// local stem_pos = vector.add(dir,pos)
					// if core.get_node(stem_pos).name == "farming:"+name+"_complete" then
					//     core.set_node(stem_pos, {name = "farming:"+name+"_1"})
					// end
				},
			});
		}

		// 	if def.seed_name then
		// 		core.register_craftitem("farming:"+def.seed_name+"_seeds", {
		// 			description = def.seed_description,
		// 			inventory_image = def.seed_inventory_image,
		// 			on_place = function(itemstack, placer, pointed_thing)
		// 				if pointed_thing.type ~= "node" then
		// 					return itemstack
		// 				end
		// 				local pointed_thing_diff = pointed_thing.above.y - pointed_thing.under.y
		// 				if pointed_thing_diff < 1 then return end
		// 				if core.get_node(pointed_thing.above).name ~= "air" then return end
		// 				local pb = pointed_thing.above
		// 				if core.get_node_group(core.get_node(vector.new(pb.x,pb.y-1,pb.z)).name, "farmland") == 0 or core.get_node(pointed_thing.above).name ~= "air"  then
		// 					return itemstack
		// 				end
		// 				local wdir = core.dir_to_wallmounted(vector.subtract(pointed_thing.under,pointed_thing.above))
		// 				local fakestack = itemstack
		// 				local retval = false
		// 				retval = fakestack:set_name(def.seed_plants)
		// 				if not retval then
		// 					return itemstack
		// 				end
		// 				itemstack, retval = core.item_place(fakestack, placer, pointed_thing, wdir)
		// 				itemstack:set_name("farming:"+def.seed_name+"_seeds")
		// 				if retval then
		// 					core.sound_play("leaves", {pos=pointed_thing.above, gain = 1.0})
		// 				end
		// 				return itemstack
		// 			end
		// 		})
		// 	end
	}
}
