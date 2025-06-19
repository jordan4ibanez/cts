namespace hopper {
	export const containers: Dictionary<string, any> = {};
	export const groups: Dictionary<string, any> = {};
	export const neighbors: Dictionary<string, any> = {};

	export interface HopperComponent {
		node: string;
		inv: string;
	}

	export interface HopperRegistrationDefinition {
		top?: HopperComponent[];
		bottom?: HopperComponent[];
		side?: HopperComponent[];
	}

	// Global function to add new containers.
	export function add_container(list: HopperRegistrationDefinition) {
		// for (const [_, entry] of pairs(list)) {
		// 	const target_node = entry[1];
		// 	let neighbor_node: string = "";
		// 	if (string.sub(target_node, 1, 6) == "group:") {
		// 		let group_identifier: string | null = null;
		// 		let group_number: number | string | null = null;
		// 		const [equals_index, _] = string.find(target_node, "=");
		// 		if (equals_index != null) {
		// 			group_identifier = string.sub(
		// 				target_node,
		// 				7,
		// 				equals_index - 1
		// 			);
		// 			// It's possible that the string was of the form "group:blah = 1", in which case we want to trim spaces off the end of the group identifier.
		// 			const [space_index] = string.find(group_identifier, " ");
		// 			if (space_index != null) {
		// 				group_identifier = string.sub(
		// 					group_identifier,
		// 					1,
		// 					space_index - 1
		// 				);
		// 			}
		// 			group_number =
		// 				tonumber(
		// 					string.sub(target_node, equals_index + 1, -1)
		// 				) || 0;
		// 		} else {
		// 			group_identifier = string.sub(target_node, 7, -1);
		// 			// special value to indicate no number was provided.
		// 			group_number = "all";
		// 		}
		// 		let group_info: Dictionary<string, any> =
		// 			hopper.groups[group_identifier];
		// 		if (group_info == null) {
		// 			group_info = {};
		// 		}
		// 		if (group_info[group_number] == null) {
		// 			group_info[group_number] = {};
		// 		}
		// 		group_info[group_number][entry[0]] = entry[2];
		// 		hopper.groups[group_identifier] = group_info;
		// 		neighbor_node = "group:" + group_identifier;
		// 		// Result is a table of the form groups[group_identifier][group_number][relative_position][inventory_name].
		// 	} else {
		// 		let node_info = hopper.containers[target_node];
		// 		if (node_info == null) {
		// 			node_info = {};
		// 		}
		// 		node_info[entry[0]] = entry[2];
		// 		hopper.containers[target_node] = node_info;
		// 		neighbor_node = target_node;
		// 		// Result is a table of the form containers[target_node_name][relative_position][inventory_name].
		// 	}
		// 	let already_in_neighbors: boolean = false;
		// 	for (const [_, value] of pairs(neighbors)) {
		// 		if (value == neighbor_node) {
		// 			already_in_neighbors = true;
		// 			break;
		// 		}
		// 	}
		// 	if (!already_in_neighbors) {
		// 		table.insert(neighbors, neighbor_node);
		// 	}
		// }
	}

	// "top" indicates what inventory the hopper will take items from if this node is located at the hopper's wide end.
	// "side" indicates what inventory the hopper will put items into if this node is located at the hopper's narrow end and at the same height as the hopper.
	// "bottom" indicates what inventory the hopper will put items into if this node is located at the hopper's narrow end and either above or below the hopper.

	hopper.add_container({
		top: [{ node: "hopper:hopper", inv: "main" }],

		// 	{"bottom", "hopper:hopper", "main"},
		// 	{"bottom", "hopper:chute", "main"},
		// 	{"bottom", "hopper:sorter", "main"},
		// 	{"side", "hopper:hopper", "main"},
		// 	{"side", "hopper:hopper_side", "main"},
		// 	{"side", "hopper:chute", "main"},
		// 	{"side", "hopper:sorter", "main"},
	});

	// hopper:add_container({
	// 	{"top", "utility:chest", "main"},
	// 	{"bottom", "utility:chest", "main"},
	// 	{"side", "utility:chest", "main"},
	// 	{"top", "utility:chest_open", "main"},
	// 	{"bottom", "utility:chest_open", "main"},
	// 	{"side", "utility:chest_open", "main"},
	// 	{"top", "utility:furnace", "dst"},
	// 	{"bottom", "utility:furnace", "src"},
	// 	{"side", "utility:furnace", "fuel"},
	// 	{"top", "utility:furnace_active", "dst"},
	// 	{"bottom", "utility:furnace_active", "src"},
	// 	{"side", "utility:furnace_active", "fuel"},
	// })
}
