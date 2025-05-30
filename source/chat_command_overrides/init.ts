core.register_chatcommand("clearinv", {
	params: "[<name>]",
	description: "Clear the inventory of yourself or another player",
	privs: { server: true },
	func: (name, param) => {
		let player;

		if (param && param != "" && param != name) {
			if (!core.check_player_privs(name, { server: true })) {
				return $multi(
					false,
					"You don't have permission" +
						" to clear another player's inventory (missing privilege: server)"
				);
			}
			player = core.get_player_by_name(param);
			core.chat_send_player(param, name + " cleared your inventory.");
		} else {
			player = core.get_player_by_name(name);
		}

		if (player != null) {
			player.get_inventory().set_list("main", []);
			player.get_inventory().set_list("craft", []);
			player.get_inventory().set_list("craftpreview", []);
			player.get_inventory().set_list("armor_head", []);
			player.get_inventory().set_list("armor_torso", []);
			player.get_inventory().set_list("armor_legs", []);
			player.get_inventory().set_list("armor_feet", []);

			core.log(
				LogLevel.action,
				name + " clears " + player.get_player_name() + "'s inventory"
			);
			return $multi(
				true,
				"Cleared " + player.get_player_name() + "'s inventory."
			);
		} else {
			return $multi(false, "Player must be online to clear inventory!");
		}
	},
});
