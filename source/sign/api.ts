namespace sign {
	export const lbm_restore_nodes = new Set<string>();
	export const old_fenceposts = {};
	export const old_fenceposts_replacement_signs = {};
	export const old_fenceposts_with_signs = {};
	// Settings used for a standard wood or steel wall sign.
	export const standard_lines: number = 6;
	export const standard_hscale: number = 1;
	export const standard_vscale: number = 1;
	export const standard_lspace: number = 1;
	export const standard_fsize: number = 15;
	export const standard_xoffs: number = 4;
	export const standard_yoffs: number = 0;
	export const standard_cpl: number = 35;

	const path: string | null = core.get_modpath(core.get_current_modname());
	if (path == null) {
		throw new Error("How did this happen?");
	}

	export const standard_wood_groups: Dictionary<string, number> = (() => {
		const data: Dictionary<string, number> | undefined =
			core.registered_items["crafter:wood"]?.groups;
		if (data == null) {
			throw new Error("Logic error.");
		}
		return table.copy(data as any as LuaTable) as any as Dictionary<
			string,
			number
		>;
	})();

	standard_wood_groups.sign = 1;
	// todo: Why?
	standard_wood_groups.attached_node = 0;

	export const standard_wood_sign_sounds = (() => {
		const data = core.registered_nodes["crafter:wood"]?.sounds;
		if (data == null) {
			throw new Error("Logic error.");
		}
		return table.copy(data as any as LuaTable) as any as Dictionary<
			string,
			number
		>;
	})();

	export const default_text_scale: Vec2 = { x: 10, y: 10 };
	export const old_widefont_signs = {};
	export const block_list = new Set<number>();
	let totalblocks: number = 0;
	export const standard_yaw: number[] = [
		0,
		math.pi / -2,
		math.pi,
		math.pi / 2,
	];

	// fixme: the first two were nil instead of 0, this may cause problems.
	export const wallmounted_yaw: number[] = [
		0,
		0,
		math.pi / -2,
		math.pi / 2,
		0,
		math.pi,
	];

	export const fdir_to_back: number[][] = [
		[0, -1],
		[-1, 0],
		[0, 1],
		[1, 0],
	];

	// fixme: the first two were nil instead of [0,0], this may cause problems.
	export const wall_fdir_to_back: number[][] = [
		[0, 0],
		[0, 0],
		[0, 1],
		[0, -1],
		[-1, 0],
		[1, 0],
	];

	export const fdir_flip_to_back: Dictionary<number, number[]> = {
		[0]: [0, 2],
		[1]: [2, 0],
		[2]: [0, -2],
		[3]: [-2, 0],
	};

	export const wall_fdir_flip_to_back: Dictionary<number, number[]> = {
		[2]: [2, 0],
		[3]: [-2, 0],
		[4]: [0, 2],
		[5]: [0, -2],
	};

	export const fdir_to_back_left: Dictionary<number, number[]> = {
		[0]: [-1, 1],
		[1]: [1, 1],
		[2]: [1, -1],
		[3]: [-1, -1],
	};

	export const wall_fdir_to_back_left: Dictionary<number, number[]> = {
		[2]: [1, 1],
		[3]: [-1, -1],
		[4]: [-1, 1],
		[5]: [1, -1],
	};

	export const rotate_walldir: Dictionary<number, number> = {
		[0]: 4,
		[1]: 0,
		[2]: 5,
		[3]: 1,
		[4]: 2,
		[5]: 3,
	};

	export const rotate_walldir_simple: Dictionary<number, number> = {
		[0]: 4,
		[1]: 4,
		[2]: 5,
		[3]: 4,
		[4]: 2,
		[5]: 3,
	};
	export const rotate_facedir: Dictionary<number, number> = {
		[0]: 1,
		[1]: 2,
		[2]: 3,
		[3]: 4,
		[4]: 6,
		[5]: 6,
		[6]: 0,
	};
	export const rotate_facedir_simple: Dictionary<number, number> = {
		[0]: 1,
		[1]: 2,
		[2]: 3,
		[3]: 0,
		[4]: 0,
		[5]: 0,
	};

	export const flip_facedir: Dictionary<number, number> = {
		[0]: 2,
		[1]: 3,
		[2]: 0,
		[3]: 1,
		[4]: 6,
		[5]: 4,
		[6]: 4,
	};

	export const flip_walldir: Dictionary<number, number> = {
		[0]: 1,
		[1]: 0,
		[2]: 3,
		[3]: 2,
		[4]: 5,
		[5]: 4,
	};

	// Initialize character texture cache.
	const ctexcache: Dictionary<string, string> = {};

	// Entity handling.
	class SignTextEntity extends types.Entity {
		name: string = "crafter_sign:text";
		initial_properties = {
			collisionbox: [0, 0, 0, 0, 0, 0],
			visual: EntityVisual.mesh,
			mesh: "signs_lib_standard_wall_sign_entity.obj",
			textures: [],
			static_save: false,
			backface_culling: false,
		};
	}
	utility.registerTSEntity(SignTextEntity);

	export function delete_objects(pos: Vec3) {
		const objects: ObjectRef[] = core.get_objects_inside_radius(pos, 0.5);

		for (const [_, v] of ipairs(objects)) {
			const e = v.get_luaentity();

			if (e == null) {
				continue;
			}

			if (string.match(e.name, "sign.*text") != null) {
				v.remove();
			}
		}
	}

	interface SignNodeDefinition extends NodeDefinition {
		entity_info?: {
			yaw: number[];
			mesh: string;
		};
	}

	export function spawn_entity(pos: Vec3, texture?: string) {
		const node: NodeTable = core.get_node(pos);
		const def: SignNodeDefinition | undefined =
			core.registered_items[node.name];

		if (def == null || def.entity_info == null) {
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

		let yaw: number = def.entity_info.yaw[(node.param2 || 0) + 2] || 0;

		let pitch: number = 0;

		if (
			string.find(node.name, "onpole") == null &&
			string.find(node.name, "hanging") == null
		) {
			const rot90: number = math.pi / 2;
			if (def.paramtype2 == ParamType2.wallmounted) {
				// On floor.
				if (node.param2 == 1) {
					pitch = -rot90;
					yaw = 0;
					// On ceiling.
				} else if (node.param2 == 0) {
					pitch = rot90;
					yaw = math.pi;
				}
			} else if (def.paramtype2 == ParamType2.facedir) {
				if (node.param2 == 4) {
					pitch = -rot90;
					yaw = 0;
				} else if (node.param2 == 6) {
					pitch = rot90;
					yaw = math.pi;
				}
			}
		}

		obj.set_rotation(vector.create3d({ x: pitch, y: yaw, z: 0 }));
		if (texture == null) {
			obj.set_properties({
				mesh: def.entity_info.mesh,
				visual_size: text_scale,
			});
		} else {
			obj.set_properties({
				mesh: def.entity_info.mesh,
				visual_size: text_scale,
				textures: [texture],
			});
		}
	}

	export function set_obj_text(pos: Vec3, text: string): void {
		delete_objects(pos);
		spawn_entity(
			pos,
			make_sign_texture(split_lines_and_words(Utf8ToAnsi(text)), pos)
		);
	}

	// Rotation.
	export function handle_rotation(
		pos: Vec3,
		node: NodeTable,
		user: ObjectRef
	): boolean {
		let newparam2: number = 0;
		let tpos: Vec3 = vector.copy(pos);
		const def: NodeDefinition | undefined =
			core.registered_items[node.name];

		if (def == null) {
			core.log(LogLevel.error, `Undefined node. Bailing.`);
			return false;
		}
		if (string.match(node.name, "_onpole") != null) {
			if (string.match(node.name, "_horiz") == null) {
				newparam2 = rotate_walldir_simple[node.param2 || 0] || 4;
				let t: Dictionary<number, number[]> = wall_fdir_to_back_left;

				if (def.paramtype2 != ParamType2.wallmounted) {
					newparam2 = rotate_facedir_simple[node.param2 || 0] || 0;
					t = fdir_to_back_left;
				}

				const newData: number[] = t[node.param2 || 0] || [0, 0];
				tpos = vector.create3d({
					x: pos.x + (newData[0] || 0),
					y: pos.y,
					z: pos.z + newData[1],
				});
			} else {
				// Flip the sign to the other side of the horizontal pole.
				newparam2 = flip_walldir[node.param2 || 0] || 4;
				let t: Dictionary<number, number[]> = wall_fdir_flip_to_back;
				if (def.paramtype2 != ParamType2.wallmounted) {
					newparam2 = flip_facedir[node.param2 || 0] || 0;
					t = fdir_flip_to_back;
				}

				const newData: number[] = t[node.param2 || 0] || [0, 0];

				tpos = vector.create3d({
					x: pos.x + newData[0],
					y: pos.y,
					z: pos.z + newData[1],
				});
			}

			const node2: NodeTable = core.get_node(tpos);
			const def2: NodeDefinition | undefined =
				core.registered_items[node2.name];
			// Undefined, or not buildable_to.
			if (def2 == null || !def2.buildable_to) {
				return true;
			}
			core.set_node(tpos, { name: node.name, param2: newparam2 });
			core.get_meta(tpos).from_table(core.get_meta(pos).to_table());

			core.remove_node(pos);
			delete_objects(pos);
		} else if (
			string.match(node.name, "_hanging") != null ||
			string.match(node.name, "yard") != null
		) {
			core.swap_node(tpos, {
				name: node.name,
				param2: rotate_facedir_simple[node.param2 || 0] || 0,
			});
		} else if (def.paramtype2 == ParamType2.wallmounted) {
			core.swap_node(tpos, {
				name: node.name,
				param2: rotate_walldir[node.param2 || 0] || 0,
			});
		} else {
			core.swap_node(tpos, {
				name: node.name,
				param2: rotate_facedir[node.param2 || 0] || 0,
			});
		}

		update_sign(tpos);
		return true;
	}

	let expect_infinite_stacks: boolean = false;
	// Infinite stacks.
	if (core.settings.get_bool("creative_mode")) {
		expect_infinite_stacks = true;
	}
	// CONSTANTS
	// Path to the textures.
	const TP = path + "/textures";
	// Font file formatter.
	const CHAR_FILE: string = "%s_%02x.png";
	// Fonts path.
	const CHAR_PATH: string = TP + "/" + CHAR_FILE;

	const PNG_HDR: string = string.char(
		0x89,
		0x50,
		0x4e,
		0x47,
		0x0d,
		0x0a,
		0x1a,
		0x0a
	);
	// Check if a file does exist.
	// To avoid reopening file after checking again
	// pass TRUE as second argument.

	function getFile(name: string, mode: string): LuaFile | undefined {
		const [f] = io.open(name, mode);
		return f;
	}

	function file_exists(name: string): boolean {
		const [f] = io.open(name, "r");
		if (f != null) {
			io.close(f);
			return true;
		} else {
			return false;
		}
	}

	// Read the image size from a PNG file.
	// Returns image_w, image_h.
	// Only the LSB is read from each field!
	function read_image_size(filename: string): [number, number] {
		const f: LuaFile | undefined = getFile(filename, "rb");
		// File might not exist (don't crash the game).
		if (f == null) {
			core.log(LogLevel.error, `File ${filename} does not exist.`);
			return [0, 0];
		}
		f.seek("set", 0x0);
		const hdr = f.read(string.len(PNG_HDR));
		if (hdr != PNG_HDR) {
			f.close();
			core.log(LogLevel.error, `File ${filename} wrong format.`);
			return [0, 0];
		}
		f.seek("set", 0x13);
		const ws: string | undefined = f.read(1);
		f.seek("set", 0x17);
		const hs: string | undefined = f.read(1);
		f.close();

		if (ws == null || hs == null) {
			core.log(LogLevel.error, `File ${filename} corrupted file.`);
			return [0, 0];
		}

		return [string.byte(ws), string.byte(hs)];
	}

	// 4 rows, max 80 chars per, plus a bit of fudge to
	// avoid excess trimming (e.g. due to color codes).
	const MAX_INPUT_CHARS: number = 400;
	// Helper functions to trim sign text input/output.
	function trim_input(text: string): string {
		return string.sub(text, 1, math.min(MAX_INPUT_CHARS, text.length));
	}

	function build_char_db(
		font_size: number
	): [Dictionary<string, number>, number, number, number] {
		const cw: Dictionary<string, number> = {};
		// To calculate average char width.
		let total_width = 0;
		let char_count = 0;
		for (const c of $range(32, 255)) {
			// Todo: finish this.
			const [w, h] = read_image_size(
				string.format(
					CHAR_PATH,
					"signs_lib_font_" + font_size + "px",
					c
				)
			);

			const ch: string = string.char(c);
			cw[ch] = w;
			total_width = total_width + w;
			char_count = char_count + 1;
		}
		const [cbw, cbh] = read_image_size(
			TP + "/signs_lib_color_" + font_size + "px_n.png"
		);
		assert(cbw > 0 && cbh > 0, "error reading bg dimensions");
		return [cw, cbw, cbh, total_width / char_count];
	}

	const [charwidth15, colorbgw15, lineheight15, avgwidth15] =
		build_char_db(15);

	const [charwidth31, colorbgw31, lineheight31, avgwidth31] =
		build_char_db(31);

	// const sign_groups = { choppy: 2, dig_immediate: 2 };

	// local fences_with_sign = { }
	// // some local helper functions
	// local math_max = math.max
	function fill_line(
		x: number,
		y: number,
		w: number,
		c: string | null,
		font_size: number,
		colorbgw: number
	): string {
		c = c || "0";
		let tex: string[] = [];
		for (const xx of $range(0, math.max(0, w), colorbgw)) {
			tex.push(
				string.format(
					":%d,%d=signs_lib_color_" + font_size + "px_%s.png",
					x + xx,
					y,
					c
				)
			);
		}
		return table.concat(tex);
	}

	// Make char texture file name.
	// If texture file does not exist use fallback texture instead.
	function char_tex(font_name: string, ch: string): [string, boolean] {
		if (ctexcache[font_name + ch] != null) {
			return [ctexcache[font_name + ch]!, true];
		} else {
			const c: number = string.byte(ch);
			const exists = file_exists(string.format(CHAR_PATH, font_name, c));
			let tex: string = "";
			if (exists && c != 14) {
				tex = string.format(CHAR_FILE, font_name, c);
			} else {
				tex = string.format(CHAR_FILE, font_name, 0x0);
			}
			ctexcache[font_name + ch] = tex;
			return [tex, exists];
		}
	}

	function make_line_texture(
		line: string,
		lineno: number,
		pos: Vec3,
		line_width: number,
		line_height: number,
		cwidth_tab: Dictionary<string, number>,
		font_size: number,
		colorbgw: number
	): [string, number] {
		let width: number = 0;
		let maxw: number = 0;
		let font_name: string = "signs_lib_font_" + font_size + "px";

		interface TempData {
			off: number;
			tex: string;
			col: string;
		}

		interface WordData {
			chars: TempData[];
			w: number;
		}

		const words: WordData[] = [];
		const node: NodeTable = core.get_node(pos);
		const def: NodeDefinition | undefined =
			core.registered_items[node.name];
		const default_color: number = 0;
		let cur_color: string | number | null = 0;
		// We check which chars are available here.
		for (let [word_i, word] of ipairs(line)) {
			if (typeof word != "string") {
				core.log(LogLevel.error, "Not a string.");
				continue;
			}

			let chars: TempData[] = [];
			let ch_offs: number = 0;
			[word] = string.gsub(word, "%^[12345678abcdefgh]", {
				["^1"]: string.char(0x81),
				["^2"]: string.char(0x82),
				["^3"]: string.char(0x83),
				["^4"]: string.char(0x84),
				["^5"]: string.char(0x85),
				["^6"]: string.char(0x86),
				["^7"]: string.char(0x87),
				["^8"]: string.char(0x88),
				["^a"]: string.char(0x8a),
				["^b"]: string.char(0x8b),
				["^c"]: string.char(0x8c),
				["^d"]: string.char(0x8d),
				["^e"]: string.char(0x8e),
				["^f"]: string.char(0x8f),
				["^g"]: string.char(0x90),
				["^h"]: string.char(0x91),
			});
			let word_l = word.length;
			let i = 1;
			while (i <= word_l) {
				const c: string = string.sub(word, i, i);
				if (c == "#") {
					const cc: number | undefined = tonumber(
						string.sub(word, i + 1, i + 1),
						16
					);
					if (cc != null) {
						i = i + 1;
						cur_color = cc;
					}
				} else {
					let w: number | undefined = cwidth_tab[c];
					if (w != null) {
						width = width + w + 1;
						if (width >= line_width - (cwidth_tab[" "] || 0)) {
							width = 0;
						} else {
							maxw = math.max(width, maxw);
						}
						if (chars.length < MAX_INPUT_CHARS) {
							chars.push({
								off: ch_offs,
								tex: char_tex(font_name, c)[0],
								col: string.format("%X", cur_color),
							});
						}

						ch_offs = ch_offs + w;
					}
				}
				i = i + 1;
			}
			width = width + (cwidth_tab[" "] || 0) + 1;
			maxw = math.max(width, maxw);
			words.push({ chars: chars, w: ch_offs });
		}

		// Okay, we actually build the "line texture" here.
		const texture: string[] = [];
		const start_xpos: number =
			math.floor((line_width - maxw) / 2) + standard_xoffs;
		let xpos: number = start_xpos;
		let ypos: number =
			(line_height + standard_lspace) * lineno + standard_yoffs;

		cur_color = null;

		for (const [word_i, word] of ipairs(words)) {
			let xoffs: number = xpos - start_xpos;
			if (xoffs > 0 && xoffs + word.w > maxw) {
				texture.push(
					fill_line(xpos, ypos, maxw, "n", font_size, colorbgw)
				);

				xpos = start_xpos;
				ypos = ypos + line_height + standard_lspace;
				lineno = lineno + 1;
				if (lineno >= standard_lines) {
					break;
				}
				texture.push(
					fill_line(xpos, ypos, maxw, cur_color, font_size, colorbgw)
				);
			}

			for (const [ch_i, ch] of ipairs(word.chars)) {
				if (ch.col != cur_color) {
					cur_color = ch.col;
					texture.push(
						fill_line(
							xpos + ch.off,
							ypos,
							maxw,
							cur_color,
							font_size,
							colorbgw
						)
					);
				}
				texture.push(
					string.format(":%d,%d=%s", xpos + ch.off, ypos, ch.tex)
				);
			}

			texture.push(
				string.format(":%d,%d=", xpos + word.w, ypos) +
					char_tex(font_name, " ")
			);
			xpos = xpos + word.w + (cwidth_tab[" "] || 0);
			if (xpos >= line_width + (cwidth_tab[" "] || 0)) {
				break;
			}
		}
		texture.push(fill_line(xpos, ypos, maxw, "n", font_size, colorbgw));
		texture.push(
			fill_line(
				start_xpos,
				ypos + line_height,
				maxw,
				"n",
				font_size,
				colorbgw
			)
		);
		return [table.concat(texture), lineno];
	}

	function make_sign_texture(lines: string[], pos: Vec3): string {
		const node: NodeTable = core.get_node(pos);
		const meta: MetaRef = core.get_meta(pos);
		const def: SignNodeDefinition | undefined =
			core.registered_items[node.name];
		if (def == null || def.entity_info == null) {
			core.log(
				LogLevel.error,
				"SEVERE ERROR: Undefined node while making sign texture. This sign will be glitched."
			);
			return "";
		}

		let font_size: number = 0;
		let line_width: number = 0;
		let line_height: number = 0;
		let char_width: Dictionary<string, number> = {};
		let colorbgw: number = 0;
		let widemult: number = 1;

		// todo: test this.
		// 	if meta:get_int("widefont") == 1 then
		// 		widemult = 0.5
		// 	end

		font_size = 15;
		line_width =
			math.floor(avgwidth15 * standard_cpl) *
			(standard_hscale * widemult);

		line_height = lineheight15;
		char_width = charwidth15;
		colorbgw = colorbgw15;

		const texture: string[] = [
			string.format(
				"[combine:%dx%d",
				line_width,
				(line_height + standard_lspace) *
					standard_lines *
					standard_vscale
			),
		];
		let lineno: number = 0;
		for (const i of $range(1, lines.length)) {
			if (lineno >= standard_lines) {
				break;
			}
			const [linetex, ln] = make_line_texture(
				lines[i - 1],
				lineno,
				pos,
				line_width,
				line_height,
				char_width,
				font_size,
				colorbgw
			);
			// 		table.insert(texture, linetex)
			// 		lineno = ln + 1
		}
		// 	table.insert(texture, "^[makealpha:0,0,0")
		// 	return table.concat(texture, "")
	}

	function split_lines_and_words(text: string): string[] {
		const lines: string[] = [];
		for (const [_, line] of ipairs(
			string.split(text, "\n", true, -1, false)
		)) {
			line.split(" ").forEach((v: string) => {
				lines.push(v);
			});
		}
		return lines;
	}

	// function signs_lib.construct_sign(pos)
	// 	local form = "size[6,4]"+
	// 		"textarea[0,-0.3;6.5,3;text;;${text}]"+
	// 		"background[-0.5,-0.5;7,5;signs_lib_sign_bg.jpg]"
	// 	local node = core.get_node(pos)
	// 	local def = core.registered_items[node.name]
	// 	local meta = core.get_meta(pos)
	// 	if def.allow_widefont then
	// 		local state = "off"
	// 		if meta:get_int("widefont") == 1 then state = "on" end
	// 		form = form+"label[1,3.4;Use wide font]"+
	// 			"image_button[1.1,3.7;1,0.6;signs_lib_switch_"+
	// 			state+".png;"+
	// 			state+";;;false;signs_lib_switch_interm.png]"+
	// 			"button_exit[3,3.4;2,1;ok;"+S("Write")+"]"
	// 	else
	// 		form = form+"button_exit[2,3.4;2,1;ok;"+S("Write")+"]"
	// 	end
	// 	meta:set_string("formspec", form)
	// 	local i = meta:get_string("infotext")
	// 	if i == "" then // it wasn't even set, so set it.
	// 		meta:set_string("infotext", "")
	// 	end
	// end
	// function signs_lib.destruct_sign(pos)
	// 	signs_lib.delete_objects(pos)
	// end

	function update_sign(pos: Vec3, fields?: { text: string }): void {
		const meta: MetaRef = core.get_meta(pos);
		let text: string = fields?.text || meta.get_string("text");
		text = trim_input(text);
		meta.set_string("text", text);
		set_obj_text(pos, text);
	}

	// function signs_lib.receive_fields(pos, formname, fields, sender)
	// 	if not fields or not signs_lib.can_modify(pos, sender) then return end
	// 	if fields.text and fields.ok then
	// 		core.log("action", S("@1 wrote \"@2\" to sign at @3",
	// 			(sender:get_player_name() or ""),
	// 			fields.text:gsub('\\', '\\\\'):gsub("\n", "\\n"),
	// 			core.pos_to_string(pos)
	// 		))
	// 		signs_lib.update_sign(pos, fields)
	// 	elseif fields.on or fields.off then
	// 		local node = core.get_node(pos)
	// 		local meta = core.get_meta(pos)
	// 		local change
	// 		if fields.on and meta:get_int("widefont") == 1 then
	// 			meta:set_int("widefont", 0)
	// 			change = true
	// 		elseif fields.off and meta:get_int("widefont") == 0 then
	// 			meta:set_int("widefont", 1)
	// 			change = true
	// 		end
	// 		if change then
	// 			core.log("action", S("@1 flipped the wide-font switch to \"@2\" at @3",
	// 				(sender:get_player_name() or ""),
	// 				(fields.on and "off" or "on"),
	// 				core.pos_to_string(pos)
	// 			))
	// 			signs_lib.construct_sign(pos)
	// 			signs_lib.update_sign(pos, fields)
	// 		end
	// 	end
	// end
	// function signs_lib.can_modify(pos, player)
	// 	local meta = core.get_meta(pos)
	// 	local owner = meta:get_string("owner")
	// 	local playername = player:get_player_name()
	// 	if core.is_protected(pos, playername) then
	// 		core.record_protection_violation(pos, playername)
	// 		return false
	// 	end
	// 	if owner == ""
	// 	  or playername == owner
	// 	  or (core.check_player_privs(playername, {sign_editor=true}))
	// 	  or (playername == core.settings:get("name")) then
	// 		return true
	// 	end
	// 	core.record_protection_violation(pos, playername)
	// 	return false
	// end
	// // make selection boxes
	// // sizex/sizey specified in inches because that's what MUTCD uses.
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
					-0.5 + zo,
					-ty + yo,
					-tx + xo,
					-0.4375 + zo,
					ty + yo,
					tx + xo,
				],
				wall_top: [
					-tx - xo,
					0.5 + zo,
					-ty + yo,
					tx - xo,
					0.4375 + zo,
					ty + yo,
				],
				wall_bottom: [
					-tx - xo,
					-0.5 + zo,
					-ty + yo,
					tx - xo,
					-0.4375 + zo,
					ty + yo,
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
	function check_for_pole(pos: Vec3, pointed_thing: PointedThing): boolean {
		const ppos: Vec3 | null =
			core.get_pointed_thing_position(pointed_thing);
		if (ppos == null) {
			return false;
		}
		const pnode: NodeTable = core.get_node(ppos);
		const pdef: SignNodeDefinition | undefined =
			core.registered_items[pnode.name];
		if (pdef == null) {
			return false;
		}
		if (
			check_for_ceiling(pointed_thing) ||
			check_for_floor(pointed_thing)
		) {
			return false;
		}
		if (pdef.drawtype == Drawtype.fencelike) {
			return true;
		}
		return false;
	}

	function check_for_horizontal_pole(
		pos: Vec3,
		pointed_thing: PointedThing
	): boolean {
		const ppos: Vec3 | null =
			core.get_pointed_thing_position(pointed_thing);
		if (ppos == null) {
			return false;
		}
		const pnode: NodeTable = core.get_node(ppos);
		const pdef: NodeDefinition | undefined =
			core.registered_items[pnode.name];

		if (pdef == null) {
			return false;
		}
		if (
			check_for_ceiling(pointed_thing) ||
			check_for_floor(pointed_thing)
		) {
			return false;
		}

		return false;
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

	function after_place_node(
		pos: Vec3,
		placer: ObjectRef,
		itemstack: ItemStackObject,
		pointed_thing: PointedThing
	) {
		const playername: string = placer.get_player_name();
		const controls: PlayerControlObject = placer.get_player_control();
		const signname: string = itemstack.get_name();
		const no_wall_name: string = string.gsub(signname, "_wall", "")[0];
		const def: SignNodeDefinition | undefined =
			core.registered_items[signname];
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
		const pnode: NodeTable = core.get_node(ppos);
		const pdef: NodeDefinition | undefined =
			core.registered_items[pnode.name];

		if (!controls.sneak && check_for_pole(pos, pointed_thing)) {
			let newparam2: number;
			const lookdir: Vec3 = core.yaw_to_dir(placer.get_look_horizontal());
			if (def.paramtype2 == ParamType2.wallmounted) {
				newparam2 = core.dir_to_wallmounted(lookdir);
			} else {
				newparam2 = core.dir_to_facedir(lookdir);
			}
			const node: NodeTable = core.get_node(pos);
			core.swap_node(pos, {
				name: no_wall_name + "_onpole",
				param2: newparam2,
			});
		} else if (
			!controls.sneak &&
			check_for_horizontal_pole(pos, pointed_thing)
		) {
			let newparam2: number;
			const lookdir: Vec3 = core.yaw_to_dir(placer.get_look_horizontal());
			if (def.paramtype2 == ParamType2.wallmounted) {
				newparam2 = core.dir_to_wallmounted(lookdir);
			} else {
				newparam2 = core.dir_to_facedir(lookdir);
			}
			const node: NodeTable = core.get_node(pos);
			core.swap_node(pos, {
				name: no_wall_name + "_onpole_horiz",
				param2: newparam2,
			});
		} else if (!controls.sneak && check_for_ceiling(pointed_thing)) {
			const newparam2: number = core.dir_to_facedir(
				placer.get_look_dir()
			);
			const node: NodeTable = core.get_node(pos);
			core.swap_node(pos, {
				name: no_wall_name + "_hanging",
				param2: newparam2,
			});
		} else if (!controls.sneak && check_for_floor(pointed_thing)) {
			const newparam2: number = core.dir_to_facedir(
				placer.get_look_dir()
			);
			const node: NodeTable = core.get_node(pos);
			core.swap_node(pos, {
				name: no_wall_name + "_yard",
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

		// if (locked) {
		// 	local meta = core.get_meta(pos)
		// 	meta:set_string("owner", playername)
		// 	meta:set_string("infotext", S("Locked sign, owned by @1\n", playername))
		// }
	}

	/** @noSelf **/ interface SignNodeDefinition extends NodeDefinition {
		entity_info?: {
			mesh: string;
			yaw: number[];
		};
		on_rotate?: (pos: Vec3, node: NodeTable, user: ObjectRef) => boolean;
	}

	// This seems to be using the decorator pattern.
	export function register_sign(name: string, def: SignNodeDefinition) {
		def.entity_info = {
			mesh: "signs_lib_standard_sign_entity_wall.obj",
			yaw: wallmounted_yaw,
		};
		def.node_placement_prediction = "";
		def.after_place_node = after_place_node;
		def.paramtype = ParamType1.light;
		def.drawtype = Drawtype.mesh;
		def.mesh = "signs_lib_standard_sign_wall.obj";
		def.drop = name;
		def.sounds = standard_wood_sign_sounds;
		def.paramtype2 = ParamType2.wallmounted;
		def.on_rotate = handle_rotation;
		def.walkable = false;
		def.groups = standard_wood_groups;
		const cbox = make_selection_boxes(35, 25);
		def.selection_box = cbox;
		def.node_box = cbox;
		def.sunlight_propagates = true;

		if (def.tiles == null) {
			throw new Error("incorrect tiles.");
		}

		def.tiles[3] = "signs_lib_blank.png";
		def.tiles[4] = "signs_lib_blank.png";
		def.tiles[5] = "signs_lib_blank.png";
		def.tiles[6] = "signs_lib_blank.png";

		core.register_node(":" + name, def);
		lbm_restore_nodes.add(name);

		const [no_wall_name] = string.gsub(name, "_wall", "");

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

		[othermounts_def.mesh] = string.gsub(
			othermounts_def.mesh || "",
			"wall.obj$",
			"onpole.obj"
		);

		// Setting one of item 3 or 4 to a texture and leaving the other "blank",
		// reveals either the vertical or horizontal pole mount part of the model.

		if (othermounts_def.tiles == null) {
			throw new Error("Logic error 3");
		}

		othermounts_def.tiles[3] = "signs_lib_pole_mount.png";
		othermounts_def.tiles[4] = "signs_lib_blank.png";
		othermounts_def.tiles[5] = "signs_lib_blank.png";
		othermounts_def.tiles[6] = "signs_lib_blank.png";
		core.register_node(":" + no_wall_name + "_onpole", othermounts_def);
		lbm_restore_nodes.add(no_wall_name + "_onpole");

		const onpole_horiz_def: SignNodeDefinition = table.copy(
			othermounts_def as any as LuaTable
		) as any as SignNodeDefinition;
		if (onpole_horiz_def.tiles == null) {
			throw new Error("Logic error 4");
		}
		onpole_horiz_def.tiles[3] = "signs_lib_blank.png";
		onpole_horiz_def.tiles[4] = "signs_lib_pole_mount.png";
		onpole_horiz_def.tiles[5] = "signs_lib_blank.png";
		onpole_horiz_def.tiles[6] = "signs_lib_blank.png";
		core.register_node(
			":" + no_wall_name + "_onpole_horiz",
			onpole_horiz_def
		);
		lbm_restore_nodes.add(no_wall_name + "_onpole_horiz");

		const hanging_def: SignNodeDefinition = table.copy(
			def as any as LuaTable
		) as any as SignNodeDefinition;

		hanging_def.use_texture_alpha = TextureAlpha.clip;
		hanging_def.paramtype2 = ParamType2.facedir;
		const hcbox = make_selection_boxes(35, 32, null, 0, 3, -18.5, true);
		hanging_def.selection_box = hcbox;
		hanging_def.node_box = hcbox;

		if (hanging_def.tiles == null) {
			throw new Error("Logic error 5");
		}

		hanging_def.tiles[3] = "signs_lib_hangers.png";
		hanging_def.tiles[4] = "signs_lib_blank.png";
		hanging_def.tiles[5] = "signs_lib_blank.png";
		hanging_def.tiles[6] = "signs_lib_blank.png";

		hanging_def.mesh = string.gsub(
			string.gsub(hanging_def.mesh || "", "wall.obj$", "hanging.obj")[0],
			"_facedir",
			""
		)[0];

		core.register_node(":" + no_wall_name + "_hanging", hanging_def);
		lbm_restore_nodes.add(no_wall_name + "_hanging");

		const ydef: SignNodeDefinition = table.copy(
			def as any as LuaTable
		) as any as SignNodeDefinition;
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
		ydef.tiles[3] = "wood.png";
		ydef.tiles[4] = "signs_lib_blank.png";
		ydef.tiles[5] = "signs_lib_blank.png";
		ydef.tiles[6] = "signs_lib_blank.png";
		ydef.node_box = ycbox;

		ydef.mesh = string.gsub(
			string.gsub(ydef.mesh || "", "wall.obj$", "yard.obj")[0],
			"_facedir",
			""
		)[0];

		core.register_node(":" + no_wall_name + "_yard", ydef);
		lbm_restore_nodes.add(no_wall_name + "_yard");

		// table.insert(old_widefont_signs, name+"_widefont")
		// table.insert(signs_lib.old_widefont_signs, name+"_widefont_onpole")
		// table.insert(signs_lib.old_widefont_signs, name+"_widefont_hanging")
		// table.insert(signs_lib.old_widefont_signs, name+"_widefont_yard")
	}

	// Restore signs' text after /clearobjects and the like, the next time
	// a block is reloaded by the server.
	core.register_on_mods_loaded(() => {
		core.register_lbm({
			nodenames: Array.from(lbm_restore_nodes),
			name: ":crafter_sign:restore_sign_text",
			label: "Restore sign text",
			run_at_every_load: true,
			action: (pos: Vec3, node: NodeTable) => {
				update_sign(pos);
			},
		});
	});

	// Convert widefont sign nodes to use one base node with meta flag to select wide mode.
	// core.register_lbm({
	// 	nodenames = signs_lib.old_widefont_signs,
	// 	name = "crafter_sign:convert_widefont_signs",
	// 	label = "Convert widefont sign nodes",
	// 	run_at_every_load = false,
	// 	action = function(pos, node)
	// 		local basename = string.gsub(node.name, "_widefont", "")
	// 		core.swap_node(pos, {name = basename, param2 = node.param2})
	// 		local meta = core.get_meta(pos)
	// 		meta:set_int("widefont", 1)
	// 		signs_lib.update_sign(pos)
	// 	end
	// })

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
