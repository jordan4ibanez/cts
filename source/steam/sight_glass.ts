namespace steam {
	core.register_node("crafter_steam:sight_glass", {
		drawtype: Drawtype.mesh,
		tiles: ["steam_sight_glass.png", "steam_sight_glass_water_texture.png"],
		mesh: "steam_sight_glass.gltf",
		sounds: crafter.stoneSound(),
		groups: { stone: 2 },
		paramtype: ParamType1.light,
		paramtype2: ParamType2["4dir"],
		sunlight_propagates: true,
	});
}
