namespace treecapitator {
	export interface TreecapitatorDef {
		radius: number;
		leaves: string[];
		trunks: string[];
	}

	// Leaf decay.
	function leafdecay_after_destruct(
		pos: Vec3,
		oldnode: NodeTable,
		def: TreecapitatorDef
	): void {
		for (const [_, v] of pairs(
			core.find_nodes_in_area(
				vector.subtract(pos, def.radius),
				vector.add(pos, def.radius),
				def.leaves
			)
		)) {
			const node: NodeTable = core.get_node(v);
			const timer: NodeTimerObject = core.get_node_timer(v);
			if (node.param2 != 1 && !timer.is_started()) {
				timer.start(math.random() + math.random() + math.random());
			}
		}
	}

	function leafdecay_on_timer(pos: Vec3, def: TreecapitatorDef) {
		if (core.find_node_near(pos, def.radius, def.trunks)) {
			return false;
		}

		core.dig_node(pos);

		core.add_particlespawner({
			amount: 20,
			time: 0.0001,
			minpos: vector.create3d({
				x: pos.x - 0.5,
				y: pos.y - 0.5,
				z: pos.z - 0.5,
			}),
			maxpos: vector.create3d({
				x: pos.x + 0.5,
				y: pos.y + 0.5,
				z: pos.z + 0.5,
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
			node: { name: def.leaves[1] },
		});
		core.sound_play("leaves", {
			pos: pos,
			gain: 0.2,
			max_hear_distance: 60,
			pitch: math.random(70, 100) / 100,
		});
	}

	export function register_leafdecay(def: TreecapitatorDef) {
		for (const v of def.trunks) {
			core.override_item(v, {
				after_destruct: (pos: Vec3, oldnode: NodeTable) => {
					leafdecay_after_destruct(pos, oldnode, def);
				},
			});
		}

		for (const v of def.leaves) {
			core.override_item(v, {
				on_timer: (pos: Vec3) => {
					leafdecay_on_timer(pos, def);
				},
			});
		}
	}

	// ///////////////////////////// registration
	// treecaptitator.register_leafdecay({
	// 	trunks = {"main:tree"},
	// 	leaves = {"main:leaves"},
	// 	radius = 2,
	// })

	const acceptable_soil: { [id: string]: boolean } = {
		"crafter:dirt": true,
		"crafter:grass": true,
		"aether:dirt": true,
		"aether:grass": true,
	};

	core.override_item("crafter:tree", {
		on_dig: (pos: Vec3, node: NodeTable, digger: ObjectRef) => {
			//bvav_create_vessel(pos,core.facedir_to_dir(core.dir_to_facedir(core.yaw_to_dir(digger:get_look_horizontal()+(math.pi/2)))))

			if (
				core.get_item_group(
					digger.get_wielded_item().get_name(),
					"treecapitator"
				) <= 0
			) {
				return core.node_dig(pos, node, digger);
			}

			//check if wielding axe?
			//turn treecapitator into an enchantment?
			//local tool_meta = digger:get_wielded_item():get_meta()
			//if tool_meta:get_int("treecapitator") > 0 then

			const meta: MetaRef = core.get_meta(pos);

			if (
				!meta.contains("placed") &&
				string.match(digger.get_wielded_item().get_name(), "axe")
			) {
				const tool_capabilities: ToolCapabilities = digger
					.get_wielded_item()
					.get_tool_capabilities();

				const wear: number = core.get_dig_params(
					{ wood: 1 },
					tool_capabilities
				).wear;

				const wield_stack: ItemStackObject = digger.get_wielded_item();

				//remove tree
				for (let y = -6; y <= 6; y++) {
					const name: string = core.get_node(
						vector.create3d(pos.x, pos.y + y, pos.z)
					).name;

					if (
						name == "crafter:tree" ||
						name == "redstone:node_activated_tree"
					) {
						wield_stack.add_wear(wear);
						core.node_dig(
							vector.create3d(pos.x, pos.y + y, pos.z),
							node,
							digger
						);
						core.add_particlespawner({
							amount: 30,
							time: 0.0001,
							minpos: vector.create3d({
								x: pos.x - 0.5,
								y: pos.y - 0.5 + y,
								z: pos.z - 0.5,
							}),
							maxpos: vector.create3d({
								x: pos.x + 0.5,
								y: pos.y + 0.5 + y,
								z: pos.z + 0.5,
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
							node: { name: name },
						});

						const name2: string = core.get_node(
							vector.create3d(pos.x, pos.y + y - 1, pos.z)
						).name;
						if (acceptable_soil[name2]) {
							core.add_node(
								vector.create3d(pos.x, pos.y + y, pos.z),
								{ name: "crafter:sapling" }
							);
						}
					}
				}
				digger.set_wielded_item(wield_stack);
			} else {
				core.node_dig(pos, node, digger);
			}
		},
	});
}
