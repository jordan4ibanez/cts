namespace sign {
	sign.register_sign("crafter_sign:sign", {
		description: "Sign",
		inventory_image: "signs_lib_sign_wall_wooden_inv.png",
		tiles: [
			"signs_lib_sign_wall_wooden.png",
			"signs_lib_sign_wall_wooden_edges.png",
			// items 3 - 5 are not set, so signs_lib will use its standard pole
			// mount, hanging, and yard sign stick textures.
		],
		// allow_hanging = true,
		// allow_widefont = true,
		// allow_onpole = true,
		// allow_onpole_horizontal = true,
		// allow_yard = true
	});

	core.register_craft({
		output: "sign:sign 3",
		recipe: [
			["crafter:wood", "crafter:wood", "crafter:wood"],
			["crafter:wood", "crafter:wood", "crafter:wood"],
			["", "crafter:stick", ""],
		],
	});
}
