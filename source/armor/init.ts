namespace armor {
	const get_item_group = core.get_item_group;

	const ceil = math.ceil;
	const random = math.random;

	export function recalculate_armor(player: ObjectRef): void {
		const inv: InvRef | null = player.get_inventory();
		if (inv == null) {
			throw new Error("Not a player.");
		}

		let player_skin: string = skins.get_skin(player);

		let armor_skin = "blank_skin.png";

		{
			//? Helmet.

			const stack: string = inv.get_stack("armor_head", 1).get_name();
			if (stack != "" && get_item_group(stack, "helmet") > 0) {
				const skinElement: string | undefined =
					core.registered_items[stack]?.wearing_texture;
				if (skinElement == null) {
					throw new Error(`Wearing texture for [${stack}] is null.`);
				}
				// This is probably like this because the skin is broken.
				player_skin += "^" + skinElement;
			}
		}

		{
			//? Chest plate.

			const stack: string = inv.get_stack("armor_torso", 1).get_name();
			if (stack != "" && get_item_group(stack, "chestplate") > 0) {
				const skinElement: string | undefined =
					core.registered_items[stack]?.wearing_texture;
				if (skinElement == null) {
					throw new Error(`Wearing texture for [${stack}] is null.`);
				}
				armor_skin += "^" + skinElement;
			}
		}

		{
			//? Leggings.

			const stack: string = inv.get_stack("armor_legs", 1).get_name();
			if (stack != "" && get_item_group(stack, "leggings") > 0) {
				const skinElement: string | undefined =
					core.registered_items[stack]?.wearing_texture;
				if (skinElement == null) {
					throw new Error(`Wearing texture for [${stack}] is null.`);
				}
				armor_skin += "^" + skinElement;
			}
		}

		{
			//? Boots.

			const stack: string = inv.get_stack("armor_feet", 1).get_name();
			if (stack != "" && get_item_group(stack, "boots") > 0) {
				const skinElement: string | undefined =
					core.registered_items[stack]?.wearing_texture;
				if (skinElement == null) {
					throw new Error(`Wearing texture for [${stack}] is null.`);
				}
				armor_skin += "^" + skinElement;
			}
		}

		player.set_properties({ textures: [player_skin, armor_skin] });
	}

	export function calculate_armor_absorbtion(player: ObjectRef): number {
		const inv: InvRef | null = player.get_inventory();
		if (inv == null) {
			throw new Error("Not a player.");
		}

		let armor_absorbtion: number = 0;

		for (const slot of [
			"armor_head",
			"armor_torso",
			"armor_legs",
			"armor_feet",
		]) {
			const stack: string = inv.get_stack(slot, 1).get_name();
			if (stack != "") {
				const level: number = get_item_group(stack, "armor_level");
				const defense: number = get_item_group(stack, "armor_defense");
				armor_absorbtion += level * defense;
			}
		}

		if (armor_absorbtion > 0) {
			armor_absorbtion = ceil(armor_absorbtion / 4);
		}
		return armor_absorbtion;
	}

	export function set_armor_gui(player: ObjectRef): void {
		const level: number = calculate_armor_absorbtion(player);
		hudManager.change_hud({
			player: player,
			hudName: "armor_fg",
			element: "number",
			data: level,
		});
	}

	export function damage_armor(player: ObjectRef, damage: number): void {
		const inv: InvRef | null = player.get_inventory();
		if (inv == null) {
			throw new Error("Not a player.");
		}
		let recalc: boolean = false;

		const multiplier: number[] = [8, 4, 6, 10];
		const slots: string[] = [
			"armor_head",
			"armor_torso",
			"armor_legs",
			"armor_feet",
		];

		for (let i = 0; i < slots.length; i++) {
			const slot: string = slots[i];
			const stack: ItemStackObject = inv.get_stack(slot, 1);
			const name: string = stack.get_name();
			if (name != "") {
				const mult: number | undefined = multiplier[i];
				if (mult == null) {
					throw new Error("How");
				}
				const wear_level =
					(9 - get_item_group(name, "armor_level")) *
					mult *
					(5 - get_item_group(name, "armor_type")) *
					damage;
				stack.add_wear(wear_level);
				inv.set_stack(slot, 1, stack);
				const new_stack: string = inv.get_stack(slot, 1).get_name();
				if (new_stack == "") {
					recalc = true;
				}
			}
		}

		if (recalc) {
			core.sound_play("armor_break", {
				object: player,
				gain: 1,
				pitch: random(80, 100) / 100,
			});
			recalculate_armor(player);
			set_armor_gui(player);
		}
	}

	core.register_on_joinplayer((player) => {
		hudManager.add_hud(player, "armor_bg", {
			type: HudElementType.statbar,
			position: { x: 0.5, y: 1 },
			text: "armor_icon_bg.png",
			number: 20,
			size: { x: 24, y: 24 },
			offset: { x: -10 * 24 - 25, y: -(48 + 50 + 39) },
		});
		hudManager.add_hud(player, "armor_fg", {
			type: HudElementType.statbar,
			position: { x: 0.5, y: 1 },
			text: "armor_icon.png",
			number: calculate_armor_absorbtion(player),
			size: { x: 24, y: 24 },
			offset: { x: -10 * 24 - 25, y: -(48 + 50 + 39) },
		});
		const inv: InvRef | null = player.get_inventory();
		if (inv == null) {
			throw new Error("Not a player.");
		}
		inv.set_size("armor_head", 1);
		inv.set_size("armor_torso", 1);
		inv.set_size("armor_legs", 1);
		inv.set_size("armor_feet", 1);
	});

	core.register_on_dieplayer((player) => {
		set_armor_gui(player);
	});

	const acceptable = new Set<string>([
		"armor_head",
		"armor_torso",
		"armor_legs",
		"armor_feet",
	]);

	core.register_on_player_inventory_action(
		(player, action, inventory, inventory_info) => {
			if (
				acceptable.has(inventory_info.from_list) ||
				acceptable.has(inventory_info.to_list)
			) {
				core.after(
					0,
					(player: ObjectRef) => {
						if (!player.is_player()) {
							return;
						}
						recalculate_armor(player);
						set_armor_gui(player);
					},
					player
				);
			}
		}
	);

	// Only allow players to put armor in the right slots to stop exploiting chestplates.
	core.register_allow_player_inventory_action(
		(
			player: ObjectRef,
			action: string,
			inventory: InvRef,
			inventory_info: ActionDefinition
		) => {
			const slots: string[] = [
				"armor_head",
				"armor_torso",
				"armor_legs",
				"armor_feet",
			];

			const group: string[] = [
				"helmet",
				"chestplate",
				"leggings",
				"boots",
			];

			for (let i = 0; i < slots.length; i++) {
				if (inventory_info.to_list == slots[i]) {
					const stack = inventory.get_stack(
						inventory_info.from_list,
						inventory_info.from_index
					);
					const item: string = stack.get_name();
					if (get_item_group(item, group[i]) == 0) {
						return 0;
					}
				}
			}
		}
	);

	// Max 8.
	const materials: Dictionary<string, number> = {
		coal: 1,
		lapis: 2,
		iron: 3,
		chain: 4,
		gold: 2,
		diamond: 5,
		emerald: 6,
		sapphire: 7,
		ruby: 8,
	};

	// Max 4.
	const armor_type: Dictionary<string, number> = {
		helmet: 2,
		chestplate: 4,
		leggings: 3,
		boots: 1,
	};

	function bool_int(state: boolean): number {
		return state ? 1 : 0;
	}

	for (const [material_id, material] of pairs(materials)) {
		for (const [armor_id, armor] of pairs(armor_type)) {
			// print(material_id, material, "|", armor_id, armor);

			core.register_tool(
				"crafter_armor:" + material_id + "_" + armor_id,
				{
					description:
						string.gsub(material_id, "^%l", string.upper)[0] +
						" " +
						string.gsub(armor_id, "^%l", string.upper)[0],
					groups: {
						armor: 1,
						armor_level: material,
						armor_defense: armor,
						helmet: bool_int(armor_id == "helmet"),
						chestplate: bool_int(armor_id == "chestplate"),
						leggings: bool_int(armor_id == "leggings"),
						boots: bool_int(armor_id == "boots"),
					},
					inventory_image: material_id + "_" + armor_id + "_item.png",
					stack_max: 1,
					wearing_texture: material_id + "_" + armor_id + ".png",
					tool_capabilities: {
						full_punch_interval: 0,
						max_drop_level: 0,
						groupcaps: {},
						damage_groups: {},
						punch_attack_uses: 0,
					},
				}
			);

			if (armor_id == "helmet") {
				core.register_craft({
					output: "crafter_armor:" + material_id + "_" + armor_id,
					recipe: [
						[
							"crafter:" + material_id,
							"crafter:" + material_id,
							"crafter:" + material_id,
						],
						[
							"crafter:" + material_id,
							"",
							"crafter:" + material_id,
						],
					],
				});
			} else if (armor_id == "chestplate") {
				core.register_craft({
					output: "crafter_armor:" + material_id + "_" + armor_id,
					recipe: [
						[
							"crafter:" + material_id,
							"",
							"crafter:" + material_id,
						],
						[
							"crafter:" + material_id,
							"crafter:" + material_id,
							"crafter:" + material_id,
						],
						[
							"crafter:" + material_id,
							"crafter:" + material_id,
							"crafter:" + material_id,
						],
					],
				});
			} else if (armor_id == "leggings") {
				core.register_craft({
					output: "crafter_armor:" + material_id + "_" + armor_id,
					recipe: [
						[
							"crafter:" + material_id,
							"crafter:" + material_id,
							"crafter:" + material_id,
						],
						[
							"crafter:" + material_id,
							"",
							"crafter:" + material_id,
						],
						[
							"crafter:" + material_id,
							"",
							"crafter:" + material_id,
						],
					],
				});
			} else if (armor_id == "boots") {
				core.register_craft({
					output: "crafter_armor:" + material_id + "_" + armor_id,
					recipe: [
						[
							"crafter:" + material_id,
							"",
							"crafter:" + material_id,
						],
						[
							"crafter:" + material_id,
							"",
							"crafter:" + material_id,
						],
					],
				});

				core.register_node(
					"crafter_armor:" +
						material_id +
						"_" +
						armor_id +
						"particletexture",
					{
						description: "NIL",
						tiles: [material_id + "_" + armor_id + "_item.png"],
						groups: {},
						drop: "",
						drawtype: Drawtype.allfaces,
						on_construct: (pos) => {
							core.remove_node(pos);
						},
					}
				);
			}
		}
	}
}
