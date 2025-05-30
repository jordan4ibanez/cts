namespace furnace_chest {
	// const furnace = {}

	function get_furnace_active_formspec(
		fuel_percent: number,
		item_percent: number
	): string {
		return (
			"size[9,8.75]" +
			"background[-0.19,-0.25;9.41,9.49;gui_hb_bg.png]" +
			"listcolors[#8b8a89;#c9c3c6;#3e3d3e;#000000;#FFFFFF]" +
			"list[context;src;2.75,0.5;1,1;]" +
			"list[context;fuel;2.75,2.5;1,1;]" +
			"image[2.75,1.5;1,1;default_furnace_fire_bg.png^[lowpart:" +
			fuel_percent +
			":default_furnace_fire_fg.png]" +
			"image[3.75,1.5;1,1;gui_furnace_arrow_bg.png^[lowpart:" +
			item_percent +
			":gui_furnace_arrow_fg.png^[transformR270]" +
			"list[context;dst;4.75,0.96;2,2;]" +
			"list[current_player;main;0,4.5;9,1;]" + //hotbar
			"list[current_player;main;0,6;9,3;9]" + //inventory
			"listring[context;dst]" +
			"listring[current_player;main]" +
			"listring[context;src]" +
			"listring[current_player;main]" +
			"listring[context;fuel]" +
			"listring[current_player;main]"
		);
		// furnace.get_hotbar_bg(0, 4.25)
	}

	function get_furnace_inactive_formspec(): string {
		return (
			"size[9,8.75]" +
			"background[-0.19,-0.25;9.41,9.49;gui_hb_bg.png]" +
			"listcolors[#8b8a89;#c9c3c6;#3e3d3e;#000000;#FFFFFF]" +
			"list[context;src;2.75,0.5;1,1;]" +
			"list[context;fuel;2.75,2.5;1,1;]" +
			"image[2.75,1.5;1,1;default_furnace_fire_bg.png]" +
			"image[3.75,1.5;1,1;gui_furnace_arrow_bg.png^[transformR270]" +
			"list[context;dst;4.75,0.96;2,2;]" +
			"list[current_player;main;0,4.5;9,1;]" +
			"list[current_player;main;0,6;9,3;9]" +
			"listring[context;dst]" +
			"listring[current_player;main]" +
			"listring[context;src]" +
			"listring[current_player;main]" +
			"listring[context;fuel]" +
			"listring[current_player;main]"
		);
		//furnace.get_hotbar_bg(0, 4.25)
	}

	//
	// Node callback functions that are the same for active and inactive furnace.
	//

	// //[[
	// local function can_dig(pos, player)
	// 	local meta = core.get_meta(pos);
	// 	local inv = meta:get_inventory()
	// 	return inv:is_empty("fuel") and inv:is_empty("dst") and inv:is_empty("src")
	// end
	// ]]//

	function allow_metadata_inventory_put(
		pos: Vec3,
		listname: string,
		index: number,
		stack: ItemStackObject,
		player: ObjectRef
	): number {
		if (core.is_protected(pos, player.get_player_name())) {
			return 0;
		}
		const meta: MetaRef = core.get_meta(pos);
		const inv: InvRef = meta.get_inventory();
		if (listname == "fuel") {
			if (
				core.get_craft_result({
					method: CraftCheckType.fuel,
					width: 1,
					items: [stack],
				})[0].time != 0
			) {
				//if inv:is_empty("src") then
				//	meta:set_string("infotext", "Furnace is empty")
				//end
				return stack.get_count();
			} else {
				return 0;
			}
		} else if (listname == "src") {
			return stack.get_count();
		} else if (listname == "dst") {
			return 0;
		}
		return 0;
	}

	function allow_metadata_inventory_move(
		pos: Vec3,
		from_list: string,
		from_index: number,
		to_list: string,
		to_index: number,
		count: number,
		player: ObjectRef
	): number {
		const meta: MetaRef = core.get_meta(pos);
		const inv: InvRef = meta.get_inventory();
		const stack: ItemStackObject = inv.get_stack(from_list, from_index);
		return allow_metadata_inventory_put(
			pos,
			to_list,
			to_index,
			stack,
			player
		);
	}

	function allow_metadata_inventory_take(
		pos: Vec3,
		listname: string,
		index: number,
		stack: ItemStackObject,
		player: ObjectRef
	): number {
		if (core.is_protected(pos, player.get_player_name())) {
			return 0;
		}
		return stack.get_count();
	}

	function swap_node(pos: Vec3, name: string): void {
		const node: NodeTable = core.get_node(pos);
		if (node.name == name) {
			return;
		}
		node.name = name;
		core.swap_node(pos, node);
	}

	function furnace_node_timer(pos: Vec3, elapsed: number): boolean {
		//
		// Initialize metadata
		//
		const meta: MetaRef = core.get_meta(pos);
		let fuel_time: number = meta.get_float("fuel_time") || 0;
		let src_time: number = meta.get_float("src_time") || 0;
		let fuel_totaltime: number = meta.get_float("fuel_totaltime") || 0;

		const inv: InvRef = meta.get_inventory();

		let cookable: boolean = false;
		let cooked: CraftResultObject | null = null;
		let aftercooked: CraftRecipeCheckDefinition | null = null;

		let fuel: CraftResultObject | null = null;
		let srclist: ItemStackObject[] = [];
		let fuellist: ItemStackObject[] = [];

		let dst_full: boolean = false;
		let update: boolean = true;

		while (elapsed > 0 && update) {
			update = false;

			srclist = inv.get_list("src");
			fuellist = inv.get_list("fuel");

			//
			// Cooking.
			//

			// Check if we have cookable content.

			[cooked, aftercooked] = core.get_craft_result({
				method: CraftCheckType.cooking,
				width: 1,
				items: srclist,
			});

			cookable = cooked.time != 0;
			let el: number = math.min(elapsed, fuel_totaltime - fuel_time);
			// Fuel lasts long enough, adjust el to cooking duration.
			if (cookable) {
				el = math.min(el, cooked.time - src_time);
			}

			// Check if we have enough fuel to burn
			if (fuel_time < fuel_totaltime) {
				// The furnace is currently active and has enough fuel.
				fuel_time += el;
				// If there is a cookable item then check if it is ready yet
				if (cookable) {
					src_time = src_time + el;
					if (src_time >= cooked.time) {
						// Place result in dst list if possible.
						if (inv.room_for_item("dst", cooked.item)) {
							inv.add_item("dst", cooked.item);
							inv.set_stack("src", 1, aftercooked.items[0]);
							src_time -= cooked.time;
							update = true;
							const dir: Vec3 = vector.divide(
								core.facedir_to_dir(
									core.get_node(pos).param2 || 0
								),
								-1.95
							);
							const newpos: Vec3 = vector.add(pos, dir);
							item_handling.throw_experience(newpos, 1);
						} else {
							dst_full = true;
						}
					} else {
						// Item could not be cooked: probably missing fuel.
						update = true;
					}
				}
			} else {
				// Furnace ran out of fuel.
				if (cookable) {
					// We need to get new fuel.
					let afterfuel: CraftRecipeCheckDefinition;
					[fuel, afterfuel] = core.get_craft_result({
						method: CraftCheckType.fuel,
						width: 1,
						items: fuellist,
					});
					if (fuel.time == 0) {
						// No valid fuel in fuel list
						fuel_totaltime = 0;
						src_time = 0;
					} else {
						// Take fuel from fuel list
						inv.set_stack("fuel", 1, afterfuel.items[0]);
						// Put replacements in dst list or drop them on the furnace.
						const replacements: ItemStackObject[] =
							fuel.replacements;
						if (replacements[0]) {
							const leftover: ItemStackObject = inv.add_item(
								"dst",
								replacements[0]
							);
							if (!leftover.is_empty()) {
								const above: Vec3 = vector.create3d(
									pos.x,
									pos.y + 1,
									pos.z
								);
								const drop_pos: Vec3 =
									core.find_node_near(above, 1, ["air"]) ||
									above;
								core.item_drop(replacements[0], null, drop_pos);
							}
						}
						update = true;
						fuel_totaltime =
							fuel.time + (fuel_totaltime - fuel_time);
					}
				} else {
					// We don't need to get new fuel since there is no cookable item
					fuel_totaltime = 0;
					src_time = 0;
				}
				fuel_time = 0;
			}
			elapsed -= el;
		}

		if (fuel && fuel_totaltime > fuel.time) {
			fuel_totaltime = fuel.time;
		}
		if (srclist && srclist.length > 0 && srclist[0].is_empty()) {
			src_time = 0;
		}

		//
		// Update formspec, infotext and node.
		//

		let formspec: string = "";

		let item_state: string = "";
		let item_percent: number = 0;
		if (cookable && cooked != null) {
			item_percent = math.floor((src_time / cooked.time) * 100);
			if (dst_full) {
				item_state = "100% (output full)";
			} else {
				item_state = tostring(item_percent);
			}
		} else {
			if (
				srclist != null &&
				srclist.length > 0 &&
				!srclist[0].is_empty()
			) {
				item_state = "Not cookable";
			} else {
				item_state = "Empty";
			}
		}

		// let fuel_state: string = "Empty";
		// let active: boolean = false;
		let result: boolean = false;

		if (fuel_totaltime != 0) {
			// active = true;
			const fuel_percent =
				100 - math.floor((fuel_time / fuel_totaltime) * 100);
			// fuel_state = tostring(fuel_percent);
			formspec = get_furnace_active_formspec(fuel_percent, item_percent);
			swap_node(pos, "crafter_furnace_chest:furnace_active");
			// Make sure timer restarts automatically.
			result = true;
		} else {
			// if (fuellist != null && !fuellist[0].is_empty()) {
			// 	fuel_state = tostring(0);
			// }
			formspec = get_furnace_inactive_formspec();
			swap_node(pos, "crafter_furnace_chest:furnace");
			// stop timer on the inactive furnace
			core.get_node_timer(pos).stop();
		}

		// //[[
		// local infotext
		// if active then
		// 	infotext = ("Furnace active")
		// else
		// 	infotext = ("Furnace inactive")
		// end
		// infotext = infotext .. "\n" .. "Item:"..item_state.. "Fuel:"..fuel_state
		// ]]//

		//
		// Set meta values
		//
		meta.set_float("fuel_totaltime", fuel_totaltime);
		meta.set_float("fuel_time", fuel_time);
		meta.set_float("src_time", src_time);
		meta.set_string("formspec", formspec);
		//meta:set_string("infotext", infotext)

		return result;
	}

	// Throw all items in furnace out on destroy.
	function destroy_furnace(pos: Vec3): void {
		const meta: MetaRef = core.get_meta(pos);
		const inv: InvRef = meta.get_inventory();
		const lists: Dictionary<string, ItemStackObject[]> = inv.get_lists();

		for (const [listname, _] of pairs(lists)) {
			const size = inv.get_size(listname);
			for (let i = 1; i <= size; i++) {
				const stack = inv.get_stack(listname, i);
				core.add_item(pos, stack);
			}
		}
	}

	//
	// Node definitions.
	//

	core.register_node("crafter_furnace_chest:furnace", {
		description: "Furnace",
		tiles: [
			"furnace_top.png",
			"furnace_bottom.png",
			"furnace_side.png",
			"furnace_side.png",
			"furnace_side.png",
			"furnace_front.png",
		],
		paramtype2: ParamType2.facedir,
		groups: { stone: 2 },
		legacy_facedir_simple: true,
		is_ground_content: false,
		sounds: crafter.stoneSound(),
		on_timer: furnace_node_timer,
		on_construct: (pos: Vec3) => {
			const meta: MetaRef = core.get_meta(pos);
			const inv: InvRef = meta.get_inventory();
			inv.set_size("src", 1);
			inv.set_size("fuel", 1);
			inv.set_size("dst", 4);
			furnace_node_timer(pos, 0);
		},
		on_metadata_inventory_move: (pos: Vec3) => {
			const timer: NodeTimerObject = core.get_node_timer(pos);
			if (timer.is_started() == false) {
				timer.start(1.0);
			}
		},
		on_metadata_inventory_put: (pos: Vec3) => {
			// Start timer function, it will sort out whether furnace can burn or not.
			const timer: NodeTimerObject = core.get_node_timer(pos);
			if (timer.is_started() == false) {
				timer.start(1.0);
			}
		},
		// 	//[[
		// 	on_blast = function(pos)
		// 		local drops = {}
		// 		furnace.get_inventory_drops(pos, "src", drops)
		// 		furnace.get_inventory_drops(pos, "fuel", drops)
		// 		furnace.get_inventory_drops(pos, "dst", drops)
		// 		drops[#drops+1] = "crafter_furnace_chest:furnace"
		// 		core.remove_node(pos)
		// 		return drops
		// 	end,
		// 	]]//
		on_destruct: destroy_furnace,

		allow_metadata_inventory_put: allow_metadata_inventory_put,
		allow_metadata_inventory_move: allow_metadata_inventory_move,
		allow_metadata_inventory_take: allow_metadata_inventory_take,
	});

	core.register_node("crafter_furnace_chest:furnace_active", {
		// 	description = ("Furnace"),
		// 	tiles = {
		// 		"furnace_top.png", "furnace_bottom.png",
		// 		"furnace_side.png", "furnace_side.png",
		// 		"furnace_side.png",
		// 		{
		// 			image = "furnace_front_active.png",
		// 			backface_culling = false,
		// 			animation = {
		// 				type = "vertical_frames",
		// 				aspect_w = 16,
		// 				aspect_h = 16,
		// 				length = 1.5
		// 			},
		// 		}
		// 	},
		// 	paramtype2 = "facedir",
		// 	light_source = 8,
		// 	drop = "crafter_furnace_chest:furnace",
		// 	groups = {stone=2},
		// 	legacy_facedir_simple = true,
		// 	is_ground_content = false,
		// 	sounds = main.stoneSound(),
		// 	on_timer = furnace_node_timer,
		// 	//can_dig = can_dig,
		// 	allow_metadata_inventory_put = allow_metadata_inventory_put,
		// 	allow_metadata_inventory_move = allow_metadata_inventory_move,
		// 	allow_metadata_inventory_take = allow_metadata_inventory_take,
		// 	on_destruct = function(pos)
		// 		destroy_furnace(pos)
		// 	end,
	});

	// core.register_craft({
	// 	output = "crafter_furnace_chest:furnace",
	// 	recipe = {
	// 		{"main:cobble", "main:cobble", "main:cobble"},
	// 		{"main:cobble", "",            "main:cobble"},
	// 		{"main:cobble", "main:cobble", "main:cobble"},
	// 	}
	// })
}
