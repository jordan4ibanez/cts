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

	core.register_node("crafter_steam:engine_logic_controller", {
		// drawtype: Drawtype.airlike,
		drawtype: Drawtype.normal,
		paramtype: ParamType1.light,
		sunlight_propagates: false,

		on_timer(position, elapsed) {},
	});

	core.register_node("crafter_steam:engine_item", {
		mesh: "steam_engine.gltf",
		drawtype: Drawtype.mesh,
		visual_scale: 0.5,
		paramtype2: ParamType2["4dir"],
		tiles: [
			"steam_engine_base.png",
			"steam_engine_steam_inlet.png",
			"steam_engine_connecting_rod.png",
			"steam_engine_flywheel_spokes.png",
			"steam_engine_flywheel.png",
			"steam_engine_piston.png",
		],
		node_dig_prediction: "",
		node_placement_prediction: "",
		on_place(itemStack, placer, pointedThing) {
			if (
				pointedThing.type != PointedThingType.node ||
				pointedThing.above == null ||
				pointedThing.under == null ||
				placer == null
			) {
				return;
			}

			// This is a 3 segment node, so things are a bit complicated.

			let currentPosTarget: Vec3;

			// Are we trying to place this thing above, or are we replacing what we're pointing at?
			{
				const aboveDef =
					core.registered_nodes[
						core.get_node(pointedThing.above).name
					];

				const underDef =
					core.registered_nodes[
						core.get_node(pointedThing.above).name
					];

				if (aboveDef == null || underDef == null) {
					return;
				}

				if (underDef.buildable_to) {
					currentPosTarget = pointedThing.under;
				} else if (aboveDef.buildable_to) {
					currentPosTarget = pointedThing.above;
				} else {
					// Can't build to nothing!
					return;
				}
			}

			// So first, bolt the look direction into 4 possible segments.
			const dir4 = core.dir_to_fourdir(placer.get_look_dir());

			// Next, transfer this into yaw.
			const yaw = core.dir_to_yaw(core.fourdir_to_dir(dir4));

			// The controller will always sit to the left, so, -90 degrees.
			const controllerDir = core.yaw_to_dir(yaw - math.pi / 2);

			//? Grease point 1 will sit at the current position.
			// This is just set like this to add clarity to what's going on.
			const greasePosition1 = currentPosTarget;

			//? Grease point 2 will sit to the right, so, 90 degrees.
			const greasePoint2 = core.yaw_to_dir(yaw + math.pi / 2);

			// core.place_node(pointedThing.above, {
			// 	name: "crafter_steam:engine_logic_controller",
			// });
		},
	});

	utility.loadFiles(["boiler", "firebox", "pipe"]);
}
