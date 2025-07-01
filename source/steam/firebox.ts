namespace steam {
	const states = ["open", "closed"];
	for (const index of $range(0, 1)) {
		const currentState = states[index];
		core.register_node("crafter_steam:firebox_" + currentState, {
			drawtype: Drawtype.mesh,
			use_texture_alpha: TextureAlpha.clip,
			mesh: `steam_firebox_${currentState}.gltf`,
			tiles: ["steam_firebox.png", "steam_firebox_doors.png"],
			paramtype2: ParamType2["4dir"],
			groups: { stone: 1, pathable: 1 },
			sounds: crafter.stoneSound(),

			on_rightclick(position, node, clicker, itemStack, pointedThing) {
				const newIndex = (index + 1) % 2;
				const newState = states[newIndex];
				core.swap_node(position, {
					name: "crafter_steam:firebox_" + newState,
					param2: node.param2,
				});
				core.sound_play("steam_boiler_door", {
					pos: pointedThing.under!,
					pitch: (math.random(80, 99) + math.random()) / 100,
				});
			},
		});
	}
}
