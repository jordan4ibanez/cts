namespace vignette {
	core.register_on_joinplayer((player: ObjectRef) => {
		hudManager.add_hud(player, "vignette", {
			type: HudElementType.image,
			position: { x: 0.5, y: 0.5 },
			scale: {
				x: -100.5,
				y: -100.5,
			},
			z_index: -400,
			text: "vignette.png",
		});
	});
}
