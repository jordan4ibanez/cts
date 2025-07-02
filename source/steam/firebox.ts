namespace steam {
	const timerStart = kickOnSteamNodeTimer;

	const fireboxEntities = new Map<number, ObjectRef>();

	class FireBoxFireEntity extends types.Entity {
		name: string = "crafter_steam:firebox_fire_entity";
	}
	utility.registerTSEntity(FireBoxFireEntity);

	function getOrCreateEntity(pos: Vec3): ObjectRef | null {
		const hash = core.hash_node_position(pos);
		let entity = fireboxEntities.get(hash) || null;

		if (entity == null) {
			entity = core.add_entity(pos, "crafter_steam:firebox_fire_entity");
			if (entity == null) {
				core.log(
					LogLevel.error,
					`Failed to add firebox entity at ${pos}`
				);
				return null;
			}
		}
		return entity;
	}

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

			on_timer(position, elapsed) {
				timerStart(position);
			},

			on_construct(position) {
				timerStart(position);
			},

			on_rightclick(position, node, clicker, itemStack, pointedThing) {
				if (itemStack.get_name() == "crafter:coal") {
					print("coal");
				} else {
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
				}
			},

			on_destruct(position) {
				const hash = core.hash_node_position(position);
				const entity = fireboxEntities.get(hash);
				if (entity != null) {
					entity.remove();
				}
				fireboxEntities.delete(hash);
			},
		});
	}
}
