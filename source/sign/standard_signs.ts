namespace sign {
	sign.register_sign("crafter_sign:sign", {
		description: "Sign",
		inventory_image: "signs_lib_sign_wall_wooden_inv.png",
		wield_image: "signs_lib_sign_wall_wooden_inv.png",
		tiles: [
			"signs_lib_sign_wall_wooden.png",
			"signs_lib_sign_wall_wooden_edges.png",
			// items 3 - 5 are not set, so signs_lib will use its standard pole
			// mount, hanging, and yard sign stick textures.
		],
	});

	core.register_craft({
		output: "crafter_sign:sign_wall 3",
		recipe: [
			["crafter:wood", "crafter:wood", "crafter:wood"],
			["crafter:wood", "crafter:wood", "crafter:wood"],
			["", "crafter:stick", ""],
		],
	});
}
