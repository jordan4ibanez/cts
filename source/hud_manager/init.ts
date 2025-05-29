namespace hudManager {
	// The list of players hud lists (3d array).
	const player_huds = new Map<string, Map<string, number>>();

	core.register_on_joinplayer((player: ObjectRef) => {
		player_huds.set(player.get_player_name(), new Map<string, number>());
	});

	// Terminate the player's list on leave.
	core.register_on_leaveplayer((player: ObjectRef) => {
		player_huds.delete(player.get_player_name());
	});

	// create instance of new hud
	export function add_hud(
		player: ObjectRef,
		hud_name: string,
		def: HudDefinition
	): void {
		const name: string = player.get_player_name();

		const local_hud: number | null = player.hud_add({
			type: def.type,
			position: def.position,
			name: def.name,
			scale: def.scale,
			text: def.text,
			text2: def.text2,
			number: def.number,
			item: def.item,
			direction: def.direction,
			alignment: def.alignment,
			offset: def.offset,
			world_pos: def.world_pos,
			size: def.size,
			z_index: def.z_index,
			style: def.style,
		});

		if (local_hud == null) {
			core.log(
				LogLevel.warning,
				`Failed to add hud [${hud_name}] to player [${name}]`
			);
			return;
		}

		let data: Map<string, number> | undefined = player_huds.get(name);

		if (!data) {
			throw new Error("Player's hud entry was never created. Error");
		}

		if (data.has(hud_name)) {
			throw new Error(
				`Tried to overwrite hud [${hud_name}] for player [${name}]`
			);
		}

		data.set(hud_name, local_hud);
	}

	// delete instance of hud
	export function remove_hud(player: ObjectRef, hud_name: string): void {
		const name: string = player.get_player_name();

		const data: Map<string, number> | undefined = player_huds.get(name);

		if (!data) {
			throw new Error(
				`Player [${name}]'s hud element was never created.`
			);
		}

		const thisHud: number | undefined = data.get(hud_name);

		if (thisHud != null) {
			player.hud_remove(thisHud);
			data.delete(hud_name);
		} else {
			core.log(
				LogLevel.warning,
				`Warning: Player [${name}]'s hud [${hud_name}] doesn't exist. No-op.`
			);
		}
	}

	export interface HudChange {
		player: ObjectRef;
		hudName: string;
		element: keyof HudDefinition;
		data: any;
	}

	// Change element of hud.
	export function change_hud(hudChangeData: HudChange): void {
		const name = hudChangeData.player.get_player_name();

		const data: Map<string, number> | undefined = player_huds.get(name);

		if (!data) {
			throw new Error(
				`Player [${name}]'s hud element was never created.`
			);
		}

		const thisHud: number | undefined = data.get(hudChangeData.hudName);

		if (thisHud == null) {
			throw new Error(
				`Error. Player [${name}] hud [${hudChangeData.hudName}] does not exist in memory.`
			);
		}

		hudChangeData.player.hud_change(
			thisHud,
			hudChangeData.element,
			hudChangeData.data
		);
	}

	// Gets if hud exists.
	export function hud_exists(player: ObjectRef, hud_name: string): boolean {
		const name = player.get_player_name();

		const data: Map<string, number> | undefined = player_huds.get(name);

		if (!data) {
			throw new Error(
				`Player [${name}]'s hud element was never created.`
			);
		}

		return data.has(hud_name);
	}
}
