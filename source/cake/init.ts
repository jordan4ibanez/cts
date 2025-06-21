namespace cake {
	const play_sound = core.sound_play;
	const set_node = core.set_node;
	const random = math.random;

	hunger.register_food("crafter_cake:cake_item_placeholder", {
		description: "",
		texture: "nothing.png",
		satiation: 30,
		hunger: 6,
	});

	for (const i of $range(0, 13)) {
		let missing_slice: string = "";
		if (i == 0) {
			missing_slice = "cake_side.png";
		} else {
			missing_slice = "cake_inner.png";
		}

		core.register_node("crafter_cake:cake_" + i, {
			description: "Cake",
			tiles: [
				"cake_top.png",
				"cake_bottom.png",
				"cake_side.png",
				"cake_side.png",
				missing_slice,
				"cake_side.png",
			],
			drawtype: Drawtype.nodebox,
			paramtype: ParamType1.light,
			node_box: {
				type: Nodeboxtype.fixed,
				fixed: [
					[-7 / 16, -8 / 16, -7 / 16, 7 / 16, -1 / 16, (7 - i) / 16],
				],
			},
			drop: "",
			sounds: crafter.woolSound(),
			groups: { wool: 1, cake: i, falling_node: 1 },
			on_construct: (pos: Vec3) => {
				// 			//randomly cake eats itself
				if (random() > 0.995) {
					set_node(pos, { name: "crafter_cake:cursed_cake_0" });
				}
			},

			on_rightclick: (
				pos: Vec3,
				node: NodeTable,
				clicker: ObjectRef,
				itemstack: ItemStackObject,
				pointed_thing: PointedThing
			) => {
				if (hunger.get_player_hunger(clicker) >= 20) {
					return;
				}
				hunger.player_eat_food(
					clicker,
					ItemStack("crafter_cake:cake_item_placeholder"),
					true
				);
				//clicker:set_hp(clicker:get_hp()+5)
				if (i == 13) {
					play_sound("eat_finish", {
						pos: pos,
						gain: 0.2,
						pitch: random(90, 100) / 100,
					});
					core.remove_node(pos);
					return;
				} else {
					play_sound("eat", {
						pos: pos,
						gain: 0.2,
						pitch: random(90, 100) / 100,
					});
					set_node(pos, { name: "crafter_cake:cake_" + (i + 1) });
				}
			},
		});
	}

	for (const i of $range(0, 13)) {
		let missing_slice: string = "";
		if (i == 0) {
			missing_slice = "cake_side.png^[colorize:red:140";
		} else {
			missing_slice = "cake_inner.png^[colorize:red:140";
		}
		core.register_node("crafter_cake:cursed_cake_" + i, {
			description: "CURSED CAKE",
			tiles: [
				"cake_top.png^[colorize:red:140",
				"cake_bottom.png^[colorize:red:140",
				"cake_side.png^[colorize:red:140",
				"cake_side.png^[colorize:red:140",
				missing_slice,
				"cake_side.png^[colorize:red:140",
			],
			drawtype: Drawtype.nodebox,
			paramtype: ParamType1.light,
			node_box: {
				type: Nodeboxtype.fixed,
				fixed: [
					[-7 / 16, -8 / 16, -7 / 16, 7 / 16, -1 / 16, (7 - i) / 16],
				],
			},
			drop: "",
			sounds: crafter.woolSound(),
			groups: { wool: 1, cursed_cake: i, falling_node: 1 },
			on_construct: (pos: Vec3) => {
				const timer = core.get_node_timer(pos);
				timer.start(0.2);
			},
			on_rightclick: (
				pos: Vec3,
				node: NodeTable,
				clicker: ObjectRef,
				itemstack: ItemStackObject,
				pointed_thing: PointedThing
			) => {
				hunger.player_eat_food(
					clicker,
					ItemStack("crafter_cake:cake_item_placeholder")
				);
				clicker.set_hp(clicker.get_hp() - 5);
			},
			on_timer: (pos: Vec3, elapsed: number) => {
				if (i == 13) {
					play_sound("eat_finish", {
						pos: pos,
						gain: 0.2,
						pitch: random(90, 100) / 100,
					});
					core.remove_node(pos);
					return;
				} else {
					play_sound("eat", {
						pos: pos,
						gain: 0.2,
						pitch: random(90, 100) / 100,
					});
					set_node(pos, {
						name: "crafter_cake:cursed_cake_" + (i + 1),
					});
				}
			},
		});
	}

	// todo: why is this using a snowball?
	core.register_craft({
		output: "crafter_cake:cake_0",
		recipe: [
			[
				"crafter_weather:snowball",
				"crafter_weather:snowball",
				"crafter_weather:snowball",
			],
			[
				"crafter_farming:wheat",
				"crafter_farming:wheat",
				"crafter_farming:wheat",
			],
		],
	});
}
