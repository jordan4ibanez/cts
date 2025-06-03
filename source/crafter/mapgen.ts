namespace crafter{
core.register_alias("mapgen_stone", "crafter:stone");
core.register_alias("mapgen_dirt", "crafter:dirt");
core.register_alias("mapgen_dirt_with_grass", "crafter:grass");
core.register_alias("mapgen_water_source", "crafter:water");
core.register_alias("mapgen_river_water_source", "crafter:water");
core.register_alias("mapgen_sand", "crafter:sand");
core.register_alias("mapgen_tree", "crafter:tree");
core.register_alias("mapgen_leaves", "crafter:leaves");
core.register_alias("mapgen_apple", "crafter:leaves");

// core.register_biome({
// 		name : "greenhills",
// 		node_top : " main:grass",
// 		depth_top : 1,
// 		node_filler : "crafter:grass",
// 		depth_filler : 3,
// 		--node_riverbed : "default:sand",
// 		--depth_riverbed : 2,
// 		--node_dungeon : "default:cobble",
// 		--node_dungeon_alt : "default:mossycobble",
// 		--node_dungeon_stair : "stairs:stair_cobble",
// 		y_max : 31000,
// 		y_min : -31000,
// 		--heat_point : 50,
// 		--humidity_point : 35,
// 	})

core.register_biome({
	name: "grassland",
	node_top: "crafter:grass",
	depth_top: 1,
	node_filler: "crafter:dirt",
	depth_filler: 3,
	node_riverbed: "crafter:dirt",
	depth_riverbed: 2,
	node_dungeon: "crafter:cobble",
	node_dungeon_alt: "crafter:mossy_cobble",
	node_dungeon_stair: "stairs:mossy_cobble_stair",
	y_max: 256,
	y_min: 6,
	heat_point: 50,
	humidity_point: 35,
});

// core.register_biome({
// 		name : "snowland",
// 		node_dust : "weather:snow",
// 		node_top : "weather:snow_block",
// 		depth_top : 4,
// 		node_stone : "crafter:ice_mapgen",
// 		node_filler : "crafter:dirt",
// 		depth_filler : 0,
// 		node_riverbed : "crafter:sand",
// 		depth_riverbed : 2,
// 		node_dungeon : "crafter:cobble",
// 		node_dungeon_alt : "crafter:mossy_cobble",
// 		node_dungeon_stair : "stairs:mossy_cobble_stair",
// 		y_max : 31000,
// 		y_min : 4,
// 		heat_point : 25,
// 		humidity_point : 70,
// 	})

// core.register_biome({
// 		name : "snowcean",
// 		node_dust : "crafter:snow",
// 		node_top : "crafter:sand",
// 		depth_top : 1,
// 		node_stone : "crafter:ice_mapgen",
// 		node_filler : "crafter:sand",
// 		depth_filler : 3,
// 		node_riverbed : "crafter:sand",
// 		depth_riverbed : 2,
// 		node_cave_liquid : "crafter:water",
// 		node_dungeon : "crafter:cobble",
// 		node_dungeon_alt : "crafter:mossy_cobble",
// 		node_dungeon_stair : "crafter:mossy_cobble_stair",
// 		vertical_blend : 1,
// 		y_max : 3,
// 		y_min : -255,
// 		heat_point : 25,
// 		humidity_point : 70,
// 	})
// core.register_biome({
// 		name : "icesheet",
// 		node_dust : "weather:snow",
// 		node_top : "weather:snow_block",
// 		depth_top : 1,
// 		node_filler : "weather:snow_block",
// 		depth_filler : 3,
// 		node_stone : "crafter:ice_mapgen",
// 		node_water_top : "crafter:ice_mapgen",
// 		depth_water_top : 10,
// 		node_river_water : "crafter:ice_mapgen",
// 		node_riverbed : "crafter:gravel",
// 		depth_riverbed : 2,
// 		node_dungeon : "crafter:ice_mapgen",
// 		node_dungeon_stair : "stairs:glass_stair",
// 		y_max : 31000,
// 		y_min : -8,
// 		heat_point : 0,
// 		humidity_point : 73,
// })

core.register_biome({
	name: "sandDunes",
	node_top: "crafter:sand",
	depth_top: 1,
	node_filler: "crafter:sand",
	depth_filler: 2,
	node_riverbed: "crafter:sand",
	depth_riverbed: 2,
	node_dungeon: "crafter:cobble",
	node_dungeon_alt: "crafter:mossy_cobble",
	node_dungeon_stair: "stairs:mossy_cobble_stair",
	vertical_blend: 1,
	y_max: 5,
	y_min: 4,
	heat_point: 50,
	humidity_point: 35,
});

core.register_biome({
	name: "beach",
	node_top: "crafter:sand",
	depth_top: 1,
	node_filler: "crafter:sand",
	depth_filler: 3,
	node_riverbed: "crafter:sand",
	depth_riverbed: 2,
	node_cave_liquid: "crafter:water",
	node_dungeon: "crafter:cobble",
	node_dungeon_alt: "crafter:mossy_cobble",
	node_dungeon_stair: "stairs:mossy_cobble_stair",
	y_max: 3,
	y_min: -255,
	heat_point: 50,
	humidity_point: 35,
});

// core.register_decoration({
// 	name : "crafter:tree",
// 	deco_type : "simple",
// 	place_on : {"crafter:grass"},
// 	sidelen : 16,
// 	fill_ratio : 0.005,
// 	biomes : {"grassland"},
// 	y_max : 31000,
// 	y_min : 0,
// 	--schematic : treeSchematic,
// 	--flags : "place_center_x, place_center_z, force_placement",
// 	--rotation : "random",
// 	decoration : "crafter:tree",
// 	height : 4,
// 	height_max : 6,
// })

core.register_decoration({
	name: "crafter:tree_big",
	deco_type: DecorationType.schematic,
	place_on: ["crafter:grass"],
	sidelen: 16,
	fill_ratio: 0.0025,
	biomes: ["grassland"],
	y_max: 31000,
	y_min: 0,
	schematic: crafter.tree_big,
	flags: "place_center_x, place_center_z",
	rotation: "random",
	place_offset_y: 1,
});

core.register_decoration({
	name: "crafter:tree_small",
	deco_type: DecorationType.schematic,
	place_on: ["crafter:grass"],
	sidelen: 16,
	fill_ratio: 0.0025,
	biomes: ["grassland"],
	y_max: 31000,
	y_min: 0,
	schematic: crafter.tree_small,
	flags: "place_center_x, place_center_z",
	rotation: "random",
	place_offset_y: 1,
});
}