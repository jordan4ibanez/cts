namespace weather {
	core.register_chatcommand("weather", {
		params: "<mobname>",
		description: "Spawn a mob",
		privs: { server: true },
		func: (name: string, newWeather: string) => {
			if (newWeather == "0" || newWeather == "clear") {
				setWeatherType(0);
				core.chat_send_all(name + " has set the weather to clear!");
			} else if (newWeather == "1" || newWeather == "snow") {
				setWeatherType(1);
				core.chat_send_all(name + " has set the weather to snow!");
			} else if (newWeather == "2" || newWeather == "rain") {
				setWeatherType(2);
				core.chat_send_all(name + " has set the weather to rain!");
			} else if (newWeather == "") {
				core.chat_send_player(
					name,
					"Possible weather types are: 0,clear,1,snow,2,rain"
				);
			} else {
				core.chat_send_player(
					name,
					'"' + newWeather + '"' + " is not a registered weather type!"
				);
			}
		},
	});
}
