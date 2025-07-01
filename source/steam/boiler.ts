namespace steam {
	const timerStart = kickOnSteamNodeTimer;

	core.register_node("crafter_steam:boiler", {
		drawtype: Drawtype.mesh,
		mesh: "steam_boiler.gltf",
		tiles: ["steam_boiler.png"],
		paramtype2: ParamType2["4dir"],
		groups: { stone: 1, pathable: 1, steam: 1 },
		sounds: crafter.stoneSound(),

		on_construct(position) {
			timerStart(position);
		},
	});
}
