namespace serverMessages {
	// local pool = {}

	if (!core.is_singleplayer()) {
		core.register_on_joinplayer((player: ObjectRef) => {
			const meta: MetaRef = player.get_meta();
			const welcomed: boolean = meta.get_int("welcomed") == 1;
			const name: string = player.get_player_name();
			if (!welcomed) {
				core.chat_send_all("Welcome " + name + " to the server!");
				meta.set_int("welcomed", 1);
			} else {
				core.chat_send_all("Welcome back " + name + "!");
			}
		});
	}

	const death_messages: string[] = [
		" got smoked!",
		" didn't see that coming!",
		" is taking a nap!",
		", that looked painful!",
		" is pushing up daisies!",
		" is lucky there are infinite lives!",
		" met their maker!",
		" is in pieces!",
		" got wrecked!",
		" got destroyed!",
		" got minced!",
		"'s health bar is looking a little empty!",
		" turned into a puzzle!",
		" is in the Aether now!",
		" is in the Nether!",
		", how's the Void?",
		" dropped their stuff! Go get it!",
		" is having a fire sale and everything's free!",
		" is doomed!",
		", I didn't even know you could have negative health!",
		" try not to keep dying!",
		" died!",
		" probably starved!",
		" is seeing how the ground feels!",
		" is shutting down!",
	];

	const leave_messages: string[] = [
		" logged out.",
		" gave up.",
		" rage quit.",
		"'s game probably crashed.",
		" got bored.",
		" left.",
		" is going IRL.",
		" left the matrix.",
		" is out.",
	];

	core.register_on_dieplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		core.chat_send_all(
			name + death_messages[math.random(0, death_messages.length)]
		);
	});

	if (!core.is_singleplayer()) {
		core.register_on_leaveplayer((player: ObjectRef) => {
			const name: string = player.get_player_name();
			core.chat_send_all(
				name + leave_messages[math.random(0, leave_messages.length)]
			);
		});
	}
}
