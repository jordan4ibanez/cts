namespace farming {
	function soilHasWater(pos: Vec3): boolean {
		const [a, _] = core.find_nodes_in_area(
			vector.create3d(pos.x - 3, pos.y, pos.z - 3),
			vector.create3d(pos.x + 3, pos.y, pos.z + 3),
			["main:water", "main:waterflow"]
		);
		return a.length > 0;
	}

	for (const [level, dryness] of pairs(["wet", "dry"])) {
		if (typeof level != "number") {
			throw new Error("how");
		}

		const coloring: number = 160 / level;

		let on_construct: ((pos: Vec3) => void) | undefined;
		let on_timer: ((pos: Vec3) => void) | undefined;

		if (dryness == "wet") {
			on_construct = (pos: Vec3) => {
				if (!soilHasWater(pos)) {
					core.set_node(pos, { name: "farming:farmland_dry" });
				}
				const timer: NodeTimerObject = core.get_node_timer(pos);
				timer.start(1);
			};
			on_timer = (pos: Vec3) => {
				if (!soilHasWater(pos)) {
					core.set_node(pos, { name: "farming:farmland_dry" });
				}
				const timer: NodeTimerObject = core.get_node_timer(pos);
				timer.start(math.random(10, 25) + math.random());
			};
		} else {
			on_construct = (pos: Vec3) => {
				const timer: NodeTimerObject = core.get_node_timer(pos);
				timer.start(math.random(10, 25));
			};
			on_timer = (pos: Vec3) => {
				// 			local found = table.getn(core.find_nodes_in_area(vector.new(pos.x-3,pos.y,pos.z-3), vector.new(pos.x+3,pos.y,pos.z+3), {"main:water","main:waterflow"})) > 0
				// 			if found then
				// 				core.set_node(pos,{name="farming:farmland_wet"})
				// 				local timer = core.get_node_timer(pos)
				// 				timer:start(1)
				// 			else
				// 				core.set_node(pos,{name="main:dirt"})
				// 				if core.get_node_group(core.get_node(vector.new(pos.x,pos.y+1,pos.z)).name, "plant") > 0 then
				// 					core.dig_node(vector.new(pos.x,pos.y+1,pos.z))
				// 				end
				// 			end
			};
		}
		// 	core.register_node("farming:farmland_"..dryness,{
		// 		description = "Farmland",
		// 		paramtype = "light",
		// 		drawtype = "nodebox",
		// 		sounds = main.dirtSound(),
		// 		--paramtype2 = "wallmounted",
		// 		node_box = {
		// 			type = "fixed",
		// 			--{xmin, ymin, zmin, xmax, ymax, zmax}
		// 			fixed = {-0.5, -0.5, -0.5, 0.5, 6/16, 0.5},
		// 		},
		// 		wetness = math.abs(level-2),
		// 		collision_box = {
		// 			type = "fixed",
		// 			--{xmin, ymin, zmin, xmax, ymax, zmax}
		// 			fixed = {-0.5, -0.5, -0.5, 0.5, 6/16, 0.5},
		// 		},
		// 		tiles = {"dirt.png^farmland.png^[colorize:black:"..coloring,"dirt.png^[colorize:black:"..coloring,"dirt.png^[colorize:black:"..coloring,"dirt.png^[colorize:black:"..coloring,"dirt.png^[colorize:black:"..coloring,"dirt.png^[colorize:black:"..coloring},
		// 		groups = {dirt = 1, soft = 1, shovel = 1, hand = 1, soil=1,farmland=1},
		// 		drop="main:dirt",
		// 		on_construct = on_construct,
		// 		on_timer = on_timer,
		// 	})
	}
}
