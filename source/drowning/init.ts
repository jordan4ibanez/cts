namespace drowning {
	export interface DrownData {
		breath: number;
		ticker: number;
		drowning: number;
	}

	const mod_storage: MetaRef = core.get_mod_storage();
	const pool = new Map<string, DrownData>();

	// updates bubble bar
	function update_breath_bar(player: ObjectRef, breath: number): void {
		if (breath > 20) {
			if (hudManager.hud_exists(player, "breath_bg")) {
				hudManager.remove_hud(player, "breath_bg");
			}
			if (hudManager.hud_exists(player, "breath")) {
				hudManager.remove_hud(player, "breath");
			}
		} else {
			if (!hudManager.hud_exists(player, "breath_bg")) {
				hudManager.add_hud(player, "breath_bg", {
					hud_elem_type: HudElementType.statbar,
					position: { x: 0.5, y: 1 },
					text: "bubble_bg.png",
					number: 20,
					direction: 1,
					size: { x: 24, y: 24 },
					offset: { x: 24 * 10, y: -(48 + 52 + 39) },
				});
			}
			if (!hudManager.hud_exists(player, "breath")) {
				hudManager.add_hud(player, "breath", {
					hud_elem_type: HudElementType.statbar,
					position: { x: 0.5, y: 1 },
					text: "bubble.png",
					number: breath,
					direction: 1,
					size: { x: 24, y: 24 },
					offset: { x: 24 * 10, y: -(48 + 52 + 39) },
				});
			}
			hudManager.change_hud({
				player: player,
				hudName: "breath",
				element: "number",
				data: breath,
			});
		}
	}

	// Loads data from mod storage.
	function load_data(player: ObjectRef): void {
		const name: string = player.get_player_name();

		const data: DrownData = {
			breath: 0,
			ticker: 0,
			drowning: 0,
		};

		if (mod_storage.get_int("crafter_drown_" + name + "_save") > 0) {
			data.breath = mod_storage.get_float(name + "breath");
			data.ticker = mod_storage.get_float(name + "breath_ticker");
			data.drowning = mod_storage.get_float(name + "drowning");
		} else {
			data.breath = 21;
			data.ticker = 0;
			data.drowning = 0;
		}

		pool.set(name, data);
	}

	// Saves data to be utilized on next login.
	// todo: this needs to be renamed to finalSave
	function save_data(name: string): void {
		const data: DrownData | undefined = pool.get(name);

		if (data == null) {
			throw new Error(`Player [${name}] drown data does not exist.`);
		}

		mod_storage.set_float("crafter_drown_" + name + "breath", data.breath);
		mod_storage.set_float(
			"crafter_drown_" + name + "breath_ticker",
			data.ticker
		);
		mod_storage.set_float(
			"crafter_drown_" + name + "drowning",
			data.drowning
		);
		mod_storage.set_int("crafter_drown_" + name + "_save", 1);

		pool.delete(name);
	}

	// // is used for shutdowns to save all data
	// local save_all = function()
	// 	for name,_ in pairs(pool) do
	// 		save_data(name)
	// 	end
	// end

	// // remove stock health bar
	// core.hud_replace_builtin("breath",{
	// 	hud_elem_type = "statbar",
	// 	position = {x = 0, y = 0},
	// 	text = "nothing.png",
	// 	number = 0,
	// 	direction = 0,
	// 	size = {x = 0, y = 0},
	// 	offset = {x = 0, y= 0},
	// })

	// core.register_on_joinplayer(function(player)
	// 	load_data(player)
	// 	player:hud_set_flags({breathbar=false})
	// end)

	// // saves specific users data for when they relog
	// core.register_on_leaveplayer(function(player)
	// 	save_data(player)
	// end)

	// // save all data to mod storage on shutdown
	// core.register_on_shutdown(function()
	// 	save_all()
	// end)

	// local name
	// is_player_drowning = function(player)
	// 	name = player:get_player_name()
	// 	return(pool[name].drowning)
	// end

	// // reset the player's data
	// local name
	// local temp_pool
	// core.register_on_respawnplayer(function(player)
	// 	name = player:get_player_name()
	// 	temp_pool = pool[name]
	// 	temp_pool.breath   = 21
	// 	temp_pool.ticker   = 0
	// 	temp_pool.drowning = 0
	// 	update_breath_bar(player,temp_pool.breath)
	// end)

	// //handle the breath bar
	// local name
	// local temp_pool
	// local head
	// local hp
	// local handle_breath = function(player,dtime)
	// 	name = player:get_player_name()
	// 	head = get_player_head_env(player)
	// 	temp_pool = pool[name]
	// 	hp = player:get_hp()
	// 	if hp <= 0 then
	// 		return
	// 	end
	// 	if core.get_item_group(head, "drowning") > 0 then

	// 		temp_pool.ticker = temp_pool.ticker + dtime

	// 		if temp_pool.breath > 0 and temp_pool.ticker >= 1.3 then

	// 			if temp_pool.breath == 21 then
	// 				temp_pool.breath = 20
	// 			end
	// 			temp_pool.breath = temp_pool.breath - 2

	// 			temp_pool.drowning = 0

	// 			update_breath_bar(player,temp_pool.breath)
	// 		elseif temp_pool.breath <= 0 and temp_pool.ticker >= 1.3 then

	// 			temp_pool.drowning = 1

	// 			if hp > 0 then
	// 				player:set_hp( hp - 2 )
	// 			end
	// 		end

	// 		if temp_pool.ticker >= 1.3 then
	// 			temp_pool.ticker = 0
	// 		end

	// 	else

	// 		temp_pool.ticker = temp_pool.ticker + dtime

	// 		if temp_pool.breath < 21 and temp_pool.ticker >= 0.25 then

	// 			temp_pool.breath = temp_pool.breath + 2

	// 			temp_pool.drowning      = 0

	// 			temp_pool.ticker = 0

	// 			update_breath_bar(player,temp_pool.breath)
	// 		end
	// 	end
	// end

	// // inject into main loop
	// core.register_globalstep(function(dtime)
	// 	for _,player in ipairs(core.get_connected_players()) do
	// 		handle_breath(player,dtime)
	// 	end
	// end)
}
