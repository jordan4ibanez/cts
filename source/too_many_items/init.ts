namespace tooManyItems {
	// local minetest,pairs = minetest,pairs

    // todo: this needs to be able to scroll through all the recipes of an item!

	//? Note: This is being treated as a fortran module in this namespace.
	class MasterInventory {
		private constructor() {}
		private static pages: string[] = [];
		private static locked: boolean = false;

		static getMaxPageIndex(): number {
			return this.pages.length - 1;
		}

		static getPage(index: number): string {
			if (index < 0 || index >= this.pages.length) {
				throw new Error("Out of range.");
			}
			return this.pages[index];
		}

		static pushPage(pageData: string): void {
			if (this.locked) {
				throw new Error("Modified when locked.");
			}
			this.pages.push(pageData);
		}

		static lock(): void {
			// One way lock
			this.locked = true;
		}
	}

	interface TMIObject {
		cheating: boolean;
		page: number;
	}

	const pool = new Map<string, TMIObject>();

	const max = 7 * 7;

	// 2x2 formspec.
	const base_inv: string =
		"size[17.2,8.75]" +
		"background[-0.19,-0.25;9.41,9.49;main_inventory.png]" +
		"listcolors[#8b8a89;#c9c3c6;#3e3d3e;#000000;#FFFFFF]" +
		"list[current_player;main;0,4.5;9,1;]" + //hot bar
		"list[current_player;main;0,6;9,3;9]" + //big part
		"list[current_player;craft;2.5,1;2,2;]" +
		//armor slots
		"list[current_player;armor_head;0.25,0;1,1;]" +
		"list[current_player;armor_torso;0.25,1;1,1;]" +
		"list[current_player;armor_legs;0.25,2;1,1;]" +
		"list[current_player;armor_feet;0.25,3;1,1;]" +
		//craft preview with ring
		"list[current_player;craftpreview;6.1,1.5;1,1;]" +
		"listring[current_player;main]" +
		"listring[current_player;craft]";
	//this is the 3x3 crafting table formspec
	const crafting_table_inv: string =
		"size[17.2,8.75]" +
		"background[-0.19,-0.25;9.41,9.49;crafting_inventory_workbench.png]" +
		"listcolors[#8b8a89;#c9c3c6;#3e3d3e;#000000;#FFFFFF]" +
		"list[current_player;main;0,4.5;9,1;]" + //hot bar
		"list[current_player;main;0,6;9,3;9]" + //big part
		"list[current_player;craft;1.75,0.5;3,3;]" +
		//armor slots
		"list[current_player;armor_head;0.25,0;1,1;]" +
		"list[current_player;armor_torso;0.25,1;1,1;]" +
		"list[current_player;armor_legs;0.25,2;1,1;]" +
		"list[current_player;armor_feet;0.25,3;1,1;]" +
		//craft preview with ring
		"list[current_player;craftpreview;6.1,1.5;1,1;]" +
		"listring[current_player;main]" +
		"listring[current_player;craft]";

	// This is from Linuxdirk, thank you AspireMint for showing me this.
	function recipe_converter(
		items: string[],
		width: number
	): string[] | string[][] {
		let usable_recipe: string[] | string[][] = [[], [], []];

		// The recipe is a shapeless recipe so all items are in one table
		if (width == 0) {
			usable_recipe = items;
			usable_recipe = usable_recipe as string[];
		}
		// x _ _
		// x _ _
		// x _ _
		else if (width == 1) {
			usable_recipe = usable_recipe as string[][];

			usable_recipe[0][0] = items[0] || "";
			usable_recipe[1][0] = items[1] || "";
			usable_recipe[2][0] = items[2] || "";
		}
		// x x _
		// x x _
		// x x _
		else if (width == 2) {
			usable_recipe = usable_recipe as string[][];

			usable_recipe[0][0] = items[0] || "";
			usable_recipe[0][1] = items[1] || "";
			usable_recipe[1][0] = items[2] || "";
			usable_recipe[1][1] = items[3] || "";
			usable_recipe[2][0] = items[4] || "";
			usable_recipe[2][1] = items[5] || "";
		}
		// x x x
		// x x x
		// x x x
		else if (width == 3) {
			usable_recipe = usable_recipe as string[][];

			usable_recipe[0][0] = items[0] || "";
			usable_recipe[0][1] = items[1] || "";
			usable_recipe[0][2] = items[2] || "";
			usable_recipe[1][0] = items[3] || "";
			usable_recipe[1][1] = items[4] || "";
			usable_recipe[1][2] = items[5] || "";
			usable_recipe[2][0] = items[6] || "";
			usable_recipe[2][1] = items[7] || "";
			usable_recipe[2][2] = items[8] || "";
		} else {
			throw new Error("How did this happen?");
		}
		return usable_recipe;
	}

	const map_group_to_item: Dictionary<string, string> = {
		coal: "main:coal",
		glass: "main:glass",
		sand: "main:sand",
		stick: "main:stick",
		stone: "main:cobble",
		tree: "main:tree",
		wood: "main:wood",
	};

	function get_if_group(item: string): string {
		if (item != null && string.sub(item, 1, 6)[0] == "group:") {
			const group_name = string.sub(item, 7, item.length);
			const mapped_item: string | undefined =
				map_group_to_item[group_name];
			if (mapped_item != null) {
				return mapped_item;
			}
		}
		return item;
	}

	const base_x: number = 0.75;
	const base_y: number = -0.5;

	const output_constant: string =
		"listcolors[#8b8a89;#c9c3c6;#3e3d3e;#000000;#FFFFFF]" +
		"list[current_player;main;0,4.5;9,1;]" + //hot bar
		"list[current_player;main;0,6;9,3;9]" + //main inventory
		"button[5,3.5;1,1;toomanyitems.back;back]"; //back button

	function create_craft_formspec(item: string): string {
		// Don't do air.
		if (item == "") {
			return "";
		}

		const recipe: CraftRecipeObject = core.get_craft_recipe(item);

		if (recipe.width == 0) {
			return "";
		}

		if (recipe.items == null) {
			throw new Error("Null recipe!");
		}

		const usable_table: string[] | string[][] = recipe_converter(
			recipe.items,
			recipe.width
		);

		let output: string = output_constant;

		if (recipe.method == CraftCheckType.normal) {
			if (usable_table == null) {
				throw new Error(`Recipe is null for [${item}]`);
			}
			//shaped (regular)
			if (recipe.width > 0) {
				for (const x of $range(1, 3)) {
					for (const y of $range(1, 3)) {
						item = get_if_group(usable_table[x - 1][y - 1]);

						if (item != null) {
							output +=
								"item_image_button[" +
								tostring(base_x + y) +
								"," +
								tostring(base_y + x) +
								";1,1;" +
								item +
								";" +
								item +
								";]";
						} else {
							output +=
								"item_image_button[" +
								tostring(base_x + y) +
								"," +
								tostring(base_y + x) +
								";1,1;;;]";
						}
					}
				}
				//shapeless
			} else {
				let i = 1;
				for (const x of $range(1, 3)) {
					for (const y of $range(1, 3)) {
						item = get_if_group((usable_table as string[])[i]);
						if (item != null) {
							output +=
								"item_image_button[" +
								tostring(base_x + y) +
								"," +
								tostring(base_y + x) +
								";1,1;" +
								item +
								";" +
								item +
								";]";
						} else {
							output +=
								"item_image_button[" +
								tostring(base_x + y) +
								"," +
								tostring(base_y + x) +
								";1,1;;;]";
						}
						i += 1;
					}
				}
			}
		} else if (recipe.method == CraftCheckType.cooking) {
			item = recipe.items[0];
			output +=
				"item_image_button[" +
				(base_x + 2) +
				"," +
				(base_y + 1) +
				";1,1;" +
				item +
				";" +
				item +
				";]";
			output = output + "image[2.75,1.5;1,1;default_furnace_fire_fg.png]";
		}

		return output;
	}

	function cheat_button(name: string): string {
		const data: TMIObject | undefined = pool.get(name);

		if (data && data.cheating) {
			return "button[11.5,7.6;2,2;toomanyitems.cheat;cheat:on]";
		} else {
			return "button[11.5,7.6;2,2;toomanyitems.cheat;cheat:off]";
		}
	}

	// local form
	// local id
	// local inv
	// local item
	// local stack
	// local craft_inv
	// local name
	// local temp_pool

	core.register_on_player_receive_fields(
		(
			player: ObjectRef,
			formname: string,
			fields: Dictionary<string, any>
		) => {
			const name: string = player.get_player_name();

			const data = pool.get(name);

			if (!data) {
				core.log(
					LogLevel.warning,
					`Player [${name}] is not in the tmi pool.`
				);
				return;
			}

			// Todo: does this need to call the same thing twice every time??

			let form: string = "";
			let id: string = "";

			if (formname == "") {
				form = base_inv;
				id = "";
			} else if (formname == "crafting") {
				form = crafting_table_inv;
				id = "crafting";
			}

			// "next" button.
			if (fields["toomanyitems.next"]) {
				data.page += 1;
				// Page loops back to first.
				if (data.page > MasterInventory.getMaxPageIndex()) {
					data.page = 0;
				}

				core.show_formspec(
					name,
					id,
					form +
						MasterInventory.getPage(data.page) +
						cheat_button(name)
				);
				core.sound_play("lever", { to_player: name, gain: 0.7 });
				player.set_inventory_formspec(
					base_inv +
						MasterInventory.getPage(data.page) +
						cheat_button(name)
				);
				// "prev" button.
			} else if (fields["toomanyitems.prev"]) {
				data.page -= 1;
				// Page loops back to end.
				if (data.page < 0) {
					data.page = MasterInventory.getMaxPageIndex();
				}
				core.show_formspec(
					name,
					id,
					form +
						MasterInventory.getPage(data.page) +
						cheat_button(name)
				);
				core.sound_play("lever", { to_player: name, gain: 0.7 });
				player.set_inventory_formspec(
					base_inv +
						MasterInventory.getPage(data.page) +
						cheat_button(name)
				);
				// "back" button.
			} else if (fields["toomanyitems.back"]) {
				core.show_formspec(
					name,
					id,
					form +
						MasterInventory.getPage(data.page) +
						cheat_button(name)
				);
				core.sound_play("lever", { to_player: name, gain: 0.7 });
				// This resets the craft table.
			} else if (fields.quit) {
				const inv: InvRef = player.get_inventory();
				// todo: dump_craft comes from player_mechanics
				// dump_craft(player)
				inv.set_width("craft", 2);
				inv.set_size("craft", 4);
				//reset the player inv //todo: figure out what this was for
				//core.show_formspec(name,id, form+tmi_master_inventory["page_"+temp_pool.page]+cheat_button(name))
			} else if (fields["toomanyitems.cheat"]) {
				// Check if the player has the give priv.
				if (
					(!data.cheating &&
						core.get_player_privs(name).give == true) ||
					data.cheating == true
				) {
					data.cheating = !data.cheating;
					core.show_formspec(
						name,
						id,
						form +
							MasterInventory.getPage(data.page) +
							cheat_button(name)
					);
					core.sound_play("lever", { to_player: name, gain: 0.7 });
					player.set_inventory_formspec(
						base_inv +
							MasterInventory.getPage(data.page) +
							cheat_button(name)
					);
				} else {
					core.chat_send_player(
						name,
						"Sorry, server says I can't let you do that. :("
					);
					core.sound_play("lever", {
						to_player: name,
						gain: 0.7,
						pitch: 0.7,
					});
				}
				// This is the "cheating" aka giveme function and craft recipe.
			} else if (
				fields &&
				type(fields) == "table" &&
				string.match(next(fields)[0], "toomanyitems.")
			) {
				const item: string = string.gsub(
					next(fields)[0],
					"toomanyitems.",
					""
				)[0];
				const stack: ItemStackObject = ItemStack(item + " 64");
				const inv: InvRef = player.get_inventory();
				if (data.cheating && core.get_player_privs(name).give) {
					// Room for item.
					if (inv.room_for_item("main", stack)) {
						inv.add_item("main", stack);
						core.sound_play("pickup", {
							to_player: name,
							gain: 0.7,
							pitch: math.random(60, 100) / 100,
						});
						//no room for item
					} else {
						core.chat_send_player(
							name,
							"Might want to clear your inventory!"
						);
						core.sound_play("lever", {
							to_player: name,
							gain: 0.7,
							pitch: 0.7,
						});
					}
					// This is to get the craft recipe.
				} else {
					const craft_inv: string = create_craft_formspec(item);
					if (craft_inv != "") {
						core.show_formspec(
							name,
							id,
							MasterInventory.getPage(data.page) +
								craft_inv +
								cheat_button(name)
						);
						core.sound_play("lever", {
							to_player: name,
							gain: 0.7,
						});
					}
				}
			}
		}
	);

	// Run through the items and then set the pages.

	core.register_on_mods_loaded(() => {
		// Sort all items (There is definitely a better way to do this).
		// Get all craftable items.

		const all_items_table: string[] = [];

		for (const [name, data] of pairs(core.registered_items)) {
			if (name == "") {
				continue;
			}
			const recipe: CraftRecipeObject = core.get_craft_recipe(name);
			// Only put in craftable items.
			if (recipe.width > 0 && recipe.items) {
				all_items_table.push(name);
			}
		}

		all_items_table.sort();

		// Dump all the items in.

		let item_counter: number = 0;
		let page: number = 1;
		let x: number = 0;
		let y: number = 0;

		const pagePreface: string =
			"size[17.2,8.75]background[-0.19,-0.25;9.41,9.49;crafting_inventory_workbench.png]";

		let pageData: string = pagePreface;
		const maxPages: number = math.floor(all_items_table.length / 49);

		const lastItem: string = all_items_table[all_items_table.length - 1];

		for (const item of all_items_table) {
			pageData +=
				"item_image_button[" +
				tostring(9.25 + x) +
				"," +
				tostring(y) +
				";1,1;" +
				item +
				";toomanyitems." +
				item +
				";]";
			x = x + 1;
			if (x > 7) {
				x = 0;
				y = y + 1;
			}
			if (y > 7 || item == lastItem) {
				y = 0;

				// Add buttons and labels to complete this page.
				// Also, set the last page index: [x/max pages]
				pageData +=
					"button[9.25,7.6;2,2;toomanyitems.prev;prev]" +
					"button[15.25,7.6;2,2;toomanyitems.next;next]" +
					// this is +1 so it makes more sense
					"label[13.75,8.25;page " +
					page +
					"/" +
					maxPages +
					"]";

				MasterInventory.pushPage(pageData);

				page++;
				pageData = pagePreface;
			}
		}

		// Override crafting table.
		core.override_item("crafter_workbench:workbench", {
			on_rightclick: (
				pos: Vec3,
				node: NodeTable,
				player: ObjectRef,
				itemstack: ItemStackObject
			) => {
				const name: string = player.get_player_name();

				const data: TMIObject | undefined = pool.get(name);

				if (!data) {
					core.log(
						LogLevel.warning,
						`Player [${name}] is not in the tmi pool.`
					);
					return;
				}

				player.get_inventory().set_width("craft", 3);
				player.get_inventory().set_size("craft", 9);
				core.show_formspec(
					name,
					"crafting",
					crafting_table_inv +
						MasterInventory.getPage(data.page) +
						cheat_button(name)
				);
			},
		});
	});

	// Set new players inventory up.
	// local name
	// local temp_pool
	// local inv

	core.register_on_joinplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		const newData: TMIObject = {
			cheating: false,
			page: 0,
		};

		const inv: InvRef = player.get_inventory();
		inv.set_width("craft", 2);
		inv.set_width("main", 9);
		inv.set_size("main", 9 * 4);
		inv.set_size("craft", 4);
		player.set_inventory_formspec(
			base_inv +
				MasterInventory.getPage(newData.page) +
				cheat_button(name)
		);
		player.hud_set_hotbar_itemcount(9);
		player.hud_set_hotbar_image("inventory_hotbar.png");
		player.hud_set_hotbar_selected_image("hotbar_selected.png");

		pool.set(name, newData);
	});

	core.register_on_leaveplayer((player: ObjectRef) => {
		const name = player.get_player_name();
		pool.delete(name);
	});
}
