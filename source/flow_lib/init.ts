// this is from https://github.com/HybridDog/builtin_item/blob/e6dfd9dce86503b3cbd1474257eca5f6f6ca71c2/init.lua#L50
// local
// minetest,vector,math,pairs
// =
// minetest,vector,math,pairs

namespace flowLib {
	// local tab
	// local n

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

	// local data
	// local param2
	// local nd
	// local par2
	// local name
	// local tmp
	// local c_node

	function get_flowing_dir(pos: Vec3) {
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

				if (i.node.name == "main:waterflow" && par2 && par2 == 7) {
					return vector.subtract(i.pos, pos);
				}
			}
		}

		// for _,i in pairs(data) do
		// 	nd = i[2]
		// 	name = nd.name
		// 	par2 = nd.param2
		// 	if name == "main:waterflow" and par2 < param2 then
		// 		return(vector.subtract(i[1],pos))
		// 	end
		// end

		// for _,i in pairs(data) do
		// 	nd = i[2]
		// 	name = nd.name
		// 	par2 = nd.param2
		// 	if name == "main:waterflow" and par2 >= 11 then
		// 		return(vector.subtract(i[1],pos))
		// 	end
		// end

		// for _,i in pairs(data) do
		// 	nd = i[2]
		// 	name = nd.name
		// 	par2 = nd.param2
		// 	tmp = core.registered_nodes[name]
		// 	if tmp and not tmp.walkable and name ~= "main:waterflow" and name ~= "main:water" then
		// 		return(vector.subtract(i[1],pos))
		// 	end
		// end

		// return nil
	}

	// function flow(pos)
	// 	return(get_flowing_dir(pos))
	// end
}
