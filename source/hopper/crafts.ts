namespace hopper {
	core.register_craft({
		output: "crafter_hopper:hopper",
		recipe: [
			["crafter:iron", "utility:chest", "crafter:iron"],
			["", "crafter:iron", ""],
		],
	});

	core.register_craft({
		output: "crafter_hopper:chute",
		recipe: [["crafter:iron", "utility:chest", "crafter:iron"]],
	});

	core.register_craft({
		output: "crafter_hopper:sorter",
		recipe: [
			["", "crafter:gold", ""],
			["crafter:iron", "utility:chest", "crafter:iron"],
			["", "crafter:iron", ""],
		],
	});
}
