namespace redstone {
	//? On.

	//inverts redstone signal
	core.register_node("crafter_redstone:inverter_on", {
		description: "Redstone Inverter",
		tiles: ["repeater_on.png"],
		groups: {
			stone: 1,
			hard: 1,
			pickaxe: 1,
			hand: 4,
			attached_node: 1,
			redstone_activation_directional: 1,
		},
		sounds: crafter.stoneSound(),
		paramtype: ParamType1.light,
		paramtype2: ParamType2["4dir"],
		sunlight_propagates: true,
		walkable: false,
		drawtype: Drawtype.nodebox,
		drop: "crafter_redstone:inverter_off",
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				//left  front  bottom right back top
				[-0.5, -0.5, -0.5, 0.5, -0.3, 0.5], //base
				[-0.2, -0.5, 0.2, 0.2, 0.1, 0.4], //output post
			],
		},
		after_place_node: (pos: Vec3) => {
			const param2: number | undefined = core.get_node(pos).param2;
			if (param2 == null) {
				throw new Error("param2 error 1");
			}
			const dir = core.fourdir_to_dir(param2);
			addData(pos, {
				isDirectionalPowerSource: false,
				isPowerSource: false,
				powerSource: 0,
				isDust: false,
				dust: 0,
				directional_activator: true,
				input: core.hash_node_position(vector.subtract(pos, dir)),
				output: core.hash_node_position(vector.add(pos, dir)),
			});
		},
		after_destruct: (pos: Vec3) => {
			deleteData(pos);
		},
		redstone_deactivation: (pos: Vec3) => {
			const param2: number | undefined = core.get_node(pos).param2;
			if (param2 == null) {
				throw new Error("Param2 error 2");
			}
			core.swap_node(pos, {
				name: "crafter_redstone:inverter_off",
				param2: param2,
			});
			const dir: Vec3 = core.fourdir_to_dir(param2);
			addData(pos, {
				isDirectionalPowerSource: false,
				isPowerSource: false,
				powerSource: 0,
				isDust: false,
				dust: 0,
				directional_activator: true,
				input: core.hash_node_position(vector.subtract(pos, dir)),
				output: core.hash_node_position(vector.add(pos, dir)),
			});
		},
	});

	//? Off.

	core.register_node("crafter_redstone:inverter_off", {
		description: "Redstone Inverter",
		tiles: ["repeater_off.png"],
		groups: {
			stone: 1,
			hard: 1,
			pickaxe: 1,
			hand: 4,
			attached_node: 1,
			redstone_activation_directional: 1,
			torch_directional: 1,
			redstone_power: maxState,
		},
		sounds: crafter.stoneSound(),
		paramtype: ParamType1.light,
		paramtype2: ParamType2["4dir"],
		sunlight_propagates: true,
		walkable: false,
		drawtype: Drawtype.nodebox,
		drop: "crafter_redstone:inverter_off",
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				//left  front  bottom right back top
				[-0.5, -0.5, -0.5, 0.5, -0.3, 0.5], //base
				[-0.2, -0.5, 0.2, 0.2, 0.1, 0.4], //output post
			],
		},
		after_place_node: (pos, placer, itemstack, pointed_thing) => {
			const param2: number | undefined = core.get_node(pos).param2;

			if (param2 == null) {
				throw new Error("param2 error 1");
			}
			const dir = core.fourdir_to_dir(param2);
			addData(pos, {
				isDirectionalPowerSource: false,
				isPowerSource: false,
				powerSource: 0,
				isDust: false,
				dust: 0,
				directional_activator: true,
				input: core.hash_node_position(vector.subtract(pos, dir)),
				output: core.hash_node_position(vector.add(pos, dir)),
			});
		},
		after_destruct: (pos: Vec3) => {
			deleteData(pos);
		},
		redstone_activation: (pos: Vec3) => {
			const param2: number | undefined = core.get_node(pos).param2;
			if (param2 == null) {
				throw new Error("Param 2 error 4");
			}
			core.swap_node(pos, {
				name: "crafter_redstone:inverter_on",
				param2: param2,
			});
			const dir: Vec3 = core.fourdir_to_dir(param2);
			addData(pos, {
				isDirectionalPowerSource: true,
				isPowerSource: false,
				powerSource: maxState,
				isDust: false,
				dust: 0,
				directional_activator: true,
				input: core.hash_node_position(vector.subtract(pos, dir)),
				output: core.hash_node_position(vector.add(pos, dir)),
			});
		},
	});
}
