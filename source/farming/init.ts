namespace farming {
	utility.loadFiles(["plant_api", "registers", "tools", "soil"]);

	core.register_craftitem("crafter_farming:wheat", {
		description: "Wheat",
		inventory_image: "wheat_harvested.png",
	});

    // Todo: depends on the crafter hunger mod.
	// farming.register_food("crafter_farming:bread", {
	// 	description: "Bread",
	// 	texture: "bread.png",
	// 	satiation: 6,
	// 	hunger: 2,
	// });
	// farming.register_food("crafter_farming:toast", {
	// 	description: "Toast",
	// 	texture: "bread.png^[colorize:black:100",
	// 	satiation: 12,
	// 	hunger: 4,
	// });

	core.register_craft({
		output: "crafter_farming:bread",
		recipe: [["crafter_farming:wheat", "crafter_farming:wheat", "crafter_farming:wheat"]],
	});
	core.register_craft({
		type: CraftRecipeType.cooking,
		output: "crafter_farming:toast",
		recipe: "crafter_farming:bread",
		cooktime: 3,
	});
}
