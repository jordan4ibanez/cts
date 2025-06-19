namespace hopper {
	export const containers: Dictionary<string, any> = {};
	export const groups: Dictionary<string, any> = {};
	export const neighbors = new Set<string>();

	export interface HopperComponent {
		nodeOrGroup: string;
		inv: string;
	}

	export interface HopperRegistrationDefinition {
		top?: HopperComponent[];
		bottom?: HopperComponent[];
		side?: HopperComponent[];
	}

	const keySet: (keyof HopperRegistrationDefinition)[] = [
		"top",
		"bottom",
		"side",
	];

	// Global function to add new containers.
	export function add_container(list: HopperRegistrationDefinition) {
		for (const key of keySet) {
			const componentArray: HopperComponent[] | undefined = list[key];

			if (componentArray == null) {
				continue;
			}

			for (const component of componentArray) {
				const target_node = component.nodeOrGroup;
				let neighbor_node: string | null = null;
				if (string.sub(target_node, 1, 6) == "group:") {
					let group_identifier: string | null = null;

					let group_number: number | string | null = null;

					const [equals_index, _] = string.find(target_node, "=");
					if (equals_index != null) {
						group_identifier = string.sub(
							target_node,
							7,
							equals_index - 1
						);
						// It's possible that the string was of the form "group:blah = 1", in which case we want to trim spaces off the end of the group identifier.
						const [space_index] = string.find(
							group_identifier,
							" "
						);
						if (space_index != null) {
							group_identifier = string.sub(
								group_identifier,
								1,
								space_index - 1
							);
						}
						group_number =
							tonumber(
								string.sub(target_node, equals_index + 1, -1)
							) || 0;
					} else {
						group_identifier = string.sub(target_node, 7, -1);
						// special value to indicate no number was provided.
						group_number = "all";
					}

					let groupInfo: Dictionary<string, any> | null =
						groups[group_identifier];

					if (groupInfo == null) {
						groupInfo = {};
					}

					if (groupInfo[group_number] == null) {
						groupInfo[group_number] = {};
					}

					groupInfo[group_number][key] = component.inv;
					groups[group_identifier] = groupInfo;
					neighbor_node = "group:" + group_identifier;
					// Result is a table of the form groups[group_identifier][group_number][relative_position][inventory_name].
				} else {
					let node_info = containers[target_node];
					if (node_info == null) {
						node_info = {};
					}
					node_info[key] = component.inv;
					containers[target_node] = node_info;
					neighbor_node = target_node;
					// Result is a table of the form containers[target_node_name][relative_position][inventory_name].
				}

				neighbors.add(neighbor_node);
			}
		}
	}

	// "top" indicates what inventory the hopper will take items from if this node is located at the hopper's wide end.
	// "side" indicates what inventory the hopper will put items into if this node is located at the hopper's narrow end and at the same height as the hopper.
	// "bottom" indicates what inventory the hopper will put items into if this node is located at the hopper's narrow end and either above or below the hopper.

	hopper.add_container({
		top: [{ nodeOrGroup: "hopper:hopper", inv: "main" }],
		bottom: [
			{ nodeOrGroup: "hopper:hopper", inv: "main" },
			{ nodeOrGroup: "hopper:chute", inv: "main" },
			{ nodeOrGroup: "hopper:sorter", inv: "main" },
		],
		side: [
			{ nodeOrGroup: "hopper:hopper", inv: "main" },
			{ nodeOrGroup: "hopper:hopper_side", inv: "main" },
			{ nodeOrGroup: "hopper:chute", inv: "main" },
			{ nodeOrGroup: "hopper:sorter", inv: "main" },
		],
	});

	hopper.add_container({
		top: [
			{ nodeOrGroup: "utility:chest", inv: "main" },
			{ nodeOrGroup: "utility:chest_open", inv: "main" },
			{ nodeOrGroup: "utility:furnace", inv: "dst" },
			{ nodeOrGroup: "utility:furnace_active", inv: "dst" },
		],
		bottom: [
			{ nodeOrGroup: "utility:chest", inv: "main" },
			{ nodeOrGroup: "utility:chest_open", inv: "main" },
			{ nodeOrGroup: "utility:furnace", inv: "src" },
			{ nodeOrGroup: "utility:furnace_active", inv: "src" },
		],
		side: [
			{ nodeOrGroup: "utility:chest", inv: "main" },
			{ nodeOrGroup: "utility:chest_open", inv: "main" },
			{ nodeOrGroup: "utility:furnace", inv: "fuel" },
			{ nodeOrGroup: "utility:furnace_active", inv: "fuel" },
		],
	});
}
