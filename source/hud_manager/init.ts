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

		const local_hud: number = player.hud_add({
			hud_elem_type: def.hud_elem_type,
			position: def.position,
			text: def.text,
			number: def.number,
			direction: def.direction,
			size: def.size,
			offset: def.offset,
		});

		let data: Map<string, number> | undefined = player_huds.get(name);

		if (!data) {
			player_huds.set(name, new Map<string, number>());
			data = player_huds.get(name);
			// Now if it's still null, something went seriously wrong.
			if (!data) {
				throw new Error(
					"How did this become null? It was just created. Error"
				);
			}
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
	}

	// change element of hud
	// todo: make this NOT any.
	export function change_hud(hudChangeData: HudChange): void {
		const name = hudChangeData.player.get_player_name();

		const data: Map<string, number> | undefined = player_huds.get(name);

		if (!data) {
			throw new Error(
				`Player [${name}]'s hud element was never created.`
			);
		}

        const thisHud: number | undefined = data.get(hudChangeData.hudName) 
        
	    // if player_huds[name] and player_huds[name][data.hud_name] then
	    //     data.player:hud_change(player_huds[name][data.hud_name], data.element, data.data)
	    // end
    }

	// // gets if hud exists
	// hud_manager.hud_exists = function(player,hud_name)
	//     local name = player:get_player_name()
	//     if player_huds[name] and player_huds[name][hud_name] then
	//         return(true)
	//     else
	//         return(false)
	//     end
	// end
}
