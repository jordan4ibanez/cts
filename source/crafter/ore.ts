namespace crafter{
// depth : initial level found

// Dirt
core.register_ore({
	ore_type: OreType.blob,
	ore: "crafter:dirt",
	wherein: ["crafter:stone"],
	clust_scarcity: 16 * 16 * 16,
	clust_size: 5,
	y_max: 31000,
	y_min: -31,
	noise_threshold: 0.0,
	noise_params: {
		offset: 0.5,
		scale: 0.2,
		spread: vector.create3d({ x: 5, y: 5, z: 5 }),
		seed: 17676,
		octaves: 1,
		persist: 0.0,
	},
});

// Gravel
core.register_ore({
	ore_type: OreType.blob,
	ore: "crafter:gravel",
	wherein: ["crafter:stone"],
	clust_scarcity: 16 * 16 * 16,
	clust_size: 5,
	y_max: 31000,
	y_min: -31000,
	noise_threshold: 0.0,
	noise_params: {
		offset: 0.5,
		scale: 0.2,
		spread: vector.create3d({ x: 5, y: 5, z: 5 }),
		seed: 766,
		octaves: 1,
		persist: 0.0,
	},
});

core.register_ore({
	ore_type: OreType.blob,
	ore: "crafter:lava",
	wherein: ["crafter:stone"],
	clust_scarcity: 48 * 48 * 48,
	clust_size: 15,
	y_max: -128,
	y_min: -10032,
	noise_threshold: 0.0,
	noise_params: {
		offset: 0.5,
		scale: 0.2,
		spread: vector.create3d({ x: 5, y: 5, z: 5 }),
		seed: 766,
		octaves: 1,
		persist: 0.0,
	},
});

// Scatter ores

// Coal
core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:coalore",
	wherein: "crafter:stone",
	clust_scarcity: 8 * 8 * 8,
	clust_num_ores: 9,
	clust_size: 3,
	y_max: 31000,
	y_min: 1025,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:coalore",
	wherein: "crafter:stone",
	clust_scarcity: 8 * 8 * 8,
	clust_num_ores: 8,
	clust_size: 3,
	y_max: 64,
	y_min: -127,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:coalore",
	wherein: "crafter:stone",
	clust_scarcity: 12 * 12 * 12,
	clust_num_ores: 30,
	clust_size: 5,
	y_max: -128,
	y_min: -10032,
});

// Iron

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:ironore",
	wherein: "crafter:stone",
	clust_scarcity: 9 * 9 * 9,
	clust_num_ores: 12,
	clust_size: 3,
	y_max: 31000,
	y_min: 1025,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:ironore",
	wherein: "crafter:stone",
	clust_scarcity: 7 * 7 * 7,
	clust_num_ores: 5,
	clust_size: 3,
	y_max: 64,
	y_min: -127,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:ironore",
	wherein: "crafter:stone",
	clust_scarcity: 7 * 7 * 7,
	clust_num_ores: 5,
	clust_size: 3,
	y_max: -128,
	y_min: -255,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:lapisore",
	wherein: "crafter:stone",
	clust_scarcity: 15 * 15 * 15,
	clust_num_ores: 3,
	clust_size: 2,
	y_max: -128,
	y_min: -10032,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:ironore",
	wherein: "crafter:stone",
	clust_scarcity: 12 * 12 * 12,
	clust_num_ores: 29,
	clust_size: 5,
	y_max: -128,
	y_min: -10032,
});

// Gold

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:goldore",
	wherein: "crafter:stone",
	clust_scarcity: 13 * 13 * 13,
	clust_num_ores: 5,
	clust_size: 3,
	y_max: 31000,
	y_min: 1025,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:goldore",
	wherein: "crafter:stone",
	clust_scarcity: 15 * 15 * 15,
	clust_num_ores: 3,
	clust_size: 2,
	y_max: -128,
	y_min: -511,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:goldore",
	wherein: "crafter:stone",
	clust_scarcity: 13 * 13 * 13,
	clust_num_ores: 5,
	clust_size: 3,
	y_max: -128,
	y_min: -10032,
});

// Diamond

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:diamondore",
	wherein: "crafter:stone",
	clust_scarcity: 14 * 14 * 14,
	clust_num_ores: 5,
	clust_size: 3,
	y_max: 31000,
	y_min: 1025,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:diamondore",
	wherein: "crafter:stone",
	clust_scarcity: 18 * 18 * 18,
	clust_num_ores: 3,
	clust_size: 2,
	y_max: -128,
	y_min: -1023,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:diamondore",
	wherein: "crafter:stone",
	clust_scarcity: 14 * 14 * 14,
	clust_num_ores: 5,
	clust_size: 3,
	y_max: -128,
	y_min: -10032,
});

// Diamond

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:diamondore",
	wherein: "crafter:stone",
	clust_scarcity: 15 * 15 * 15,
	clust_num_ores: 4,
	clust_size: 3,
	y_max: 31000,
	y_min: 1025,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:diamondore",
	wherein: "crafter:stone",
	clust_scarcity: 17 * 17 * 17,
	clust_num_ores: 4,
	clust_size: 3,
	y_max: -256,
	y_min: -2047,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:diamondore",
	wherein: "crafter:stone",
	clust_scarcity: 15 * 15 * 15,
	clust_num_ores: 4,
	clust_size: 3,
	y_max: -256,
	y_min: -10032,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:emeraldore",
	wherein: "crafter:stone",
	clust_scarcity: 17 * 17 * 17,
	clust_num_ores: 4,
	clust_size: 3,
	y_max: -1024,
	y_min: -10032,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:sapphireore",
	wherein: "crafter:stone",
	clust_scarcity: 17 * 17 * 17,
	clust_num_ores: 4,
	clust_size: 3,
	y_max: -3096,
	y_min: -10032,
});

core.register_ore({
	ore_type: OreType.scatter,
	ore: "crafter:rubyore",
	wherein: "crafter:stone",
	clust_scarcity: 17 * 17 * 17,
	clust_num_ores: 4,
	clust_size: 3,
	y_max: -5012,
	y_min: -10032,
});
}