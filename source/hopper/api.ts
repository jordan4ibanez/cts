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
}
