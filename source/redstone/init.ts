namespace redstone {
	// todo: Retool this entire mod as "bluestone" so I don't hear any complaints about mc
	const hashPosition = core.hash_node_position;

	export const maxState: number = 9;

	// todo: Add a change queue. Reflect changes onto the map once every 0.2 seconds.
	// todo: Serialize the virtual machine AND the update queue so that it continues on after server restarts.

	interface RedstoneData {
		powerSource?: number;
	}

	//? Virtual machine.

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
	}

	/**
	 * Delete data from the memory map. This will trigger an update.
	 * @param pos The position where this data is to be deleted.
	 */
	export function deleteData(pos: Vec3): void {
		const index: number = hashPosition(pos);
		memoryMap.delete(index);
		enqueueUpdate(index);
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
