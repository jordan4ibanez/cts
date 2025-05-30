// Quick definition of tools.
namespace crafter {
	const __tools: string[] = ["shovel", "axe", "pick"];
	const __materials: string[] = [
		"coal",
		"wood",
		"stone",
		"lapis",
		"iron",
		"gold",
		"diamond",
		"emerald",
		"sapphire",
		"ruby",
	];
	const sword_durability: number[] = [
		10, 52, 131, 200, 250, 32, 1561, 2300, 3000, 5000,
	];

	// Unbreakable time definition.
	// This is used so ores still have sounds
	// and particles but don't drop anything or
	// finish mining, 32 bit integer limit.
	// 32 bit integer limit so that the initial
	// mining texture does not show up until a week
	// after you've continuously held down the button.
	const ub: number = 2147483647; // unbreakable

	for (const [level_id, material] of ipairs(__materials)) {
		let damage: number = 0;
		for (const [id, tool] of ipairs(__tools)) {
			// print(id,tool,level,material)
			let groupcaps2: { [id: string]: GroupCap } | null = null;
			let wear: number = 0;

			// ███████╗██╗  ██╗ ██████╗ ██╗   ██╗███████╗██╗
			// ██╔════╝██║  ██║██╔═══██╗██║   ██║██╔════╝██║
			// ███████╗███████║██║   ██║██║   ██║█████╗  ██║
			// ╚════██║██╔══██║██║   ██║╚██╗ ██╔╝██╔══╝  ██║
			// ███████║██║  ██║╚██████╔╝ ╚████╔╝ ███████╗███████╗
			// ╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚══════╝

			if (tool == "shovel") {
				if (material == "wood") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.4,
								[2]: 1.5,
								[3]: 3,
								[4]: 6,
								[5]: 12,
							},
							uses: 59,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.4,
								[2]: 1.5,
								[3]: 3,
								[4]: 6,
								[5]: 12,
							},
							uses: 59,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.45,
								[2]: 1.5,
								[3]: 3,
								[4]: 6,
								[5]: 12,
							},
							uses: 59,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.4,
								[2]: 1.5,
								[3]: 3,
								[4]: 6,
								[5]: 12,
							},
							uses: 59,
							maxlevel: 1,
						},
					};
					damage = 2.5;
					wear = 500;
				} else if (material == "stone") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.2,
								[2]: 0.2,
								[3]: 1.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 131,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.2,
								[2]: 0.2,
								[3]: 1.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 131,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.25,
								[2]: 0.25,
								[3]: 1.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 131,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.2,
								[2]: 0.2,
								[3]: 1.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 131,
							maxlevel: 1,
						},
					};
					damage = 3.5;
					wear = 400;
				} else if (material == "coal") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.02,
								[2]: 0.02,
								[3]: 1.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 10,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.02,
								[2]: 0.02,
								[3]: 1.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 10,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.025,
								[2]: 0.025,
								[3]: 1.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 10,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.02,
								[2]: 0.02,
								[3]: 1.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 10,
							maxlevel: 1,
						},
					};
					damage = 3.5;
					wear = 2000;
				} else if (material == "lapis") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.17,
								[2]: 0.17,
								[3]: 0.17,
								[4]: 1.5,
								[5]: 4.5,
							},
							uses: 190,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.17,
								[2]: 0.17,
								[3]: 0.17,
								[4]: 1.5,
								[5]: 4.5,
							},
							uses: 190,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.17,
								[2]: 0.17,
								[3]: 0.17,
								[4]: 1.5,
								[5]: 4.5,
							},
							uses: 190,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.17,
								[2]: 0.17,
								[3]: 0.17,
								[4]: 1.5,
								[5]: 4.5,
							},
							uses: 190,
							maxlevel: 1,
						},
					};
					damage = 4;
					wear = 350;
				} else if (material == "iron") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: 0.15,
								[4]: 1.5,
								[5]: 3,
							},
							uses: 250,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: 0.15,
								[4]: 1.5,
								[5]: 3,
							},
							uses: 250,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: 0.15,
								[4]: 1.5,
								[5]: 3,
							},
							uses: 250,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: 0.15,
								[4]: 1.5,
								[5]: 3,
							},
							uses: 250,
							maxlevel: 1,
						},
					};
					damage = 4.5;
					wear = 300;
				} else if (material == "gold") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: 1.5,
							},
							uses: 32,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: 1.5,
							},
							uses: 32,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: 1.5,
							},
							uses: 32,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: 1.5,
							},
							uses: 32,
							maxlevel: 1,
						},
					};
					damage = 2.5;
					wear = 1000;
				} else if (material == "diamond") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: 1.5,
							},
							uses: 1561,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: 1.5,
							},
							uses: 1561,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: 0.15,
								[4]: 0.15,
								[5]: 1.5,
							},
							uses: 1561,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: 1.5,
							},
							uses: 1561,
							maxlevel: 1,
						},
					};
					damage = 5.5;
					wear = 100;
				} else if (material == "emerald") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: 0.05,
								[5]: 0.05,
							},
							uses: 2300,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: 0.05,
								[5]: 0.05,
							},
							uses: 2300,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: 0.05,
								[5]: 0.05,
							},
							uses: 2300,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: 0.05,
								[5]: 0.05,
							},
							uses: 2300,
							maxlevel: 1,
						},
					};
					damage = 7;
					wear = 50;
				} else if (material == "sapphire") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.025,
								[2]: 0.025,
								[3]: 0.025,
								[4]: 0.025,
								[5]: 0.025,
							},
							uses: 3000,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.025,
								[2]: 0.025,
								[3]: 0.025,
								[4]: 0.025,
								[5]: 0.025,
							},
							uses: 3000,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.025,
								[2]: 0.025,
								[3]: 0.025,
								[4]: 0.025,
								[5]: 0.025,
							},
							uses: 3000,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.025,
								[2]: 0.025,
								[3]: 0.025,
								[4]: 0.025,
								[5]: 0.025,
							},
							uses: 3000,
							maxlevel: 1,
						},
					};
					damage = 9;
					wear = 25;
				} else if (material == "ruby") {
					groupcaps2 = {
						dirt: {
							times: {
								[1]: 0.01,
								[2]: 0.01,
								[3]: 0.01,
								[4]: 0.01,
								[5]: 0.01,
							},
							uses: 5000,
							maxlevel: 1,
						},
						snow: {
							times: {
								[1]: 0.01,
								[2]: 0.01,
								[3]: 0.01,
								[4]: 0.01,
								[5]: 0.01,
							},
							uses: 5000,
							maxlevel: 1,
						},
						grass: {
							times: {
								[1]: 0.01,
								[2]: 0.01,
								[3]: 0.01,
								[4]: 0.01,
								[5]: 0.01,
							},
							uses: 5000,
							maxlevel: 1,
						},
						sand: {
							times: {
								[1]: 0.01,
								[2]: 0.01,
								[3]: 0.01,
								[4]: 0.01,
								[5]: 0.01,
							},
							uses: 5000,
							maxlevel: 1,
						},
					};
					damage = 12;
					wear = 10;
				}
			}

			//  █████╗ ██╗  ██╗███████╗
			// ██╔══██╗╚██╗██╔╝██╔════╝
			// ███████║ ╚███╔╝ █████╗
			// ██╔══██║ ██╔██╗ ██╔══╝
			// ██║  ██║██╔╝ ██╗███████╗
			// ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝

			if (tool == "axe") {
				if (material == "wood") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 1.5,
								[2]: 3,
								[3]: 6,
								[4]: 9,
								[5]: 12,
							},
							uses: 59,
							maxlevel: 1,
						},
					};
					damage = 4;
					wear = 500;
				} else if (material == "stone") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.75,
								[2]: 0.75,
								[3]: 3,
								[4]: 6,
								[5]: 9,
							},
							uses: 131,
							maxlevel: 1,
						},
					};
					damage = 6;
					wear = 400;
				} else if (material == "coal") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.075,
								[2]: 0.075,
								[3]: 3,
								[4]: 6,
								[5]: 9,
							},
							uses: 10,
							maxlevel: 1,
						},
					};
					damage = 3;
					wear = 2000;
				} else if (material == "lapis") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.6,
								[2]: 0.6,
								[3]: 1,
								[4]: 4,
								[5]: 7,
							},
							uses: 200,
							maxlevel: 1,
						},
					};
					damage = 7;
					wear = 350;
				} else if (material == "iron") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.5,
								[2]: 0.5,
								[3]: 0.5,
								[4]: 3,
								[5]: 6,
							},
							uses: 250,
							maxlevel: 1,
						},
					};
					damage = 8;
					wear = 300;
				} else if (material == "gold") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.25,
								[2]: 0.25,
								[3]: 0.25,
								[4]: 0.25,
								[5]: 3,
							},
							uses: 32,
							maxlevel: 1,
						},
					};
					damage = 7;
					wear = 1000;
				} else if (material == "diamond") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.4,
								[2]: 0.4,
								[3]: 0.4,
								[4]: 0.4,
								[5]: 3,
							},
							uses: 1561,
							maxlevel: 1,
						},
					};
					damage = 9;
					wear = 100;
				} else if (material == "emerald") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.2,
								[2]: 0.2,
								[3]: 0.2,
								[4]: 0.2,
								[5]: 1.5,
							},
							uses: 2300,
							maxlevel: 1,
						},
					};
					damage = 12;
					wear = 50;
				} else if (material == "sapphire") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: 1,
							},
							uses: 3000,
							maxlevel: 1,
						},
					};
					damage = 14;
					wear = 25;
				} else if (material == "ruby") {
					groupcaps2 = {
						wood: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: 0.05,
								[5]: 0.5,
							},
							uses: 5000,
							maxlevel: 1,
						},
					};
					damage = 18;
					wear = 10;
				}
			}

			// ██████╗ ██╗ ██████╗██╗  ██╗ █████╗ ██╗  ██╗███████╗
			// ██╔══██╗██║██╔════╝██║ ██╔╝██╔══██╗╚██╗██╔╝██╔════╝
			// ██████╔╝██║██║     █████╔╝ ███████║ ╚███╔╝ █████╗
			// ██╔═══╝ ██║██║     ██╔═██╗ ██╔══██║ ██╔██╗ ██╔══╝
			// ██║     ██║╚██████╗██║  ██╗██║  ██║██╔╝ ██╗███████╗
			// ╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝

			if (tool == "pick") {
				if (material == "wood") {
					groupcaps2 = {
						//ore hardness
						//1 stone, 1 coal, 2 iron, 3 gold, 4 diamond, 5 obsidian
						stone: {
							times: {
								[1]: 1.15,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 59,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.575,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 59,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.2875,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 59,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: ub,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 59,
							maxlevel: 1,
						},
					};
					damage = 3;
					wear = 500;
				} else if (material == "stone") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.6,
								[2]: 0.6,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 131,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.3,
								[2]: 0.3,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 131,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 131,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: ub,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 131,
							maxlevel: 1,
						},
					};
					damage = 4;
					wear = 400;
				} else if (material == "coal") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.3,
								[2]: 0.3,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 10,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.2,
								[2]: 0.2,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 10,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 10,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: ub,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 10,
							maxlevel: 1,
						},
					};
					damage = 2;
					wear = 2000;
				} else if (material == "lapis") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.5,
								[2]: 0.5,
								[3]: 0.5,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 200,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.25,
								[2]: 0.25,
								[3]: 0.25,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 200,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.125,
								[2]: 0.125,
								[3]: 0.125,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 200,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: ub,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 200,
							maxlevel: 1,
						},
					};
					damage = 4;
					wear = 400;
				} else if (material == "iron") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.4,
								[2]: 0.4,
								[3]: 0.4,
								[4]: 0.4,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 250,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.2,
								[2]: 0.2,
								[3]: 0.2,
								[4]: 0.2,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 250,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: 0.1,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 250,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: ub,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 250,
							maxlevel: 1,
						},
					};
					damage = 5;
					wear = 300;
				} else if (material == "gold") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.2,
								[2]: 0.2,
								[3]: 0.2,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 32,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.1,
								[2]: 0.1,
								[3]: 0.1,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 32,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 32,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: ub,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 32,
							maxlevel: 1,
						},
					};
					damage = 3;
					wear = 1000;
				} else if (material == "diamond") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.3,
								[2]: 0.3,
								[3]: 0.3,
								[4]: 0.3,
								[5]: 0.3,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 1561,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: 0.15,
								[4]: 0.15,
								[5]: 0.15,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 1561,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.8,
								[2]: 0.8,
								[3]: 0.8,
								[4]: 0.8,
								[5]: 0.8,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 1561,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: 10,
								[2]: ub,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 1561,
							maxlevel: 1,
						},
					};
					damage = 6;
					wear = 100;
				} else if (material == "emerald") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.15,
								[2]: 0.15,
								[3]: 0.15,
								[4]: 0.15,
								[5]: 0.15,
								[6]: 0.15,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 2300,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: 0.05,
								[5]: 0.05,
								[6]: 0.05,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 2300,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: 0.05,
								[5]: 0.05,
								[6]: 0.05,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 2300,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: 5,
								[2]: 5,
								[3]: ub,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 2300,
							maxlevel: 1,
						},
					};
					damage = 8;
					wear = 50;
				} else if (material == "sapphire") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.05,
								[2]: 0.05,
								[3]: 0.05,
								[4]: 0.05,
								[5]: 0.05,
								[6]: 0.05,
								[7]: 0.05,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 3000,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.025,
								[2]: 0.025,
								[3]: 0.025,
								[4]: 0.025,
								[5]: 0.025,
								[6]: 0.025,
								[7]: 0.025,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 3000,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.025,
								[2]: 0.025,
								[3]: 0.025,
								[4]: 0.025,
								[5]: 0.025,
								[6]: 0.025,
								[7]: 0.025,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 3000,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: 2,
								[2]: 2,
								[3]: 2,
								[4]: ub,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 3000,
							maxlevel: 1,
						},
					};
					damage = 10;
					wear = 25;
				} else if (material == "ruby") {
					groupcaps2 = {
						stone: {
							times: {
								[1]: 0.03,
								[2]: 0.03,
								[3]: 0.03,
								[4]: 0.03,
								[5]: 0.03,
								[6]: 0.03,
								[7]: 0.03,
								[8]: 0.03,
								[9]: ub,
								[10]: ub,
							},
							uses: 5000,
							maxlevel: 1,
						},
						glass: {
							times: {
								[1]: 0.02,
								[2]: 0.02,
								[3]: 0.02,
								[4]: 0.02,
								[5]: 0.02,
								[6]: 0.02,
								[7]: 0.02,
								[8]: 0.02,
								[9]: ub,
								[10]: ub,
							},
							uses: 5000,
							maxlevel: 1,
						},
						netherrack: {
							times: {
								[1]: 0.02,
								[2]: 0.02,
								[3]: 0.02,
								[4]: 0.02,
								[5]: 0.02,
								[6]: 0.02,
								[7]: 0.02,
								[8]: 0.02,
								[9]: ub,
								[10]: ub,
							},
							uses: 5000,
							maxlevel: 1,
						},
						obsidian: {
							times: {
								[1]: 1,
								[2]: 1,
								[3]: 1,
								[4]: 1,
								[5]: ub,
								[6]: ub,
								[7]: ub,
								[8]: ub,
								[9]: ub,
								[10]: ub,
							},
							uses: 5000,
							maxlevel: 1,
						},
					};
					damage = 16;
					wear = 10;
				}
			}

			if (typeof material != "string") {
				throw new Error("material is not a string.");
			}
			if (groupcaps2 == null) {
				throw new Error("groupcaps is null");
			}

			core.register_tool("crafter:" + material + tool, {
				description:
					string.gsub(material, "^%l", string.upper) +
					" " +
					string.gsub(tool, "^%l", string.upper),
				inventory_image: material + tool + ".png",
				tool_capabilities: {
					full_punch_interval: 0,
					//max_drop_level=0,
					groupcaps: groupcaps2,
					damage_groups: { damage: damage },
				},
				sound: { breaks: { name: "tool_break", gain: 0.4 } }, // change this //todo: figure out what to change this to lol
				groups: { flammable: 2, tool: 1 },
				mob_hit_wear: wear,
				// torch rightclick - hacked in since api doesn't call on_place correctly // todo: is this true?!
				on_place: (
					itemstack: ItemStackObject,
					placer: ObjectRef,
					pointed_thing: PointedThing
				) => {
					const inv: InvRef = placer.get_inventory();
					const torch = inv.contains_item("main", "torch:torch");
					const is_air: boolean =
						core.get_node(pointed_thing.above).name == "air";
					const dir: Vec3 = vector.subtract(
						pointed_thing.under,
						pointed_thing.above
					);
					const diff: number = dir.y;
					const noddef: NodeDefinition | undefined =
						core.registered_nodes[
							core.get_node(pointed_thing.under).name
						];
					const walkable: boolean =
						(noddef && noddef.walkable) || false;
					const sneak: boolean = placer.get_player_control().sneak;
					if (!sneak && noddef && noddef.on_rightclick) {
						core.item_place(itemstack, placer, pointed_thing);
						return;
					}
					if (!torch || !is_air || !walkable) {
						return;
					}
					if (diff == 0) {
						const param2: number = core.dir_to_wallmounted(dir);
						core.set_node(pointed_thing.above, {
							name: "torch:wall",
							param2: param2,
						});
						core.sound_play("wood", {
							pos: pointed_thing.above,
							gain: 1.0,
						});
					} else if (diff == -1) {
						core.place_node(pointed_thing.above, {
							name: "torch:floor",
						});
					}
					//take item
					if (diff == 0 || diff == -1) {
						inv.remove_item("main", "torch:torch");
					}
				},
			});
		}

		let wear: number = 0;

		if (material == "wood") {
			damage = 4;
			wear = 500;
		} else if (material == "stone") {
			damage = 5;
			wear = 400;
		} else if (material == "coal") {
			damage = 2;
			wear = 2000;
		} else if (material == "lapis") {
			damage = 5;
			wear = 350;
		} else if (material == "iron") {
			damage = 6;
			wear = 300;
		} else if (material == "gold") {
			damage = 4;
			wear = 1000;
		} else if (material == "diamond") {
			damage = 7;
			wear = 100;
		} else if (material == "emerald") {
			damage = 9;
			wear = 50;
		} else if (material == "sapphire") {
			damage = 11;
			wear = 25;
		}

		if (typeof material != "string") {
			throw new Error("Material is not a string.");
		}

		const suse: number | null = sword_durability[level_id - 1];

		if (!suse) {
			throw new Error("Sword out of range");
		}

		// Add swords.
		core.register_tool("crafter:" + material + "sword", {
			description: string.gsub(material, "^%l", string.upper) + " Sword",
			inventory_image: material + "sword.png",
			tool_capabilities: {
				full_punch_interval: 0,
				//max_drop_level=0,
				groupcaps: {
					leaves: {
						times: { [4]: 0.7, [3]: 0.7, [2]: 0.7, [1]: 0.7 },
						uses: suse,
						maxlevel: 1,
					},
				},
				damage_groups: { damage: damage },
			},
			mob_hit_wear: wear,
			sound: { breaks: { name: "tool_break", gain: 0.4 } }, // change this //todo: figure out what to change this to lol
			groups: { damage: damage },
		});
	}

	// Shears.
	core.register_tool("crafter:shears", {
		description: "Shears",
		inventory_image: "shears.png",
		tool_capabilities: {
			groupcaps: {
				leaves: {
					times: {
						[1]: 0.05,
						[2]: 0.05,
						[3]: 0.05,
						[4]: 0.05,
						[5]: 0.05,
					},
					uses: 500,
					maxlevel: 1,
				},
			},
		},
		sound: { breaks: "default_tool_breaks" }, // change this //todo: figure out what to change this to lol
		groups: { shears: 1 },
	});
}
