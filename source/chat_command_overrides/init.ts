core.override_chatcommand("clearinv", {
	params: "[<name>]",
	description: "Clear the inventory of yourself or another player",
	privs: { server: true },
	func: (name, param) => {
		let player: ObjectRef | null;

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
			const inv: InvRef | null = player.get_inventory();
			if (inv == null) {
				throw new Error("Not a player.");
			}
			inv.set_list("main", []);
			inv.set_list("craft", []);
			inv.set_list("craftpreview", []);
			inv.set_list("armor_head", []);
			inv.set_list("armor_torso", []);
			inv.set_list("armor_legs", []);
			inv.set_list("armor_feet", []);

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
