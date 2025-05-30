namespace stairs {
	//stairs - shift click to place upside down
	for (const [name, def] of pairs(core.registered_nodes)) {
		if (typeof name != "string") {
			core.log(
				LogLevel.warning,
				"Number in global registered nodes table"
			);
			continue;
		}

		if (
			def.drawtype == Drawtype.normal &&
			string.match(name, "crafter:")[0] != null
		) {
			// Set up stair.

			const def2: NodeDefinition = table.copy(
				def as LuaTable
			) as NodeDefinition;
			const newname =
				"crafter_stairs:" + string.gsub(name, "crafter:", "")[0] + "_stair";
			def2.mod_origin = "stairs";
			// def2.name = newname
			def2.description = def.description + " Stair";
			def2.drop = newname;
			def2.paramtype = ParamType1.light;
			def2.drawtype = Drawtype.nodebox;
			def2.paramtype2 = ParamType2.facedir;
			def2.node_placement_prediction = "";
			def2.node_box = {
				type: Nodeboxtype.fixed,
				fixed: [
					[-8 / 16, -8 / 16, -0 / 16, 8 / 16, 8 / 16, 8 / 16],
					[-8 / 16, -8 / 16, -8 / 16, 8 / 16, 0 / 16, 8 / 16],
				],
			};
			// Ability to place stairs upside down.
			def2.on_place = (
				itemstack: ItemStackObject,
				placer: ObjectRef,
				pointed_thing: PointedThing
			) => {
				const sneak: boolean = placer.get_player_control().sneak;
				if (sneak) {
					const [_, worked] = core.item_place(
						ItemStack(newname + "_upsidedown"),
						placer,
						pointed_thing
					);
					if (worked) {
						itemstack.take_item();
					}
				} else {
					core.item_place(itemstack, placer, pointed_thing);
				}
				return itemstack;
			};
			if (!def2.groups) {
				throw new Error(`Undefined groups for [${name}]`);
			}
			def2.groups["stairs"] = 1;
			core.register_node(newname, def2);

			core.register_craft({
				output: newname + " 6",
				recipe: [
					["", "", name],
					["", name, name],
					[name, name, name],
				],
			});

			core.register_craft({
				output: newname + " 6",
				recipe: [
					[name, "", ""],
					[name, name, ""],
					[name, name, name],
				],
			});
		}
	}

	// Upside down stairs.
	for (const [name, def] of pairs(core.registered_nodes)) {
		if (typeof name != "string") {
			core.log(
				LogLevel.warning,
				"Number in global registered nodes table"
			);
			continue;
		}

		if (
			def.drawtype == Drawtype.normal &&
			string.match(name, "crafter:")[0] != null
		) {
			const def2: NodeDefinition = table.copy(
				def as LuaTable
			) as NodeDefinition;
			const newname =
				"crafter_stairs:" +
				string.gsub(name, "crafter:", "")[0] +
				"_stair_upsidedown";
			def2.mod_origin = "stairs";
			// def2.name = newname
			def2.description = def.description + " Stair";
			def2.drop = string.gsub(newname, "_upsidedown", "")[0];
			def2.paramtype = ParamType1.light;
			def2.drawtype = Drawtype.nodebox;
			def2.paramtype2 = ParamType2.facedir;

			def2.node_box = {
				type: Nodeboxtype.fixed,
				fixed: [
					[-8 / 16, -8 / 16, -0 / 16, 8 / 16, 8 / 16, 8 / 16],
					[-8 / 16, -0 / 16, -8 / 16, 8 / 16, 8 / 16, 8 / 16],
				],
			};
			if (!def2.groups) {
				throw new Error(`Undefined groups for [${name}]`);
			}
			def2.groups["stairs"] = 1;
			core.register_node(newname, def2);
		}
	}

	//////////////////////////////////////////////////////- slabs

	// todo: Why isn't this just using the global place node thing that makes the sound play when you place a node?!
	function place_slab_sound(pos: Vec3, newnode: string): void {
		const node: NodeDefinition | null = core.registered_nodes[newnode];
		if (node == null) {
			core.log(
				LogLevel.warning,
				`Node [${newnode}] has a null definition`
			);
			return;
		}

		const sound: NodeSoundSpec | undefined = node.sounds;

		let placing: string | SimpleSoundSpec | null = null;

		if (sound && sound && sound.placing) {
			placing = sound.placing;
		}

		// Only play the sound when is defined.
		if (placing != null) {
			let finalSound: string = "";
			let finalGain = 1.0;
			if (typeof placing == "string") {
				finalSound = placing;
			} else if (placing.name) {
				finalSound = placing.name;
				if (placing.gain) {
					finalGain = placing.gain;
				}
			} else {
				core.log(
					LogLevel.warning,
					`Node [${newnode}] has a missing placing sound.`
				);
			}
			core.sound_play(finalSound, {
				pos: pos,
				gain: finalGain,
				//pitch = math.random(60,100)/100
			});
		}
	}
	// Slabs - shift click to place upside down.
	for (const [name, def] of pairs(core.registered_nodes)) {
		if (typeof name != "string") {
			core.log(
				LogLevel.warning,
				"Number in global registered nodes table"
			);
			continue;
		}
		if (def.drawtype == Drawtype.normal && string.match(name, "crafter:")[0] != null) {
			// Set up slab.
			const def2: NodeDefinition = table.copy(
				def as LuaTable
			) as NodeDefinition;
			const newname: string =
				"crafter_stairs:" + string.gsub(name, "crafter:", "")[0] + "_slab";
			def2.mod_origin = "stairs";
			// def2.name = newname
			def2.description = def.description + " Slab";
			def2.drop = newname;
			def2.paramtype = ParamType1.light;
			def2.drawtype = Drawtype.nodebox;

			def2.node_placement_prediction = "";
			def2.node_box = {
				type: Nodeboxtype.fixed,
				fixed: [[-8 / 16, -8 / 16, -8 / 16, 8 / 16, 0 / 16, 8 / 16]],
			};
			// We're passing in the local variables newname and name into this function
			// calculating wether to turn a half slab into a full block.
			def2.on_place = (
				itemstack: ItemStackObject,
				placer: ObjectRef,
				pointed_thing: PointedThing
			) => {
				//get all the required variables
				const sneak = placer.get_player_control().sneak;
				const ydiff = pointed_thing.above.y - pointed_thing.under.y;
				const node_under = core.get_node(pointed_thing.under).name;
				const rightsideup = newname == node_under;
				const upsidedown = newname + "_upsidedown" == node_under;

				let placement_worked = false;
				// Upside down slab placement.
				if (sneak == true) {
					const [_, worked] = core.item_place(
						ItemStack(newname + "_upsidedown"),
						placer,
						pointed_thing
					);
					if (worked) {
						itemstack.take_item();
						placement_worked = true;
					}
					// Normal placement - (back of slab) or normal node.
				} else if (
					(rightsideup && ydiff == -1) ||
					(upsidedown && ydiff == 1) ||
					(!rightsideup && !upsidedown) ||
					ydiff == 0
				) {
					// todo: check if this still works, _ used to be itemstack
					const [_, worked] = core.item_place(
						itemstack,
						placer,
						pointed_thing
					);
					if (worked) {
						placement_worked = true;
					}
					// Normal slab to full slab.
				} else if (rightsideup && ydiff == 1) {
					place_slab_sound(pointed_thing.under, newname);
					core.set_node(pointed_thing.under, { name: name });
					itemstack.take_item();
					placement_worked = true;
					// Upsidedown slab to full slab.
				} else if (upsidedown && ydiff == -1) {
					place_slab_sound(pointed_thing.under, newname);
					core.set_node(pointed_thing.under, { name: name });
					itemstack.take_item();
					placement_worked = true;
				}

				// Try to do pointed_thing above.
				if (placement_worked == false) {
					const node_above = core.get_node(pointed_thing.above).name;
					const rightsideup = newname == node_above;
					const upsidedown = newname + "_upsidedown" == node_above;
					if (rightsideup || upsidedown) {
						place_slab_sound(pointed_thing.above, newname);
						core.set_node(pointed_thing.above, { name: name });
						itemstack.take_item();
					}
				}

				return itemstack;
			};
			if (def2.groups == null) {
				throw new Error(`Undefined groups for [${name}]`);
			}
			def2.groups["slabs"] = 1;
			def2.groups[name] = 1;
			core.register_node(newname, def2);

			// Equalize recipe 6 half slabs turn into 3 full blocks.
			core.register_craft({
				output: newname + " 6",
				recipe: [[name, name, name]],
			});
			core.register_craft({
				output: name,
				recipe: [[newname], [newname]],
			});
		}
	}

	// Upside down stairs.
	for (const [name, def] of pairs(core.registered_nodes)) {
		if (typeof name != "string") {
			core.log(
				LogLevel.warning,
				"Number in global registered nodes table"
			);
			continue;
		}
		if (
			def.drawtype == Drawtype.normal &&
			string.match(name, "crafter:")[0] != null
		) {
			const def2: NodeDefinition = table.copy(
				def as LuaTable
			) as NodeDefinition;
			const newname: string =
				"crafter_stairs:" + string.gsub(name, "crafter:", "")[0] + "_slab_upsidedown";
			def2.mod_origin = "stairs";
			// def2.name = newname
			def2.description = def.description + " Slab";
			def2.drop = string.gsub(newname, "_upsidedown", "")[0];
			def2.paramtype = ParamType1.light;
			def2.drawtype = Drawtype.nodebox;
			def2.node_box = {
				type: Nodeboxtype.fixed,
				fixed: [[-8 / 16, -0 / 16, -8 / 16, 8 / 16, 8 / 16, 8 / 16]],
			};
			if (def2.groups == null) {
				throw new Error(`Undefined groups for [${name}]`);
			}
			def2.groups["slabs"] = 1;
			def2.groups[name] = 1;
			core.register_node(newname, def2);
		}
	}
}
