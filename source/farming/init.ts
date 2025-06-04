namespace farming {
	utility.loadFiles(["plant_api", "registers", "tools", "soil"]);

	// minetest.register_craftitem("farming:wheat", {
	// 	description = "Wheat",
	// 	inventory_image = "wheat_harvested.png",
	// })
	// minetest.register_food("farming:bread",{
	// 	description = "Bread",
	// 	texture = "bread.png",
	// 	satiation=6,
	// 	hunger=2,
	// })
	// minetest.register_food("farming:toast",{
	// 	description = "Toast",
	// 	texture = "bread.png^[colorize:black:100",
	// 	satiation=12,
	// 	hunger=4,
	// })
	// minetest.register_craft({
	// 	output = "farming:bread",
	// 	recipe = {
	// 		{"farming:wheat", "farming:wheat", "farming:wheat"}
	// 	}
	// })
	// minetest.register_craft({
	// 	type = "cooking",
	// 	output = "farming:toast",
	// 	recipe = "farming:bread",
	// 	cooktime = 3,
	// })
}
