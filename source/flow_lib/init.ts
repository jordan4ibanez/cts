// this is from https://github.com/HybridDog/builtin_item/blob/e6dfd9dce86503b3cbd1474257eca5f6f6ca71c2/init.lua#L50

namespace flowLib {
	interface FlowNode {
		pos: Vec3;
		node: NodeTable;
	}

	function get_nodes(pos: Vec3): FlowNode[] {
		const tab: FlowNode[] = [];

		for (let i = -1; i <= 1; i += 2) {
			const data = [
				vector.create3d({ x: pos.x + i, y: pos.y, z: pos.z }),
				vector.create3d({ x: pos.x, y: pos.y, z: pos.z + i }),
			];

			for (const p of data) {
				tab.push({
					pos: p,
					node: core.get_node(p),
				});
			}
		}

		return tab;
	}

	export function flow(pos: Vec3): Vec3 | null {
		const c_node = core.get_node(pos).name;

		if (c_node != "main:waterflow" && c_node != "main:water") {
			return null;
		}

		const data: FlowNode[] = get_nodes(pos);

		const param2: number | undefined = core.get_node(pos).param2;

		if (param2 == null) {
			return null;
		}

		if (param2 > 7) {
			return null;
		}

		if (c_node == "main:water") {
			for (const i of data) {
				const par2: number | undefined = i.node.param2;

				if (
					i.node.name == "main:waterflow" &&
					par2 != null &&
					par2 == 7
				) {
					return vector.subtract(i.pos, pos);
				}
			}
		}

		for (const i of data) {
			const par2: number | undefined = i.node.param2;
			if (
				i.node.name == "main:waterflow" &&
				par2 != null &&
				par2 < param2
			) {
				return vector.subtract(i.pos, pos);
			}
		}

		for (const i of data) {
			const par2: number | undefined = i.node.param2;
			if (i.node.name == "main:waterflow" && par2 != null && par2 >= 11) {
				return vector.subtract(i.pos, pos);
			}
		}

		for (const i of data) {
			const name: string = i.node.name;
			const tmp: NodeDefinition | null = core.registered_nodes[name];
			if (
				tmp != null &&
				!tmp.walkable &&
				name != "main:waterflow" &&
				name != "main:water"
			) {
				return vector.subtract(i.pos, pos);
			}
		}

		return null;
	}
}
