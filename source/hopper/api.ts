namespace hopper {
	export const neighbors = new Set<string>();

	export interface HopperComponent {
		neighborNode: string;
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

	// // Global function to add new containers.
	// export function add_container(list: HopperRegistrationDefinition) {
	// 	for (const key of keySet) {
	// 		const componentArray: HopperComponent[] | undefined = list[key];

	// 		if (componentArray == null) {
	// 			continue;
	// 		}

	// 		// This is a modular construction of neighbor component data.
	// 		for (const component of componentArray) {
	// 			// Create the ContainerData object if it does not already exist.
	// 			const newContainerData: ContainerData =
	// 				containers[component.neighborNode] || {};

	// 			// keyof HopperComponent is equal to NeighborData so it can be safety synchronized and used as a key.
	// 			// Push the new data component into the object via the key.
	// 			newContainerData[key] = component.inv;

	// 			// Now update the data in the container dictionary.
	// 			containers[component.neighborNode] = newContainerData;

	// 			// Now push the neighbor data into the set. It will be used for the ABM.
	// 			neighbors.add(component.neighborNode);
	// 		}
	// 	}
	// }

	// "top" indicates what inventory the hopper will take items from if this node is located at the hopper's wide end.
	// "side" indicates what inventory the hopper will put items into if this node is located at the hopper's narrow end and at the same height as the hopper.
	// "bottom" indicates what inventory the hopper will put items into if this node is located at the hopper's narrow end and either above or below the hopper.
	// hopper.add_container({
	// 	top: [{ neighborNode: "crafter_hopper:hopper", inv: "main" }],
	// 	bottom: [
	// 		{ neighborNode: "crafter_hopper:hopper", inv: "main" },
	// 		{ neighborNode: "crafter_hopper:chute", inv: "main" },
	// 		{ neighborNode: "crafter_hopper:sorter", inv: "main" },
	// 	],
	// 	side: [
	// 		{ neighborNode: "crafter_hopper:hopper", inv: "main" },
	// 		{ neighborNode: "crafter_hopper:hopper_side", inv: "main" },
	// 		{ neighborNode: "crafter_hopper:chute", inv: "main" },
	// 		{ neighborNode: "crafter_hopper:sorter", inv: "main" },
	// 	],
	// });

	// hopper.add_container({
	// 	top: [
	// 		{ neighborNode: "crafter_chest:chest", inv: "main" },
	// 		{ neighborNode: "crafter_chest:chest_open", inv: "main" },
	// 		{ neighborNode: "crafter_furnace:furnace", inv: "dst" },
	// 		{ neighborNode: "crafter_furnace:furnace_active", inv: "dst" },
	// 	],
	// 	bottom: [
	// 		{ neighborNode: "crafter_chest:chest", inv: "main" },
	// 		{ neighborNode: "crafter_chest:chest_open", inv: "main" },
	// 		{ neighborNode: "crafter_furnace:furnace", inv: "src" },
	// 		{ neighborNode: "crafter_furnace:furnace_active", inv: "src" },
	// 	],
	// 	side: [
	// 		{ neighborNode: "crafter_chest:chest", inv: "main" },
	// 		{ neighborNode: "crafter_chest:chest_open", inv: "main" },
	// 		{ neighborNode: "crafter_furnace:furnace", inv: "fuel" },
	// 		{ neighborNode: "crafter_furnace:furnace_active", inv: "fuel" },
	// 	],
	// });
}
