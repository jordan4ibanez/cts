namespace vignette {
	core.register_on_joinplayer((player: ObjectRef) => {
		// for (let i = 0; i < 100; i++) {
		// 	print(i);
		print("hi hi hi ");
		print(HudElementType.image);
		hudManager.add_hud(
			player,
			"vignette",

			{
				type: HudElementType.image,
				position: { x: 0.5, y: 0.5 },
				scale: {
					x: -100.5,
					y: -100.5,
				},
				z_index: -400,
				text: "vignette.png",
			}
		);
		// }
	});
}
