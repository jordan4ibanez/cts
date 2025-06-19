namespace hopper {
	export const containers: Dictionary<string, ContainerData> = {};
	export const neighbors = new Set<string>();

	export interface ContainerData {
		top?: string;
		bottom?: string;
		side?: string;
	}

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

	// Global function to add new containers.
	export function add_container(list: HopperRegistrationDefinition) {
		for (const key of keySet) {
			const componentArray: HopperComponent[] | undefined = list[key];

			if (componentArray == null) {
				continue;
			}

			// This is a modular construction of neighbor component data.
			for (const component of componentArray) {
				const neighborNode: string = component.neighborNode;

				// Create the object if it does not already exist.
				const newNeighborData: ContainerData =
					containers[neighborNode] || {};

				// keyof HopperComponent is equal to NeighborData so it can be safety synchronized and used as a key.
				// Push the new data component into the object via the key.
				newNeighborData[key] = component.inv;

				// Now update the data in the container dictionary.
				containers[neighborNode] = newNeighborData;

				neighbors.add(neighborNode);
			}
		}
	}

	// "top" indicates what inventory the hopper will take items from if this node is located at the hopper's wide end.
	// "side" indicates what inventory the hopper will put items into if this node is located at the hopper's narrow end and at the same height as the hopper.
	// "bottom" indicates what inventory the hopper will put items into if this node is located at the hopper's narrow end and either above or below the hopper.
	hopper.add_container({
		top: [{ neighborNode: "hopper:hopper", inv: "main" }],
		bottom: [
			{ neighborNode: "hopper:hopper", inv: "main" },
			{ neighborNode: "hopper:chute", inv: "main" },
			{ neighborNode: "hopper:sorter", inv: "main" },
		],
		side: [
			{ neighborNode: "hopper:hopper", inv: "main" },
			{ neighborNode: "hopper:hopper_side", inv: "main" },
			{ neighborNode: "hopper:chute", inv: "main" },
			{ neighborNode: "hopper:sorter", inv: "main" },
		],
	});

	hopper.add_container({
		top: [
			{ neighborNode: "utility:chest", inv: "main" },
			{ neighborNode: "utility:chest_open", inv: "main" },
			{ neighborNode: "utility:furnace", inv: "dst" },
			{ neighborNode: "utility:furnace_active", inv: "dst" },
		],
		bottom: [
			{ neighborNode: "utility:chest", inv: "main" },
			{ neighborNode: "utility:chest_open", inv: "main" },
			{ neighborNode: "utility:furnace", inv: "src" },
			{ neighborNode: "utility:furnace_active", inv: "src" },
		],
		side: [
			{ neighborNode: "utility:chest", inv: "main" },
			{ neighborNode: "utility:chest_open", inv: "main" },
			{ neighborNode: "utility:furnace", inv: "fuel" },
			{ neighborNode: "utility:furnace_active", inv: "fuel" },
		],
	});
}
