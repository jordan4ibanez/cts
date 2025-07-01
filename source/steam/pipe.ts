namespace steam {
	//? Steam pipes.
	const pixel: number = 1 / 16;
	/** Pipe End. */
	const pE: number = pixel * 7;
	/** Pipe Diameter. */
	const pD: number = pixel;
	/** Pipe Length. */
	const pL: number = pD * 8;
	/** Flange Start. */
	const fS: number = pE;
	/** Flange Diameter. */
	const fD: number = pD * 2;

	core.register_node("crafter_steam:pipe", {
		connects_to: ["group:steam"],
		tiles: ["steam_pipe.png"],
		sounds: crafter.stoneSound(),
		groups: { stone: 1, pathable: 1, steam: 1 },
		drawtype: Drawtype.nodebox,
		paramtype: ParamType1.light,
		sunlight_propagates: true,
		wield_image: "steam_pipe_item.png",
		inventory_image: "steam_pipe_item.png",

		collision_box: {
			type: Nodeboxtype.connected,
			disconnected: [-fD, -fD, -fD, fD, fD, fD],
			// +Z.
			connect_back: [-fD, -fD, -fD, fD, fD, pL],
			// -Z.
			connect_front: [-fD, -fD, -pL, fD, fD, fD],
			// +X.
			connect_right: [-fD, -fD, -fD, pL, fD, fD],
			// -X.
			connect_left: [-pL, -fD, -fD, fD, fD, fD],
			// -Y.
			connect_bottom: [-fD, -pL, -fD, fD, fD, fD],
			// +Y.
			connect_top: [-fD, -fD, -fD, fD, pL, fD],
		},

		selection_box: {
			type: Nodeboxtype.connected,
			disconnected: [-fD, -fD, -fD, fD, fD, fD],
			// +Z.
			connect_back: [-fD, -fD, -fD, fD, fD, pL],
			// -Z.
			connect_front: [-fD, -fD, -pL, fD, fD, fD],
			// +X.
			connect_right: [-fD, -fD, -fD, pL, fD, fD],
			// -X.
			connect_left: [-pL, -fD, -fD, fD, fD, fD],
			// -Y.
			connect_bottom: [-fD, -pL, -fD, fD, fD, fD],
			// +Y.
			connect_top: [-fD, -fD, -fD, fD, pL, fD],
		},

		node_box: {
			type: Nodeboxtype.connected,
			disconnected: [-pD, -pD, -pD, pD, pD, pD],
			// +Z.
			connect_back: [
				// Pipe.
				[-pD, -pD, -pD, pD, pD, pE],
				// Flange.
				[pD, -pD, fS, fD, pD, pL],
				[-fD, -pD, fS, -pD, pD, pL],
				[-fD, pD, fS, fD, fD, pL],
				[-fD, -fD, fS, fD, -pD, pL],
			],
			// -Z.
			connect_front: [
				// Pipe.
				[-pD, -pD, -pE, pD, pD, pD],
				// Flange.
				[pD, -pD, -pL, fD, pD, -fS],
				[-fD, -pD, -pL, -pD, pD, -fS],
				[-fD, pD, -pL, fD, fD, -fS],
				[-fD, -fD, -pL, fD, -pD, -fS],
			],
			// +X.
			connect_right: [
				// Pipe.
				[-pD, -pD, -pD, pE, pD, pD],
				// Flange.
				[pL, -pD, pD, fS, pD, fD],
				[pL, -pD, -fD, fS, pD, -pD],
				[pL, pD, -fD, fS, fD, fD],
				[pL, -pD, -fD, fS, -fD, fD],
			],
			// -X.
			connect_left: [
				// Pipe.
				[-pE, -pD, -pD, pD, pD, pD],
				// Flange.
				[-pE, -pD, pD, -pL, pD, fD],
				[-pE, -pD, -fD, -pL, pD, -pD],
				[-pE, pD, -fD, -pL, fD, fD],
				[-pE, -pD, -fD, -pL, -fD, fD],
			],
			// -Y.
			connect_bottom: [
				// Pipe.
				[-pD, -pE, -pD, pD, pD, pD],
				// Flange.
				[-fD, -pL, -pD, -pD, -pE, pD],
				[pD, -pL, -pD, fD, -pE, pD],
				[-fD, -pL, -fD, fD, -pE, -pD],
				[-fD, -pL, pD, fD, -pE, fD],
			],
			// +Y.
			connect_top: [
				// Pipe.
				[-pD, -pD, -pD, pD, pE, pD],
				// Flange.
				[-fD, pE, -pD, -pD, pL, pD],
				[pD, pE, -pD, fD, pL, pD],
				[-fD, pE, -fD, fD, pL, -pD],
				[-fD, pE, pD, fD, pL, fD],
			],
		},
	});
}
