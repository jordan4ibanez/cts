namespace playerMechanics {
	// todo: make this it's own mod, this is not a mechanic?

	core.register_on_joinplayer((player: ObjectRef) => {
		const offset: Vec2 = {
			x: -146,
			y: 20,
		};
		const version: string = "Crafter Alpha v0.0.8";
		// Add in version info.
		player.hud_add({
			type: HudElementType.text,
			position: { x: 1, y: 0 },
			name: "versionbg",
			text: version,
			number: 0x000000,
			offset: { x: offset.x + 2, y: offset.y + 2 },
			size: { x: 2, y: 2 },
			z_index: 0,
		});
		player.hud_add({
			type: HudElementType.text,
			position: { x: 1, y: 0 },
			name: "versionfg",
			text: version,
			number: 0xffffff,
			offset: offset,
			size: { x: 2, y: 2 },
			z_index: 0,
		});
	});
}
