namespace vignette {
	core.register_on_joinplayer((player: ObjectRef) => {
		for (let i = 0; i < 10; i++) {
			print(i);
			hudManager.add_hud(
				player,
				"vignette",

				{
					hud_elem_type: HudElementType.image,
					position: { x: 0.5, y: 0.5 },
					scale: {
						x: -100.5,
						y: -100.5,
					},
					text: "vignette.png",
				}
			);
		}
	});
}
