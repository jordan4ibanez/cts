namespace hopper {
	core.register_craft({
		output: "crafter_hopper:hopper",
		recipe: [
			["crafter:iron", "crafter_chest:chest", "crafter:iron"],
			["", "crafter:iron", ""],
		],
	});

	core.register_craft({
		output: "crafter_hopper:chute",
		recipe: [["crafter:iron", "crafter_chest:chest", "crafter:iron"]],
	});

	core.register_craft({
		output: "crafter_hopper:sorter",
		recipe: [
			["", "crafter:gold", ""],
			["crafter:iron", "crafter_chest:chest", "crafter:iron"],
			["", "crafter:iron", ""],
		],
	});
}
