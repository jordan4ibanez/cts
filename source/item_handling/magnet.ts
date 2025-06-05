// local minetest,math,vector,ipairs = minetest,math,vector,ipairs

namespace item_handling {
	const pool = new Map<string, number>();

	core.register_on_joinplayer((player: ObjectRef) => {
		pool.set(player.get_player_name(), 0);
	});

	core.register_on_leaveplayer((player: ObjectRef) => {
		pool.delete(player.get_player_name());
	});

	// The item collection magnet.
	let tick: boolean = false;

	function magnet(player: ObjectRef): void {
		// Don't magnetize to dead players.
		const name: string = player.get_player_name();
		if (player.get_hp() <= 0) {
			pool.set(name, 0);
			return;
		}

		const pos: Vec3 = player.get_pos();
		const inv: InvRef = player.get_inventory();

		let curVal = pool.get(name);
		if (curVal == null) {
			throw new Error("what");
		}

		if (tick == true && curVal > 0) {
			core.sound_play("pickup", {
				to_player: player.get_player_name(),
				gain: 0.4,
				pitch: math.random(60, 100) / 100,
			});
			if (curVal > 6) {
				curVal = 6;
				pool.set(name, curVal);
			} else {
				curVal -= 1;
				pool.set(name, curVal);
			}
		}

		// Radial detection.
		for (const [_, object] of ipairs(
			core.get_objects_inside_radius(
				vector.create3d({ x: pos.x, y: pos.y + 0.5, z: pos.z }),
				2
			)
		)) {
			if (object.is_player()) {
				continue;
			}
			let __entity: LuaEntity | null = object.get_luaentity();
			if (
				__entity == null ||
				(__entity.name != "__builtin:item" &&
					__entity.name != "crafter_experience:orb")
			) {
				continue;
			}

			const entity: CrafterItemEntity = __entity as CrafterItemEntity;

			if (
				entity.name == "__builtin:item" &&
				entity.collectable == true &&
				entity.collected == false
			) {
				const pos2: Vec3 = object.get_pos();
				const diff: number = vector.subtract(pos2, pos).y;
				if (diff >= 0 && inv.room_for_item("main", entity.itemstring)) {
					curVal += 1;
					pool.set(name, curVal);

					inv.add_item("main", entity.itemstring);
					entity.collector = player.get_player_name();
					entity.collected = true;
					entity.trigger_collection_calculation();
				}
			} else if (entity.name == "crafter_experience:orb") {
				print("collected??");
				entity.collector = player.get_player_name();
				entity.collected = true;
			}
		}
	}

	core.register_globalstep((delta: number) => {
		tick = !tick;
		for (const [_, player] of ipairs(core.get_connected_players())) {
			magnet(player);
		}
	});
}
