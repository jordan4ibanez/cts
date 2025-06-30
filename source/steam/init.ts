namespace steam {
	class SteamEngine extends types.Entity {
		name: string = "crafter_steam:engine";

		initial_properties: ObjectProperties = {
			visual: EntityVisual.mesh,
			mesh: "steam_engine.gltf",
			visual_size: { x: 1, y: 1 },
		};

		on_activate(staticData: string, delta: number): void {
			const pos = vector.floor(this.object.get_pos());
			pos.y += 0.5;
			this.object.set_pos(pos);
			this.object.set_animation({ x: 0, y: 1 }, 1, 0, true);
		}
	}

	utility.registerTSEntity(SteamEngine);
}
