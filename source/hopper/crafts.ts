namespace hopper {
	core.register_craft({
		output: "crafter_hopper:hopper",
		recipe: [
			["main:iron", "utility:chest", "main:iron"],
			["", "main:iron", ""],
		],
	});

	core.register_craft({
		output: "crafter_hopper:chute",
		recipe: [["main:iron", "utility:chest", "main:iron"]],
	});

	core.register_craft({
		output: "crafter_hopper:sorter",
		recipe: [
			["", "main:gold", ""],
			["main:iron", "utility:chest", "main:iron"],
			["", "main:iron", ""],
		],
	});
}
