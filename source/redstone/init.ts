namespace redstone {
	// todo: Retool this entire mod as "bluestone" so I don't hear any complaints about mc
	const hashPosition = core.hash_node_position;
	const workerVec: Vec3 = vector.create3d();

	export const maxState: number = 9;

	// todo: Add a change queue. Reflect changes onto the map once every 0.2 seconds.
	// todo: Serialize the virtual machine AND the update queue so that it continues on after server restarts.

	interface RedstoneData {
		powerSource: number;
	}

	//? Virtual machine.

	function debugMap(pos?: Vec3): void {
		print(memoryMap.size);
	}

	// The entirety of redstone data is simulated in memory and reflected into the map in a designated interval (if any changes).
	const memoryMap = new Map<number, RedstoneData>();

	/**
	 * Add data into the memory map. This will trigger an update.
	 * @param pos The position where this data is to be added.
	 * @param data The data of the position. This can be dust, or a power source, etc.
	 */
	export function addData(pos: Vec3, data: RedstoneData): void {
		const index: number = hashPosition(pos);
		memoryMap.set(index, data);
		enqueueUpdate(index);
		debugMap();
	}

	/**
	 * Delete data from the memory map. This will trigger an update.
	 * @param pos The position where this data is to be deleted.
	 */
	export function deleteData(pos: Vec3): void {
		const index: number = hashPosition(pos);
		memoryMap.delete(index);
		enqueueUpdate(index);
		debugMap();
	}

	//? Update queue.

	// Updates exist in a FIFO queue to ensure that the side effects are exactly ordered as they were created.
	const updateQueue = new utility.QueueFIFO<number>();

	/**
	 * Create an update in the virtual machine. Use [core.hash_node_position] to interface with this.
	 * @param positionHashed The hashed position of the update.
	 */
	function enqueueUpdate(positionHashed: number): void {
		updateQueue.push(positionHashed);
	}

	//? Update map.

	interface RedstoneUpdateMapData extends RedstoneData {
		exists: boolean;
	}

	// The update map is very simple in concept.
	// The max cubic width an update can have is: [(maxState * 2) + 1]
	// This data is trapped inside of a persistent cube,
	// The data begins it's life as completely blank data.
	// This data is then copied from the virtual machine memory map into originating
	// at the update position.
	// You can think of this cube as moving around the map invisibly. It is everywhere, and nowhere.
	const updateMap: Map<number, RedstoneUpdateMapData> = (() => {
		const virtualMap = new Map<number, RedstoneUpdateMapData>();
		for (const x of $range(-maxState, maxState)) {
			for (const y of $range(-maxState, maxState)) {
				for (const z of $range(-maxState, maxState)) {
					workerVec.x = x;
					workerVec.y = y;
					workerVec.z = z;
					virtualMap.set(hashPosition(workerVec), {
						exists: false,
						powerSource: 0,
					});
				}
			}
		}
		return virtualMap;
	})();

	function clearUpdateMap(): void {
		for (const x of $range(-maxState, maxState)) {
			for (const y of $range(-maxState, maxState)) {
				for (const z of $range(-maxState, maxState)) {
					workerVec.x = x;
					workerVec.y = y;
					workerVec.z = z;

					const data: RedstoneUpdateMapData | undefined =
						updateMap.get(hashPosition(workerVec));

					if (data == null) {
						throw new Error("Update map logic error.");
					}

					data.exists = false;
				}
			}
		}
	}

	/**
	 * This will copy the virtual machine memory into the update map memory.
	 * @param pos The real world position.
	 */
	function copyMemoryMapIntoUpdateMap(pos: Vec3): void {
		// todo: Any dust at the borders is a power source, if powered.
		clearUpdateMap();

		const minX: number = pos.x - maxState;
		const minY: number = pos.y - maxState;
		const minZ: number = pos.z - maxState;

		const manX: number = pos.x + maxState;
		const manY: number = pos.y + maxState;
		const manZ: number = pos.z + maxState;
	}

	utility.loadFiles([
		// "functions",
		"torch",
		// "lever",
		// "button",
		// "repeater",
		// "light",
		// "piston",
		// // //dofile(path+"/comparator",
		// "craft",
		// "ore",
		// "inverter",
		// "player_detector",
		// "space_maker",
		// "pressure_plate",
		// "capacitors",
		// "breaker",
		// "detector",
		// "dispenser",
	]);
}
