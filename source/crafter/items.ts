namespace crafter {
	// Item definition.

	hunger.register_food("crafter:apple", {
		description: "Apple",
		texture: "apple.png",
		satiation: 1,
		hunger: 2,
	});

	hunger.register_food("crafter:sugar", {
		description: "Sugar",
		texture: "sugar.png",
		satiation: 1,
		hunger: 1,
	});

	core.register_craftitem("crafter:stick", {
		description: "Stick",
		inventory_image: "stick.png",
		groups: { stick: 1 },
	});
	core.register_craftitem("crafter:paper", {
		description: "Paper",
		inventory_image: "paper.png",
		groups: { paper: 1 },
	});

	core.register_craftitem("crafter:coal", {
		description: "Coal",
		inventory_image: "coal.png",
		groups: { coal: 1 },
	});

	core.register_craftitem("crafter:charcoal", {
		description: "Charcoal",
		inventory_image: "charcoal.png",
		groups: { coal: 1 },
	});

	core.register_craftitem("crafter:iron", {
		description: "Iron",
		inventory_image: "iron.png",
	});

	core.register_craftitem("crafter:gold", {
		description: "Gold",
		inventory_image: "gold.png",
	});

	core.register_craftitem("crafter:diamond", {
		description: "Diamond",
		inventory_image: "diamond.png",
	});
	core.register_craftitem("crafter:flint", {
		description: "Flint",
		inventory_image: "flint.png",
	});

	core.register_craftitem("crafter:lapis", {
		description: "Lapis Lazuli",
		inventory_image: "lapis.png",
	});

	core.register_craftitem("crafter:emerald", {
		description: "Emerald",
		inventory_image: "emerald.png",
	});
	core.register_craftitem("crafter:sapphire", {
		description: "Sapphire",
		inventory_image: "sapphire.png",
	});
	core.register_craftitem("crafter:ruby", {
		description: "Ruby",
		inventory_image: "ruby.png",
	});
}
