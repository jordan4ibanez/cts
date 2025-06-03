// Grass spread abm.
namespace crafter {
	core.register_abm({
		label: "Grass Grow",
		nodenames: ["crafter:dirt"],
		neighbors: ["crafter:grass", "air"],
		interval: 10,
		chance: 1000,
		action: (pos: Vec3) => {
			const light: number | null = core.get_node_light(pos, null);
			// print(light)
			if (!light || light < 10) {
				return;
			}
			core.set_node(pos, { name: "crafter:grass" });
		},
	});
}
