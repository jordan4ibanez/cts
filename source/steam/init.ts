namespace steam {
	//? Stationary steam engine.

	class SteamEngine extends types.Entity {
		name: string = "crafter_steam:engine";

		initial_properties: ObjectProperties = {
			visual: EntityVisual.mesh,
			mesh: "steam_engine.gltf",
			visual_size: { x: 1, y: 1 },
			textures: [
				"steam_engine_base.png",
				"steam_engine_steam_inlet.png",
				"steam_engine_connecting_rod.png",
				"steam_engine_flywheel_spokes.png",
				"steam_engine_flywheel.png",
				"steam_engine_piston.png",
			],
		};

		on_activate(staticData: string, delta: number): void {
			const pos = vector.floor(this.object.get_pos());
			pos.y += 0.5;
			this.object.set_pos(pos);
			this.object.set_animation({ x: 0, y: 1 }, 1, 0, true);
		}

		// on_punch(
		// 	puncher: ObjectRef | null,
		// 	timeFromLastPunch: number | null,
		// 	toolCapabilities: ToolCapabilities | null,
		// 	dir: Vec3 | null,
		// 	damage: number
		// ): void {
		// 	const newSpeed = math.random(0, 3) + math.random();
		// 	core.chat_send_all(tostring(newSpeed));

		// 	this.object.set_animation_frame_speed(newSpeed)
		// 	// this.object.set_animation({ x: 0, y: 1 }, newSpeed, 0, true);
		// }
	}
	utility.registerTSEntity(SteamEngine);

	//? Boiler.

	core.register_node("crafter_steam:boiler", {
		drawtype: Drawtype.mesh,
		mesh: "steam_boiler.gltf",
		tiles: ["steam_boiler.png"],
		paramtype2: ParamType2["4dir"],
		groups: { stone: 1, pathable: 1, steam: 1 },
		sounds: crafter.stoneSound(),
	});

	//? Firebox.

	const states = ["open", "closed"];
	for (const index of $range(0, 1)) {
		const currentState = states[index];
		core.register_node("crafter_steam:firebox_" + currentState, {
			drawtype: Drawtype.mesh,
			use_texture_alpha: TextureAlpha.clip,
			mesh: `steam_firebox_${currentState}.gltf`,
			tiles: ["steam_firebox.png", "steam_firebox_doors.png"],
			paramtype2: ParamType2["4dir"],
			groups: { stone: 1, pathable: 1, steam: 1 },
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

	//? Steam pipes.
	const pixel: number = 1 / 16;
	/** Pipe Diameter. */
	const pD: number = pixel;
	/** Flange Diameter */
	const fD: number = pD * 2;

	core.register_node("crafter_steam:pipe", {
		connects_to: ["group:steam"],
		tiles: ["stone.png"],
		sounds: crafter.stoneSound(),
		groups: { stone: 1, pathable: 1, steam: 1 },
		drawtype: Drawtype.nodebox,
		paramtype: ParamType1.light,
		sunlight_propagates: true,
		node_box: {
			type: Nodeboxtype.connected,
			fixed: [-pD, -pD, -pD, pD, pD, pD],

			connect_back: [
				// Pipe.
				[-pD, -pD, -pD, pD, pD, pD * 8],
				// Flange right X axis.
				[pD, -pD, pD * 7, fD, pD, pD * 8],
				// Flange left X axis.
				[-fD, -pD, pD * 7, -pD, pD, pD * 8],
				// Flange top.
				[-fD, pD, pD * 7, fD, fD, pD * 8],
				// Flange bottom.
				[-fD, -fD, pD * 7, fD, -pD, pD * 8],
			],
			// connect_left: [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5],
		},
	});
}
