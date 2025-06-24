namespace sign {
	const lbm_restore_nodes = new Set<string>();

	// todo: Sign on stick will be an invisible node with an entity.
	// todo: The entity will rotate in 16 different positions.

	const default_text_scale: Vec2 = { x: 10, y: 10 };

	const block_list = new Set<number>();
	let totalblocks: number = 0;

	const onStickYaw: Dictionary<number, number> = {
		0: math.pi,
		1: math.pi / 2,
		2: 0,
		3: math.pi / -2,
	};

	const onWallYaw: Dictionary<number, number> = {
		2: math.pi / -2,
		3: math.pi / 2,
		4: 0,
		5: math.pi,
	};

	const hangingYaw: Dictionary<number, number> = {
		0: 0,
		1: math.pi / -2,
		2: math.pi,
		3: math.pi / 2,
	};

	const charDictionary: Dictionary<string, Vec2> = {
		A: vector.create2d(0, 0),
		B: vector.create2d(0, 1),
		C: vector.create2d(0, 2),
		D: vector.create2d(0, 3),
		E: vector.create2d(0, 4),
		F: vector.create2d(0, 5),
		G: vector.create2d(0, 6),
		H: vector.create2d(0, 7),
		I: vector.create2d(0, 8),
		J: vector.create2d(1, 0),
		K: vector.create2d(1, 1),
		L: vector.create2d(1, 2),
		M: vector.create2d(1, 3),
		N: vector.create2d(1, 4),
		O: vector.create2d(1, 5),
		P: vector.create2d(1, 6),
		Q: vector.create2d(1, 7),
		R: vector.create2d(1, 8),
		S: vector.create2d(2, 0),
		T: vector.create2d(2, 1),
		U: vector.create2d(2, 2),
		V: vector.create2d(2, 3),
		W: vector.create2d(2, 4),
		X: vector.create2d(2, 5),
		Y: vector.create2d(2, 6),
		Z: vector.create2d(2, 7),
		"-": vector.create2d(2, 8),
		a: vector.create2d(3, 0),
		b: vector.create2d(3, 1),
		c: vector.create2d(3, 2),
		d: vector.create2d(3, 3),
		e: vector.create2d(3, 4),
		f: vector.create2d(3, 5),
		g: vector.create2d(3, 6),
		h: vector.create2d(3, 7),
		i: vector.create2d(3, 8),
		j: vector.create2d(4, 0),
		k: vector.create2d(4, 1),
		l: vector.create2d(4, 2),
		m: vector.create2d(4, 3),
		n: vector.create2d(4, 4),
		o: vector.create2d(4, 5),
		p: vector.create2d(4, 6),
		q: vector.create2d(4, 7),
		r: vector.create2d(4, 8),
		s: vector.create2d(5, 0),
		t: vector.create2d(5, 1),
		u: vector.create2d(5, 2),
		v: vector.create2d(5, 3),
		w: vector.create2d(5, 4),
		x: vector.create2d(5, 5),
		y: vector.create2d(5, 6),
		z: vector.create2d(5, 7),
		" ": vector.create2d(5, 8),
		"0": vector.create2d(6, 0),
		"1": vector.create2d(6, 1),
		"2": vector.create2d(6, 2),
		"3": vector.create2d(6, 3),
		"4": vector.create2d(6, 4),
		"5": vector.create2d(6, 5),
		"6": vector.create2d(6, 6),
		"7": vector.create2d(6, 7),
		"8": vector.create2d(6, 8),
		"9": vector.create2d(7, 0),
		".": vector.create2d(7, 1),
		",": vector.create2d(7, 2),
		":": vector.create2d(7, 3),
		";": vector.create2d(7, 4),
		$: vector.create2d(7, 5),
		"#": vector.create2d(7, 6),
		"'": vector.create2d(7, 7),
		"!": vector.create2d(7, 8),
		'"': vector.create2d(8, 0),
		"/": vector.create2d(8, 1),
		"?": vector.create2d(8, 2),
		"%": vector.create2d(8, 3),
		"(": vector.create2d(8, 4),
		")": vector.create2d(8, 5),
		"@": vector.create2d(8, 6),
		"\\": vector.create2d(8, 7),
		"^": vector.create2d(8, 8),
	};

	function createCharComponent(x: number, y: number, char: string): string {
		if (char.length > 1) {
			core.log(
				LogLevel.error,
				`Malformed char? Unicode? What is this: [${char}]`
			);
			char = "?";
		}

		// Short circuit to question mark.
		const value: Vec2 = charDictionary[char] || { x: 8, y: 2 };

		// print(char, dump(value));

		return `^(([combine:${size}:${x},${y}=(crafter_sign_font.png\\^[sheet\\:9x9\\:${value.y},${value.x})))`;
	}

	function createLine(lineText: string, line: number): string {
		const literalY: number = line * 15 + 5;
		let literalX: number = 0;
		let outputString: string = "";
		let count: number = 0;
		const charWidth: number = 6;

		// Safety.
		if (line < 0 || line > 3) {
			throw new Error("Sign line out of range.");
		}

		// No need to do anything.
		if (lineText.length == 0 || lineText.trim().length == 0) {
			return "";
		}

		for (const char of lineText) {
			outputString += createCharComponent(literalX, literalY, char);

			literalX += charWidth;
			count++;
			if (count > 16) {
				core.log(
					LogLevel.warning,
					`Missing text filtering. Line: ${line}`
				);
				break;
			}
		}

		return outputString;
	}

	const size: string = "96x64";

	function createSignEntityTexture(data: string[]): string {
		if (data.length != 4) {
			core.log(
				LogLevel.error,
				`Sign api error: data array at length [${data.length}]. Bailing.`
			);
		}

		let signTextureData: string = `([combine:${size}^[fill:${size}:0,0:red)`;

		for (const i of $range(0, 3)) {
			signTextureData += createLine(data[i], i);
		}

		return signTextureData;
	}

	// Entity handling.
	class SignTextEntity extends types.Entity {
		name: string = "crafter_sign:text";
		initial_properties = {
			collisionbox: [0, 0, 0, 0, 0, 0],
			visual: EntityVisual.mesh,
			mesh: "signs_lib_standard_sign_entity_wall.obj",
			textures: [],
			static_save: false,
			backface_culling: false,
		};
	}
	utility.registerTSEntity(SignTextEntity);

	function deleteObjects(pos: Vec3) {
		const objects: ObjectRef[] = core.get_objects_inside_radius(pos, 0.5);

		for (const [_, v] of ipairs(objects)) {
			const e = v.get_luaentity();

			if (e == null) {
				continue;
			}

			if (string.match(e.name, "sign.*text")[0] != null) {
				v.remove();
				break;
			}
		}
	}

	function spawn_entity(pos: Vec3, texture?: string) {
		const node: NodeTable = core.get_node(pos);

		if (node.param2 == null) {
			throw new Error("This node should have param2 data.");
		}

		const def: NodeDefinition | undefined =
			core.registered_items[node.name];

		if (def == null) {
			return;
		}

		// Ensure the sign is part of this mod.
		if (!node.name.startsWith("crafter_sign:")) {
			core.log(
				LogLevel.error,
				`A sign was created at an incorrect node: [${node.name}]. Bailing out.`
			);
			return;
		}

		const text_scale: Vec2 = default_text_scale;

		const objects: ObjectRef[] = core.get_objects_inside_radius(pos, 0.5);

		let obj: ObjectRef | null = null;

		for (const [_, v] of ipairs(objects)) {
			const e: LuaEntity | null = v.get_luaentity();

			if (e == null) {
				continue;
			}
			if (e.name == "crafter_sign:text") {
				obj = v;
				break;
			}
		}

		if (obj == null) {
			obj = core.add_entity(pos, "crafter_sign:text");
			if (obj == null) {
				// This means something went very wrong and it gives up.
				core.log(LogLevel.error, `Failed to add sign at: ${dump(pos)}`);
				return;
			}
		}

		let yaw: number = 0;

		if (node.name.endsWith("_wall")) {
			const newYaw: number | undefined = onWallYaw[node.param2];
			if (newYaw == null) {
				throw new Error("wall yaw error.");
			}
			yaw = newYaw;
			obj.set_properties({
				mesh: "crafter_sign_text_entity_wall.obj",
			});
		} else if (node.name.endsWith("_onstick")) {
			const newYaw: number | undefined = onStickYaw[node.param2];
			if (newYaw == null) {
				throw new Error("onstick yaw error.");
			}
			yaw = newYaw;
			obj.set_properties({
				mesh: "crafter_sign_text_entity_onstick.obj",
			});
		} else if (node.name.endsWith("_hanging")) {
			const newYaw: number | undefined = hangingYaw[node.param2];
			if (newYaw == null) {
				throw new Error("hanging yaw error.");
			}
			yaw = newYaw;
			obj.set_properties({
				mesh: "crafter_sign_text_entity_hanging.obj",
			});
		} else {
			throw new Error(`Undefined sign: ${node.name}`);
		}

		obj.set_yaw(yaw);

		if (texture == null) {
			obj.set_properties({
				visual_size: text_scale,
			});
		} else {
			obj.set_properties({
				visual_size: text_scale,
				textures: [texture],
			});
		}
	}

	function setSignObjectText(pos: Vec3, data: string[]): void {
		deleteObjects(pos);
		spawn_entity(pos, createSignEntityTexture(data));
	}

	function destroySign(pos: Vec3) {
		deleteObjects(pos);
	}

	function constructSign(pos: Vec3) {
		let form =
			"formspec_version[9]" +
			"size[8,8]" +
			"style_type[field;border=false;font_size=32;textcolor=black]" +
			"style_type[label;font_size=32]" +
			"label[2.5,1;Edit sign message:]" +
			"image[1.595,2;4.3125,4.25;signs_lib_sign_wall_wooden_inv.png;]" +
			"field[1.875,2.545;3.75,0.5;line0;;${line0}]" +
			"field[1.875,3.075;3.75,0.5;line1;;${line1}]" +
			"field[1.875,3.6;3.75,0.5;line2;;${line2}]" +
			"field[1.875,4.125;3.75,0.5;line3;;${line3}]" +
			"bgcolor[;both;]" +
			"button_exit[1.87,6.5;3.76,0.5;ok;Done]";
		core.get_meta(pos).set_string("formspec", form);
	}

	function updateSign(
		pos: Vec3,
		fields?: { line0: string; line1: string; line2: string; line3: string }
	): void {
		const meta: MetaRef = core.get_meta(pos);

		let data: string[] = [
			fields?.line0 || meta.get_string("line0"),
			fields?.line1 || meta.get_string("line1"),
			fields?.line2 || meta.get_string("line2"),
			fields?.line3 || meta.get_string("line3"),
		];

		meta.set_string("line0", data[0]);
		meta.set_string("line1", data[1]);
		meta.set_string("line2", data[2]);
		meta.set_string("line3", data[3]);

		setSignObjectText(pos, data);
	}

	function receive_fields(
		pos: Vec3,
		formname: string,
		fields: any,
		sender: ObjectRef
	) {
		if (fields == null) {
			return;
		}

		if (
			fields.line0 != null &&
			fields.line1 != null &&
			fields.line2 != null &&
			fields.line3 != null &&
			fields.ok != null
		) {
			core.log(
				LogLevel.action,
				`${sender.get_player_name()} wrote: \n[${fields.line0}]\n[${
					fields.line1
				}]\n[${fields.line2}]\n[${fields.line3}]\nto sign at: (${
					pos.x
				}, ${pos.y}, ${pos.z})`
			);
			updateSign(pos, fields);
		}
	}

	// Make selection boxes.
	// sizex/sizey specified in inches because that's what MUTCD uses.
	function make_selection_boxes(
		sizex: number,
		sizey: number,
		foo?: number | null | boolean,
		xoffs?: number,
		yoffs?: number,
		zoffs?: number,
		is_facedir?: boolean
	): NodeBox {
		const tx: number = (sizex * 0.0254) / 2;
		const ty: number = (sizey * 0.0254) / 2;
		const xo: number = (xoffs && xoffs * 0.0254) || 0;
		const yo: number = (yoffs && yoffs * 0.0254) || 0;
		const zo: number = (zoffs && zoffs * 0.0254) || 0;
		if (is_facedir == null || !is_facedir) {
			return {
				type: Nodeboxtype.wallmounted,
				wall_side: [
					0.125 + zo,
					-ty + yo,
					-tx + xo,
					0.1875 + zo,
					ty + yo,
					tx + xo,
				],
			};
		} else {
			return {
				type: Nodeboxtype.fixed,
				fixed: [
					-tx + xo,
					-ty + yo,
					0.5 + zo,
					tx + xo,
					ty + yo,
					0.4375 + zo,
				],
			};
		}
	}

	function check_for_ceiling(pointed_thing: PointedThing): boolean {
		if (pointed_thing.above == null || pointed_thing.under == null) {
			return false;
		}
		if (
			pointed_thing.above.x == pointed_thing.under.x &&
			pointed_thing.above.z == pointed_thing.under.z &&
			pointed_thing.above.y < pointed_thing.under.y
		) {
			return true;
		}
		return false;
	}

	function check_for_floor(pointed_thing: PointedThing): boolean {
		if (pointed_thing.above == null || pointed_thing.under == null) {
			return false;
		}
		if (
			pointed_thing.above.x == pointed_thing.under.x &&
			pointed_thing.above.z == pointed_thing.under.z &&
			pointed_thing.above.y > pointed_thing.under.y
		) {
			return true;
		}
		return false;
	}

	//! Functions properly.
	function after_place_node(
		pos: Vec3,
		placer: ObjectRef,
		itemstack: ItemStackObject,
		pointed_thing: PointedThing
	) {
		const controls: PlayerControlObject = placer.get_player_control();
		const signname: string = itemstack.get_name();
		const no_wall_name: string = string.gsub(signname, "_wall", "")[0];
		const def: NodeDefinition | undefined = core.registered_items[signname];
		if (def == null) {
			core.log(
				LogLevel.error,
				"Undefined node. Failed to create sign components."
			);
			return;
		}
		const ppos = core.get_pointed_thing_position(pointed_thing);
		if (ppos == null) {
			core.log(LogLevel.error, "Failed to create sign components.");
			return;
		}

		if (!controls.sneak && check_for_ceiling(pointed_thing)) {
			const newparam2: number = core.dir_to_facedir(
				placer.get_look_dir()
			);
			core.swap_node(pos, {
				name: no_wall_name + "_hanging",
				param2: newparam2,
			});
		} else if (!controls.sneak && check_for_floor(pointed_thing)) {
			const newparam2: number = core.dir_to_facedir(
				placer.get_look_dir()
			);
			core.swap_node(pos, {
				name: no_wall_name + "_onstick",
				param2: newparam2,
			});
		} else if (
			def.paramtype2 == ParamType2.facedir &&
			check_for_ceiling(pointed_thing)
		) {
			core.swap_node(pos, { name: signname, param2: 6 });
		} else if (
			def.paramtype2 == ParamType2.facedir &&
			check_for_floor(pointed_thing)
		) {
			core.swap_node(pos, { name: signname, param2: 4 });
		}
	}

	// This seems to be using the decorator pattern.
	(() => {
		const standard_wood_groups: Dictionary<string, number> = (() => {
			const data: Dictionary<string, number> | undefined =
				core.registered_items["crafter:wood"]?.groups;
			if (data == null) {
				throw new Error("Logic error.");
			}
			const finalData = table.copy(
				data as any as LuaTable
			) as any as Dictionary<string, number>;

			finalData.sign = 1;
			finalData.attached_node = 1;
			return finalData;
		})();

		const name: string = "crafter_sign:sign_wall";
		const cbox = make_selection_boxes(35, 25);
		const def: NodeDefinition = {
			description: "Sign",
			node_placement_prediction: "",
			on_construct: constructSign,
			after_place_node: after_place_node,
			on_rightclick: constructSign,
			on_destruct: destroySign,
			on_receive_fields: receive_fields,
			paramtype: ParamType1.light,
			drawtype: Drawtype.mesh,
			mesh: "crafter_sign_wall.obj",
			drop: name,
			sounds: crafter.woodSound(),
			paramtype2: ParamType2.wallmounted,
			walkable: false,
			groups: standard_wood_groups,

			selection_box: cbox,
			node_box: cbox,
			sunlight_propagates: true,
			inventory_image: "signs_lib_sign_wall_wooden_inv.png",
			wield_image: "signs_lib_sign_wall_wooden_inv.png",
			tiles: [
				"signs_lib_sign_wall_wooden.png",
				"signs_lib_sign_wall_wooden_edges.png",
				"signs_lib_blank.png",
				"signs_lib_blank.png",
				"signs_lib_blank.png",
			],
		};

		core.register_node(name, def);
		lbm_restore_nodes.add(name);

		const no_wall_name = name.replaceAll("_wall", "");

		const othermounts_def: NodeDefinition = table.copy(
			def as any as LuaTable
		) as any as NodeDefinition;

		const offset: number = 0.3125;

		othermounts_def.selection_box = def.selection_box;
		othermounts_def.node_box = def.selection_box;

		if (othermounts_def.paramtype2 == ParamType2.wallmounted) {
			if (
				othermounts_def.node_box?.wall_side == null ||
				def.node_box?.wall_side == null ||
				othermounts_def.selection_box?.wall_side == null ||
				def.selection_box?.wall_side == null
			) {
				throw new Error("logic error.");
			}

			othermounts_def.node_box.wall_side[0] =
				(def.node_box.wall_side as box)[0] - offset;
			othermounts_def.node_box.wall_side[3] =
				(def.node_box.wall_side as box)[3] - offset;
			othermounts_def.selection_box.wall_side[0] =
				(def.selection_box.wall_side as box)[0] - offset;
			othermounts_def.selection_box.wall_side[3] =
				(def.selection_box.wall_side as box)[3] - offset;
		} else {
			if (
				othermounts_def.node_box?.fixed == null ||
				def.node_box?.fixed == null ||
				othermounts_def.selection_box?.fixed == null ||
				def.selection_box?.fixed == null
			) {
				throw new Error("logic error.");
			}

			othermounts_def.node_box.fixed[2] =
				(def.node_box.fixed as box)[2] + offset;
			othermounts_def.node_box.fixed[5] =
				(def.node_box.fixed as box)[5] + offset;
			othermounts_def.selection_box.fixed[2] =
				(def.selection_box.fixed as box)[2] + offset;
			othermounts_def.selection_box.fixed[5] =
				(def.selection_box.fixed as box)[5] + offset;
		}

		const hanging_def: NodeDefinition = table.copy(
			def as any as LuaTable
		) as any as NodeDefinition;

		hanging_def.use_texture_alpha = TextureAlpha.clip;
		hanging_def.paramtype2 = ParamType2.facedir;
		const hcbox = make_selection_boxes(35, 32, null, 0, 3, -18.5, true);
		hanging_def.selection_box = hcbox;
		hanging_def.node_box = hcbox;

		if (hanging_def.tiles == null) {
			throw new Error("Logic error 5");
		}

		hanging_def.tiles[2] = "signs_lib_hangers.png";

		hanging_def.mesh = "crafter_sign_hanging.obj";

		core.register_node(no_wall_name + "_hanging", hanging_def);
		lbm_restore_nodes.add(no_wall_name + "_hanging");

		const ydef: NodeDefinition = table.copy(
			def as any as LuaTable
		) as any as NodeDefinition;
		ydef.paramtype2 = ParamType2.facedir;
		const ycbox = make_selection_boxes(
			35,
			34.5,
			false,
			0,
			-1.25,
			-19.69,
			true
		);
		ydef.selection_box = ycbox;
		if (ydef.tiles == null) {
			throw new Error("Logic error 6");
		}
		ydef.tiles[2] = "wood.png";

		ydef.node_box = ycbox;

		ydef.mesh = string.gsub(
			string.gsub(ydef.mesh || "", "wall.obj$", "yard.obj")[0],
			"_facedir",
			""
		)[0];

		core.register_node(no_wall_name + "_onstick", ydef);
		lbm_restore_nodes.add(no_wall_name + "_onstick");
	})();

	core.register_craft({
		output: "crafter_sign:sign_wall 3",
		recipe: [
			["crafter:wood", "crafter:wood", "crafter:wood"],
			["crafter:wood", "crafter:wood", "crafter:wood"],
			["", "crafter:stick", ""],
		],
	});

	// Restore signs' text after /clearobjects and the like, the next time
	// a block is reloaded by the server.
	core.register_on_mods_loaded(() => {
		core.register_lbm({
			nodenames: Array.from(lbm_restore_nodes),
			name: ":crafter_sign:restore_sign_text",
			label: "Restore sign text",
			run_at_every_load: true,
			action: (pos: Vec3, node: NodeTable) => {
				updateSign(pos);
			},
		});
	});

	// Maintain a list of currently-loaded blocks.
	core.register_lbm({
		nodenames: ["group:sign"],
		name: "crafter_sign:update_block_list",
		label: "Update list of loaded blocks, log only those with signs",
		run_at_every_load: true,
		action: (pos: Vec3) => {
			const hash = core.hash_node_position(
				vector.floor(vector.divide(pos, core.MAP_BLOCKSIZE))
			);
			if (!block_list.has(hash)) {
				block_list.add(hash);
				totalblocks++;
			}
		},
	});

	// core.register_chatcommand("regen_signs", {
	// 	params = "",
	// 	privs = {server = true},
	// 	description = "Skims through all currently-loaded sign-bearing mapblocks, clears away any entities within each sign's node space, and regenerates their text entities, if any.",
	// 	func = function(player_name, params)
	// 		local allsigns = {}
	// 		local totalsigns = 0
	// 		for b in pairs(signs_lib.block_list) do
	// 			local blockpos = core.get_position_from_hash(b)
	// 			local pos1 = vector.multiply(blockpos, core.MAP_BLOCKSIZE)
	// 			local pos2 = vector.add(pos1, core.MAP_BLOCKSIZE - 1)
	// 			if core.get_node_or_nil(vector.add(pos1, core.MAP_BLOCKSIZE/2)) then
	// 				local signs_in_block = core.find_nodes_in_area(pos1, pos2, {"group:sign"})
	// 				allsigns[#allsigns + 1] = signs_in_block
	// 				totalsigns = totalsigns + #signs_in_block
	// 			else
	// 				signs_lib.block_list[b] = nil // if the block is no longer loaded, remove it from the table
	// 				signs_lib.totalblocks = signs_lib.totalblocks - 1
	// 			end
	// 		end
	// 		if signs_lib.totalblocks < 0 then signs_lib.totalblocks = 0 end
	// 		if totalsigns == 0 then
	// 			core.chat_send_player(player_name, "There are no signs in the currently-loaded terrain.")
	// 			signs_lib.block_list = {}
	// 			return
	// 		end
	// 		core.chat_send_player(player_name, "Found a total of "+totalsigns+" sign nodes across "+signs_lib.totalblocks+" blocks.")
	// 		core.chat_send_player(player_name, "Regenerating sign entities+.")
	// 		for _, b in pairs(allsigns) do
	// 			for _, pos in ipairs(b) do
	// 				signs_lib.delete_objects(pos)
	// 				local node = core.get_node(pos)
	// 				local def = core.registered_items[node.name]
	// 				if def and def.entity_info then
	// 					signs_lib.update_sign(pos)
	// 				end
	// 			end
	// 		end
	// 		core.chat_send_player(player_name, "Finished.")
	// 	end
	// })
}
