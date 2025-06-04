namespace farming {
	farming.register_plant("cactus", {
		description: "Cactus",
		tiles: ["cactus_top.png", "cactus_bottom.png", "cactus_side.png"],
		groups: { dig_immediate: 1, flammable: 1, touch_hurt: 1 },
		sounds: crafter.dirtSound(),
		paramtype: ParamType1.light,
		sunlight_propagates: true,
		drawtype: Drawtype.nodebox,
		buildable_to: false,
		waving: 0,
		grows: PlantGrowth.up,
		node_box: {
			type: Nodeboxtype.fixed,
			fixed: [
				[-7 / 16, -8 / 16, -7 / 16, 7 / 16, 8 / 16, 7 / 16], // Main body
				[-8 / 16, -8 / 16, -7 / 16, 8 / 16, 8 / 16, -7 / 16], // Spikes
				[-8 / 16, -8 / 16, 7 / 16, 8 / 16, 8 / 16, 7 / 16], // Spikes
				[-7 / 16, -8 / 16, -8 / 16, -7 / 16, 8 / 16, 8 / 16], // Spikes
				[7 / 16, -8 / 16, 8 / 16, 7 / 16, 8 / 16, -8 / 16], // Spikes
			],
		},
	});

	farming.register_plant("sugarcane", {
		description: "Sugarcane",
		inventory_image: "sugarcane.png",
		tiles: ["sugarcane.png"],
		groups: { dig_immediate: 1, flammable: 1 },
		sounds: crafter.grassSound(),
		paramtype: ParamType1.light,
		sunlight_propagates: true,
		drawtype: Drawtype.plantlike,
		buildable_to: false,
		waving: 1,
		walkable: false,
		grows: PlantGrowth.up,
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-7 / 16, -0.5, -7 / 16, 7 / 16, 0.5, 7 / 16],
		},
	});

	farming.register_plant("grass", {
		description: "Tall Grass",
		drawtype: Drawtype.plantlike,
		waving: 1,
		inventory_image: "tallgrass.png",
		walkable: false,
		climbable: false,
		paramtype: ParamType1.light,
		tiles: ["tallgrass.png"],
		paramtype2: ParamType2.degrotate,
		buildable_to: true,
		sunlight_propagates: true,
		groups: { dig_immediate: 1, attached_node: 1, flammable: 1 },
		sounds: crafter.grassSound(),
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-4 / 16, -0.5, -4 / 16, 4 / 16, 4 / 16, 4 / 16],
		},
		drop: {
			max_items: 1,
			items: [
				{
					rarity: 10,
					items: ["crafter_farming:melon_seeds"],
				},
				{
					rarity: 10,
					items: ["crafter_farming:pumpkin_seeds"],
				},
				{
					rarity: 10,
					items: ["crafter_farming:wheat_seeds"],
				},
			],
		},
	});

	farming.register_plant("wheat", {
		description: "Wheat",
		drawtype: Drawtype.plantlike,
		waving: 1,
		walkable: false,
		climbable: false,
		paramtype: ParamType1.light,
		tiles: ["wheat_stage"], //automatically adds _X.png
		paramtype2: ParamType2.degrotate,
		buildable_to: false,
		groups: {
			leaves: 1,
			plant: 1,
			axe: 1,
			hand: 0,
			dig_immediate: 1,
			attached_node: 1,
			crops: 1,
		},
		sounds: crafter.grassSound(),
		sunlight_propagates: true,
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-6 / 16, -0.5, -6 / 16, 6 / 16, -6 / 16, 6 / 16],
		},
		grows: PlantGrowth.inPlace,
		stages: 7,
		drop: {
			max_items: 2,
			items: [
				{
					// Only drop if using a tool whose name is identical to one
					// of these.
					//rarity : 10,
					items: ["crafter_farming:wheat"],
					// Whether all items in the dropped item list inherit the
					// hardware coloring palette color from the dug node.
					// Default is 'false'.
					//inherit_color : true,
				},
				{
					// Only drop if using a tool whose name is identical to one
					// of these.
					rarity: 2,
					items: ["crafter_farming:wheat_seeds"],
					// Whether all items in the dropped item list inherit the
					// hardware coloring palette color from the dug node.
					// Default is 'false'.
					//inherit_color : true,
				},
			],
		},

		// Seed definition.
		// "crafter_farming:wheat_1"
		seed_name: "wheat",
		seed_description: "Wheat Seeds",
		seed_inventory_image: "wheat_seeds.png",
		seed_plants: "crafter_farming:wheat_1",
	});

	farming.register_plant("melon_stem", {
		description: "Melon Stem",
		drawtype: Drawtype.plantlike,
		waving: 1,
		walkable: false,
		climbable: false,
		paramtype: ParamType1.light,
		sunlight_propagates: true,
		tiles: ["melon_stage"], //automatically adds _X.png
		buildable_to: false,
		groups: {
			leaves: 1,
			plant: 1,
			stem: 1,
			axe: 1,
			hand: 0,
			dig_immediate: 1,
			attached_node: 1,
			crops: 1,
		},
		sounds: crafter.grassSound(),
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-6 / 16, -0.5, -6 / 16, 6 / 16, -6 / 16, 6 / 16],
		},
		grows: PlantGrowth.inPlaceYields,
		grownNode: "crafter_farming:melon",
		stages: 7,
		//stem stage complete definition (fully grown and budding)
		stem_description: "",
		stem_tiles: [
			"nothing.png",
			"nothing.png",
			"melon_stage_complete.png^[transformFX",
			"melon_stage_complete.png",
			"nothing.png",
			"nothing.png",
		],
		stem_drawtype: Drawtype.nodebox,
		stem_walkable: false,
		stem_sunlight_propagates: true,
		stem_paramtype: ParamType1.light,
		stem_node_box: {
			type: Nodeboxtype.fixed,
			fixed: [[-0 / 16, -8 / 16, -7 / 16, 0 / 16, 8 / 16, 7 / 16]],
		},
		stem_selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-6 / 16, -0.5, -6 / 16, 6 / 16, -6 / 16, 6 / 16],
		},
		stem_drop: {
			max_items: 2,
			items: [
				{
					items: ["crafter_farming:melon_seeds"],
				},
				{
					rarity: 2,
					items: ["crafter_farming:melon_seeds"],
				},
			],
		},
		stem_groups: { plant: 1, dig_immediate: 1, attached_node: 1, crops: 1 },
		stem_sounds: crafter.woodSound(),

		//fruit definition (what the stem creates)
		fruit_name: "melon",
		fruit_description: "Melon",
		fruit_tiles: [
			"melon_top.png",
			"melon_top.png",
			"melon_side.png",
			"melon_side.png",
			"melon_side.png",
			"melon_side.png",
		],
		fruit_groups: { pathable: 1, wood: 1, flammable: 1 },
		fruit_sounds: crafter.woodSound(),
		fruit_drop: {
			max_items: 6,
			items: [
				{
					items: ["crafter_farming:melon_slice"],
				},
				{
					items: ["crafter_farming:melon_slice"],
				},
				{
					items: ["crafter_farming:melon_slice"],
				},
				{
					items: ["crafter_farming:melon_slice"],
				},
				{
					rarity: 5,
					items: ["crafter_farming:melon_slice"],
				},
				{
					rarity: 15,
					items: ["crafter_farming:melon_seeds"],
				},
			],
		},

		//seed definition
		//"crafter_farming:wheat_1"
		seed_name: "melon",
		seed_description: "Melon Seeds",
		seed_inventory_image: "melon_seeds.png",
		seed_plants: "crafter_farming:melon_stem_1",
	});

	hunger.register_food("crafter_farming:melon_slice", {
		description: "Melon Slice",
		texture: "melon_slice.png",
		satiation: 1,
		hunger: 1,
	});

	farming.register_plant("pumpkin_stem", {
		description: "Pumpkin Stem",
		drawtype: Drawtype.plantlike,
		waving: 1,
		walkable: false,
		climbable: false,
		paramtype: ParamType1.light,
		sunlight_propagates: true,
		tiles: ["melon_stage"], //automatically adds _X.png
		buildable_to: false,
		groups: {
			leaves: 1,
			plant: 1,
			stem: 1,
			axe: 1,
			hand: 0,
			dig_immediate: 1,
			attached_node: 1,
			crops: 1,
		},
		sounds: crafter.grassSound(),
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-6 / 16, -0.5, -6 / 16, 6 / 16, -6 / 16, 6 / 16],
		},
		grows: PlantGrowth.inPlaceYields,
		grownNode: "crafter_farming:pumpkin",
		stages: 7,

		//stem stage complete definition (fully grown and budding)
		stem_description: "",
		stem_tiles: [
			"nothing.png",
			"nothing.png",
			"melon_stage_complete.png^[transformFX",
			"melon_stage_complete.png",
			"nothing.png",
			"nothing.png",
		],
		stem_drawtype: Drawtype.nodebox,
		stem_walkable: false,
		stem_sunlight_propagates: true,
		stem_paramtype: ParamType1.light,
		stem_node_box: {
			type: Nodeboxtype.fixed,
			fixed: [[-0 / 16, -8 / 16, -7 / 16, 0 / 16, 8 / 16, 7 / 16]],
		},
		stem_selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [-6 / 16, -0.5, -6 / 16, 6 / 16, -6 / 16, 6 / 16],
		},
		stem_drop: {
			max_items: 2,
			items: [
				{
					items: ["crafter_farming:pumpkin_seeds"],
				},
				{
					rarity: 2,
					items: ["crafter_farming:pumpkin_seeds"],
				},
			],
		},
		stem_groups: { plant: 1, dig_immediate: 1, attached_node: 1, crops: 1 },
		stem_sounds: crafter.woodSound(),

		//fruit definition (what the stem creates)
		fruit_name: "pumpkin",
		fruit_description: "Pumpkin",
		fruit_tiles: [
			"pumpkin_top.png",
			"pumpkin_top.png",
			"pumpkin_side.png",
			"pumpkin_side.png",
			"pumpkin_side.png",
			"pumpkin_side.png",
		],
		fruit_groups: { pathable: 1, wood: 1, flammable: 1 },
		fruit_sounds: crafter.woodSound(),
		//seed definition
		//"crafter_farming:wheat_1"
		seed_name: "pumpkin",
		seed_description: "Pumpkin Seeds",
		seed_inventory_image: "pumpkin_seeds.png",
		seed_plants: "crafter_farming:pumpkin_stem_1",
	});

	core.register_craft({
		type: CraftRecipeType.shapeless,
		output: "crafter_farming:pumpkin_seeds",
		recipe: ["crafter_farming:pumpkin"],
	});

	core.register_craft({
		type: CraftRecipeType.fuel,
		recipe: "crafter_farming:pumpkin",
		burntime: 3,
	});

	core.register_craft({
		type: CraftRecipeType.cooking,
		output: "crafter_farming:pumpkin_pie",
		recipe: "crafter_farming:pumpkin",
		cooktime: 2,
	});

	hunger.register_food("crafter_farming:pumpkin_pie", {
		description: "Pumpkin Pie",
		texture: "pumpkin_pie.png",
		satiation: 6,
		hunger: 3,
	});

	core.register_decoration({
		name: "crafter_farming:sugarcane",
		deco_type: DecorationType.simple,
		place_on: ["crafter:dirt", "crafter:grass", "crafter:sand"],
		sidelen: 16,
		noise_params: {
			offset: -0.3,
			scale: 0.7,
			spread: vector.create3d({ x: 100, y: 100, z: 100 }),
			seed: 354,
			octaves: 3,
			persist: 0.7,
		},
		y_max: 1,
		y_min: 1,
		decoration: "crafter_farming:sugarcane",
		height: 2,
		height_max: 5,
		spawn_by: "crafter:water",
		num_spawn_by: 1,
	});

	core.register_decoration({
		name: "crafter_farming:cactus",
		deco_type: DecorationType.simple,
		place_on: ["crafter:sand"],
		sidelen: 16,
		noise_params: {
			offset: -0.012,
			scale: 0.024,
			spread: vector.create3d({ x: 100, y: 100, z: 100 }),
			seed: 230,
			octaves: 3,
			persist: 0.6,
		},
		y_max: 30,
		y_min: 0,
		decoration: "crafter_farming:cactus",
		height: 3,
		height_max: 4,
	});

	core.register_decoration({
		name: "crafter_farming:grass",
		deco_type: DecorationType.simple,
		place_on: "crafter:grass",
		sidelen: 16,
		fill_ratio: 0.5,
		param2: 0,
		param2_max: 179,
		//biomes : {"grassland"},
		decoration: "crafter_farming:grass",
		height: 1,
	});
}
