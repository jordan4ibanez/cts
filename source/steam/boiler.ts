namespace steam {
	const timerStart = kickOnSteamNodeTimer;

	// PSI.
	const maxPressure = 300;

	class BoilerMeta extends utility.CrafterMeta {
		temperature: number = 0;
		/** Percentage. */
		waterLevel: number = 0;
		/** PSI. */
		pressure: number = 0;
	}

	core.register_node("crafter_steam:boiler", {
		drawtype: Drawtype.mesh,
		mesh: "steam_boiler.gltf",
		tiles: ["steam_boiler.png"],
		paramtype2: ParamType2["4dir"],
		groups: { stone: 1, pathable: 1, steam: 1 },
		sounds: crafter.stoneSound(),

		on_timer(position, elapsed) {
			timerStart(position);
		},
		on_construct(position) {
			timerStart(position);
		},
	});
}
