namespace workbench {
	core.register_node("crafter_workbench:workbench", {
		description: "Workbench",
		tiles: [
			"crafting_workbench_top.png",
			"wood.png",
			"crafting_workbench_side.png",
			"crafting_workbench_side.png",
			"crafting_workbench_front.png",
			"crafting_workbench_front.png",
		],
		groups: { wood: 1, hard: 1, axe: 1, hand: 3, pathable: 1 },
		sounds: crafter.woodSound(),
	});

	core.register_craft({
		output: "crafter_workbench:workbench",
		recipe: [
			["main:wood", "main:wood"],
			["main:wood", "main:wood"],
		],
	});
}
