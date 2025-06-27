namespace weather {
	core.register_chatcommand("weather", {
		params: "<mobname>",
		description: "Spawn a mob",
		privs: { server: true },
		func: (name: string, weather: string) => {
			if (weather == "0" || weather == "clear") {
				setWeatherType(0);
				core.chat_send_all(name + " has set the weather to clear!");
			} else if (weather == "1" || weather == "snow") {
				setWeatherType(1);
				core.chat_send_all(name + " has set the weather to snow!");
			} else if (weather == "2" || weather == "rain") {
				// 			weather_type = 2
				// 			function_send_weather_type()
				// 			update_player_sky()
				// 			minetest.chat_send_all(name+" has set the weather to rain!")
			} else if (weather == "") {
				// 			minetest.chat_send_player(name, "Possible weather types are: 0,clear,1,snow,2,rain")
			} else {
				// 			minetest.chat_send_player(name, '"'+weather+'"'+" is not a registered weather type!")
			}
		},
	});
}
