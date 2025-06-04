namespace farming {
	utility.loadFiles(["plant_api", "registers", "tools", "soil"]);

	core.register_craftitem("farming:wheat", {
		description: "Wheat",
		inventory_image: "wheat_harvested.png",
	});

    // Todo: depends on farming.
	// farming.register_food("farming:bread", {
	// 	description: "Bread",
	// 	texture: "bread.png",
	// 	satiation: 6,
	// 	hunger: 2,
	// });
	// farming.register_food("farming:toast", {
	// 	description: "Toast",
	// 	texture: "bread.png^[colorize:black:100",
	// 	satiation: 12,
	// 	hunger: 4,
	// });

	core.register_craft({
		output: "farming:bread",
		recipe: [["farming:wheat", "farming:wheat", "farming:wheat"]],
	});
	core.register_craft({
		type: CraftRecipeType.cooking,
		output: "farming:toast",
		recipe: "farming:bread",
		cooktime: 3,
	});
}
