namespace walls {
	const fence_collision_extra: number = 4 / 8;

	//create fences for all solid nodes
	for (const [name, def] of pairs(core.registered_nodes)) {
		if (typeof name == "number") {
			core.log(LogLevel.warning, "iterator had a number?");
			continue;
		}

		if (def.drawtype == Drawtype.normal && string.match(name, "main:")) {
			// Set up fence.
			const def2: NodeDefinition = table.copy(
				def as LuaTable
			) as NodeDefinition;

			const newname: string =
				"walls:" + string.gsub(name, "main:", "") + "_fence";
			def2.mod_origin = "walls";

			// def2.name = newname

			def2.description = def.description + " Fence";
			def2.drop = newname;
			def2.paramtype = ParamType1.light;
			def2.drawtype = Drawtype.nodebox;
			// def2.on_dig = nil

			def2.node_box = {
				type: Nodeboxtype.connected,
				fixed: [-1 / 8, -1 / 2, -1 / 8, 1 / 8, 1 / 2, 1 / 8],

				connect_front: [
					[-1 / 16, 3 / 16, -1 / 2, 1 / 16, 5 / 16, -1 / 8],
					[-1 / 16, -5 / 16, -1 / 2, 1 / 16, -3 / 16, -1 / 8],
				],
				connect_left: [
					[-1 / 2, 3 / 16, -1 / 16, -1 / 8, 5 / 16, 1 / 16],
					[-1 / 2, -5 / 16, -1 / 16, -1 / 8, -3 / 16, 1 / 16],
				],
				connect_back: [
					[-1 / 16, 3 / 16, 1 / 8, 1 / 16, 5 / 16, 1 / 2],
					[-1 / 16, -5 / 16, 1 / 8, 1 / 16, -3 / 16, 1 / 2],
				],
				connect_right: [
					[1 / 8, 3 / 16, -1 / 16, 1 / 2, 5 / 16, 1 / 16],
					[1 / 8, -5 / 16, -1 / 16, 1 / 2, -3 / 16, 1 / 16],
				],
			};

			def2.collision_box = {
				type: Nodeboxtype.connected,
				fixed: [
					-1 / 8,
					-1 / 2,
					-1 / 8,
					1 / 8,
					1 / 2 + fence_collision_extra,
					1 / 8,
				],
				// connect_top =
				// connect_bottom =
				connect_front: [
					-1 / 8,
					-1 / 2,
					-1 / 2,
					1 / 8,
					1 / 2 + fence_collision_extra,
					-1 / 8,
				],
				connect_left: [
					-1 / 2,
					-1 / 2,
					-1 / 8,
					-1 / 8,
					1 / 2 + fence_collision_extra,
					1 / 8,
				],
				connect_back: [
					-1 / 8,
					-1 / 2,
					1 / 8,
					1 / 8,
					1 / 2 + fence_collision_extra,
					1 / 2,
				],
				connect_right: [
					1 / 8,
					-1 / 2,
					-1 / 8,
					1 / 2,
					1 / 2 + fence_collision_extra,
					1 / 8,
				],
			};

			def2.connects_to = [
				"group:fence",
				"group:wood",
				"group:tree",
				"group:wall",
				"group:stone",
				"group:sand",
			];
			def2.sunlight_propagates = true;
			core.register_node(newname, def2);
			core.register_craft({
				output: newname + " 16",
				recipe: [
					[name, "main:stick", name],
					[name, "main:stick", name],
				],
			});
		}
	}

