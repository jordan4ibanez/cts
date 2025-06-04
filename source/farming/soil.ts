namespace farming {
	function soilHasWater(pos: Vec3): boolean {
		const [a, _] = core.find_nodes_in_area(
			vector.create3d(pos.x - 3, pos.y, pos.z - 3),
			vector.create3d(pos.x + 3, pos.y, pos.z + 3),
			["crafter:water", "crafter:waterflow"]
		);
		return a.length > 0;
	}

	for (const [level, dryness] of pairs(["wet", "dry"])) {
		if (typeof level != "number") {
			throw new Error("how");
		}

		const coloring: number = 160 / level;

		let on_construct: ((pos: Vec3) => void) | undefined;
		let on_timer: ((pos: Vec3) => void) | undefined;

		if (dryness == "wet") {
			on_construct = (pos: Vec3) => {
				if (!soilHasWater(pos)) {
					core.set_node(pos, {
						name: "crafter_farming:farmland_dry",
					});
				}
				const timer: NodeTimerObject = core.get_node_timer(pos);
				timer.start(math.random(10, 25) + math.random());
			};
			on_timer = (pos: Vec3) => {
				if (!soilHasWater(pos)) {
					core.set_node(pos, {
						name: "crafter_farming:farmland_dry",
					});
				}
				const timer: NodeTimerObject = core.get_node_timer(pos);
				timer.start(math.random(10, 25) + math.random());
			};
		} else {
			on_construct = (pos: Vec3) => {
				const timer: NodeTimerObject = core.get_node_timer(pos);
				timer.start(math.random(10, 25));
			};
			on_timer = (pos: Vec3) => {
				const found: boolean = soilHasWater(pos);
				if (found) {
					core.set_node(pos, {
						name: "crafter_farming:farmland_wet",
					});
					const timer: NodeTimerObject = core.get_node_timer(pos);
					timer.start(math.random(10, 25) + math.random());
				} else {
					core.set_node(pos, { name: "crafter:dirt" });

					core.sound_play("dirt", {
						pos: pos,
						gain: 0.3,
					});

					const abovePos: Vec3 = vector.create3d(
						pos.x,
						pos.y + 1,
						pos.z
					);

					const nodeAboveName: string = core.get_node(abovePos).name;

					if (core.get_item_group(nodeAboveName, "plant") > 0) {
						core.dig_node(abovePos);
						core.add_particlespawner({
							amount: 20,
							time: 0.0001,
							minpos: vector.create3d({
								x: abovePos.x - 0.5,
								y: abovePos.y - 0.5,
								z: abovePos.z - 0.5,
							}),
							maxpos: vector.create3d({
								x: abovePos.x + 0.5,
								y: abovePos.y + 0.5,
								z: abovePos.z + 0.5,
							}),
							minvel: vector.create3d(-1, 0, -1),
							maxvel: vector.create3d(1, 0, 1),
							minacc: vector.create3d({ x: 0, y: -9.81, z: 0 }),
							maxacc: vector.create3d({ x: 0, y: -9.81, z: 0 }),
							minexptime: 0.5,
							maxexptime: 1.5,
							minsize: 0,
							maxsize: 0,
							collisiondetection: true,
							vertical: false,
							node: { name: nodeAboveName },
						});
					}
				}
			};
		}
		core.register_node("crafter_farming:farmland_" + dryness, {
			description: "Farmland",
			paramtype: ParamType1.light,
			drawtype: Drawtype.nodebox,
			sounds: crafter.dirtSound(),
			//paramtype2 : "wallmounted",
			node_box: {
				type: Nodeboxtype.fixed,
				//{xmin, ymin, zmin, xmax, ymax, zmax}
				fixed: [-0.5, -0.5, -0.5, 0.5, 6 / 16, 0.5],
			},
			// wetness : math.abs(level-2),
			collision_box: {
				type: Nodeboxtype.fixed,
				//{xmin, ymin, zmin, xmax, ymax, zmax}
				fixed: [-0.5, -0.5, -0.5, 0.5, 6 / 16, 0.5],
			},
			tiles: [
				"dirt.png^farmland.png^[colorize:black:" + coloring,
				"dirt.png^[colorize:black:" + coloring,
				"dirt.png^[colorize:black:" + coloring,
				"dirt.png^[colorize:black:" + coloring,
				"dirt.png^[colorize:black:" + coloring,
				"dirt.png^[colorize:black:" + coloring,
			],
			groups: {
				dirt: 1,
				soft: 1,
				shovel: 1,
				hand: 1,
				soil: 1,
				farmland: 1,
			},
			drop: "crafter:dirt",
			on_construct: on_construct,
			on_timer: on_timer,
		});
	}
}
