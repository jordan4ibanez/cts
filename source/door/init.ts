// local
// minetest,math,pairs,table
// =
// minetest,math,pairs,table

namespace door {
	const get_item_group = core.get_item_group;
	const get_node = core.get_node;
	const set_node = core.set_node;
	const play_sound = core.sound_play;
	const t_copy = table.copy;

	// local node
	// local name
	// local opened
	// local closed
	// local closed
	// local top
	// local bottom
	// local param2
	// local pos2

	for (const material of ["wood", "iron"]) {
		// This is the function that makes the door open and close when rightclicked.
		function door_rightclick(pos: Vec3) {
			const node: NodeTable = get_node(pos);
			const name: string = node.name;
			const opened: number = get_item_group(name, "crafter_door_open");
			const closed: number = get_item_group(name, "crafter_door_closed");
			const top: number = get_item_group(name, "crafter_door_top");
			const bottom: number = get_item_group(name, "crafter_door_bottom");
			const param2: number | undefined = node.param2;
			const pos2: Vec3 = vector.create3d(pos);

			// Close the door.
			if (opened > 0) {
				play_sound("door_close", {
					pos: pos,
					pitch: math.random(80, 100) / 100,
				});

				if (top > 0) {
					pos2.y = pos2.y - 1;
					set_node(pos, {
						name: "crafter_door:top_" + material + "_closed",
						param2: param2,
					});
					set_node(pos2, {
						name: "crafter_door:bottom_" + material + "_closed",
						param2: param2,
					});
				} else if (bottom > 0) {
					pos2.y = pos2.y + 1;
					set_node(pos, {
						name: "crafter_door:bottom_" + material + "_closed",
						param2: param2,
					});
					set_node(pos2, {
						name: "crafter_door:top_" + material + "_closed",
						param2: param2,
					});
				}

				// Open the door.
			} else if (closed > 0) {
				play_sound("door_open", {
					pos: pos,
					pitch: math.random(80, 100) / 100,
				});
				if (top > 0) {
					pos2.y = pos2.y - 1;
					set_node(pos, {
						name: "crafter_door:top_" + material + "_open",
						param2: param2,
					});
					set_node(pos2, {
						name: "crafter_door:bottom_" + material + "_open",
						param2: param2,
					});
				} else if (bottom > 0) {
					pos2.y = pos2.y + 1;
					set_node(pos, {
						name: "crafter_door:bottom_" + material + "_open",
						param2: param2,
					});
					set_node(pos2, {
						name: "crafter_door:top_" + material + "_open",
						param2: param2,
					});
				}
			}
		}

		// This is where the top and bottom of the door are created.
		for (const door of ["top", "bottom"]) {
			for (const state of ["open", "closed"]) {
				let door_node_box: number[] = [];
				if (state == "closed") {
					door_node_box = [-0.5, -0.5, -0.5, 0.5, 0.5, -0.3];
				} else if (state == "open") {
					door_node_box = [5 / 16, -0.5, -0.5, 0.5, 0.5, 0.5];
				}

				let tiles: string[] = [];
				let groups: { [id: string]: number } = {};
				let sounds: NodeSoundSpec | undefined;
				let on_rightclick: ((pos: Vec3) => void) | undefined;
				let redstone_deactivation: ((pos: Vec3) => void) | undefined;
				let redstone_activation: ((pos: Vec3) => void) | undefined;

				// Redstone input.
				if (state == "open") {
					redstone_deactivation = (pos: Vec3) => {
						door_rightclick(pos);
					};
				} else if (state == "closed") {
					redstone_activation = (pos: Vec3) => {
						door_rightclick(pos);
					};
				}

				if (material == "wood") {
					sounds = crafter.woodSound();

					on_rightclick = function (pos: Vec3) {
						door_rightclick(pos);
					};

					// Bottom.
					if (door == "bottom") {
						tiles = ["wood.png"];
						groups = {
							wood: 2,
							tree: 1,
							hard: 1,
							axe: 1,
							hand: 3,
							crafter_door_bottom: 1,
							door_open: state == "open" ? 1 : 0,
							door_closed: state == "closed" ? 1 : 0,
						};

						// Top.
					} else {
						if (state == "closed") {
							tiles = [
								"wood.png",
								"wood.png",
								"wood.png",
								"wood.png",
								"wood_door_top.png",
								"wood_door_top.png",
							];
						} else if (state == "open") {
							tiles = [
								"wood.png",
								"wood.png",
								"wood_door_top.png",
								"wood_door_top.png",
								"wood.png",
								"wood.png",
							];
						}
						groups = {
							wood: 2,
							tree: 1,
							hard: 1,
							axe: 1,
							hand: 3,
							redstone_activation: 1,
							crafter_door_top: 1,
							door_open: state == "open" ? 1 : 0,
							door_closed: state == "closed" ? 1 : 0,
						};
					}
				} else if (material == "iron") {
					sounds = crafter.stoneSound();
					if (door == "bottom") {
						tiles = ["iron_block.png"];
						groups = {
							stone: 1,
							hard: 1,
							pickaxe: 1,
							hand: 4,
							bottom: 1,
							crafter_door_open: state == "open" ? 1 : 0,
							crafter_door_closed: state == "closed" ? 1 : 0,
						};
					} else {
						if (state == "closed") {
							tiles = [
								"iron_block.png",
								"iron_block.png",
								"iron_block.png",
								"iron_block.png",
								"iron_door_top.png",
								"iron_door_top.png",
							];
						} else if (state == "open") {
							tiles = [
								"iron_block.png",
								"iron_block.png",
								"iron_door_top.png",
								"iron_door_top.png",
								"iron_block.png",
								"iron_block.png",
							];
						}
						groups = {
							stone: 1,
							hard: 1,
							pickaxe: 1,
							hand: 4,
							redstone_activation: 1,
							top: 1,
							crafter_door_open: state == "open" ? 1 : 0,
							crafter_door_closed: state == "closed" ? 1 : 0,
						};
					}
				}

				core.register_node(
					"crafter_door:" + door + "_" + material + "_" + state,
					{
						description:
							string.gsub(material, "^%l", string.upper) +
							" Door",
						tiles: tiles,
						wield_image: "door_inv_" + material + ".png",
						inventory_image: "door_inv_" + material + ".png",
						drawtype: Drawtype.nodebox,
						paramtype: ParamType1.light,
						paramtype2: ParamType2.facedir,
						groups: groups,
						sounds: sounds,
						drop: "crafter_door:bottom_" + material + "_closed",
						node_placement_prediction: "",
						node_box: {
							type: Nodeboxtype.fixed,
							fixed: [
								//left front bottom right back top
								door_node_box,
							],
						},
						//redstone activation is in both because only the bottom is defined as an activator and it's easier to do it like this

						redstone_activation: redstone_activation,
						redstone_deactivation: redstone_deactivation,

						on_rightclick: on_rightclick,
						after_place_node: (
							pos: Vec3,
							placer: ObjectRef,
							itemstack: ItemStackObject
						) => {
							const node: NodeTable = get_node(pos);
							const param2: number | undefined = node.param2;
							const pos2: Vec3 = vector.create3d(pos);

							pos2.y = pos2.y + 1;
							if (get_node(pos2).name == "air") {
								set_node(pos2, {
									name:
										"crafter_door:top_" +
										material +
										"_closed",
									param2: param2,
								});
							} else {
								core.remove_node(pos);
								itemstack.add_item(
									ItemStack(
										"crafter_door:bottom_" +
											material +
											"_closed"
									)
								);
							}
						},
						after_dig_node: (pos: Vec3, oldnode: NodeTable) => {
							if (
								string.match(
									oldnode.name,
									"crafter_door:bottom_"
								)[0] != null
							) {
								pos.y = pos.y + 1;
								core.remove_node(pos);
							} else {
								pos.y = pos.y - 1;
								core.remove_node(pos);
							}
						},
					}
				);
			}
		}
		core.register_craft({
			output: "crafter_door:bottom_" + material + "_closed",
			recipe: [
				["main:" + material, "main:" + material],
				["main:" + material, "main:" + material],
				["main:" + material, "main:" + material],
			],
		});
	}
}