	// Create wall posts.
	for (const [name, def] of pairs(core.registered_nodes)) {
		if (typeof name == "number") {
			core.log(LogLevel.warning, "iterator had a number?");
			continue;
		}

		if (def.drawtype == Drawtype.normal && string.match(name, "main:")) {
			//set up wall
			const def2: NodeDefinition = table.copy(
				def as LuaTable
			) as NodeDefinition;
			const newname: string =
				"walls:" + string.gsub(name, "main:", "") + "_wall_post";
			def2.description = def.description + " Wall";
			def2.mod_origin = "walls";
			// def2.name = newname
			def2.drop = newname;
			def2.paramtype = ParamType1.light;
			def2.drawtype = Drawtype.nodebox;

			//def2.on_place = function(itemstack, placer, pointed_thing)
			//	core.item_place(itemstack, placer, pointed_thing)
			//	wall_placing(pointed_thing.above,newname)
			//end

			def2.node_box = {
				type: Nodeboxtype.connected,
				disconnected_sides: [
					-4 / 16,
					-1 / 2,
					-4 / 16,
					4 / 16,
					9 / 16,
					4 / 16,
				],
				connect_front: [-2 / 16, -1 / 2, -1 / 2, 2 / 16, 1 / 2, 2 / 16],
				connect_left: [-1 / 2, -1 / 2, -2 / 16, 2 / 16, 1 / 2, 2 / 16],
				connect_back: [-2 / 16, -1 / 2, -2 / 16, 2 / 16, 1 / 2, 1 / 2],
				connect_right: [-2 / 16, -1 / 2, -2 / 16, 1 / 2, 1 / 2, 2 / 16],
			};
			def2.collision_box = {
				type: Nodeboxtype.connected,
				fixed: [
					-1 / 8,
					-1 / 2,
					-1 / 8,
					1 / 8,
					1 / 2 + fence_collision_extra,
					1 / 8,
				],
				// connect_top =
				// connect_bottom =
				connect_front: [
					-2 / 16,
					-1 / 2,
					-1 / 2,
					2 / 16,
					1 / 2 + fence_collision_extra,
					2 / 16,
				],
				connect_left: [
					-1 / 2,
					-1 / 2,
					-2 / 16,
					2 / 16,
					1 / 2 + fence_collision_extra,
					2 / 16,
				],
				connect_back: [
					-2 / 16,
					-1 / 2,
					-2 / 16,
					2 / 16,
					1 / 2 + fence_collision_extra,
					1 / 2,
				],
				connect_right: [
					-2 / 16,
					-1 / 2,
					-2 / 16,
					1 / 2,
					1 / 2 + fence_collision_extra,
					2 / 16,
				],
			};
			if (def2.groups == null) {
				def2.groups = {};
			}
			def2.groups["fence"] = 1;
			def2.connects_to = [
				"group:fence",
				"group:wood",
				"group:tree",
				"group:wall",
				"group:stone",
				"group:sand",
			];
			def2.sunlight_propagates = true;
			core.register_node(newname, def2);
			core.register_craft({
				output: newname + " 16",
				recipe: [
					[name, "main:iron", name],
					[name, name, name],
				],
			});
		}
	}

	// Create window.

	const def: NodeDefinition | null = core.registered_nodes["main:glass"];
	if (!def) {
		throw new Error("Glass is undefined.");
	}

	// Set up wall.
	const def2: NodeDefinition = table.copy(def as LuaTable) as NodeDefinition;
	const newname: string = "walls:window";
	def2.description = "Window";
	def2.mod_origin = "walls";
	def2.drop = "";
	def2.paramtype = ParamType1.light;
	def2.drawtype = Drawtype.nodebox;
	//def2.on_place = function(itemstack, placer, pointed_thing)
	//	core.item_place(itemstack, placer, pointed_thing)
	//	wall_placing(pointed_thing.above,newname)
	//end
	def2.node_box = {
		type: Nodeboxtype.connected,
		disconnected_sides: [
			[-1 / 16, -1 / 2, -1 / 2, 1 / 16, 1 / 2, 1 / 16],
			[-1 / 2, -1 / 2, -1 / 16, 1 / 16, 1 / 2, 1 / 16],
			[-1 / 16, -1 / 2, -1 / 16, 1 / 16, 1 / 2, 1 / 2],
			[-1 / 16, -1 / 2, -1 / 16, 1 / 2, 1 / 2, 1 / 16],
		],
		// connect_top =
		// connect_bottom =
		connect_front: [-1 / 16, -1 / 2, -1 / 2, 1 / 16, 1 / 2, 1 / 16],
		connect_left: [-1 / 2, -1 / 2, -1 / 16, 1 / 16, 1 / 2, 1 / 16],
		connect_back: [-1 / 16, -1 / 2, -1 / 16, 1 / 16, 1 / 2, 1 / 2],
		connect_right: [-1 / 16, -1 / 2, -1 / 16, 1 / 2, 1 / 2, 1 / 16],
	};

	// def2.connects_to = {"group:fence", "group:wood", "group:wall", "group:stone", "group:sand","group:glass"}
	// def2.sunlight_propagates = true
	// core.register_node(newname,def2)

	// core.register_craft({
	// 	output = newname .. " 16",
	// 	recipe = {
	// 		{ "main:glass", "main:glass" },
	// 		{ "main:glass", "main:glass" },
	// 	}
	// })
}
