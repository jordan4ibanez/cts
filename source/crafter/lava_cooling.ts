namespace crafter {
core.register_abm({
	label: "Lava cooling",
	nodenames: ["crafter:lava"],
	neighbors: ["crafter:water", "crafter:waterflow"],
	interval: 1.0,
	chance: 5.0,
	catch_up: false,
	action: (pos: Vec3) => {
		core.set_node(pos, { name: "nether:obsidian" });
	},
});

core.register_abm({
	label: "Lava cooling",
	nodenames: ["crafter:lavaflow"],
	neighbors: ["crafter:water", "crafter:waterflow"],
	interval: 1.0,
	chance: 5.0,
	catch_up: false,
	action: (pos: Vec3) => {
		core.set_node(pos, { name: "crafter:cobble" });
	},
});
}