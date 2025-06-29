namespace redstone {
	// todo: Retool this entire mod as "bluestone" so I don't hear any complaints about mc
	const hashPosition = core.hash_node_position;
	const unhashPosition = core.get_position_from_hash;
	const workerVec: Vec3 = vector.create3d();
	const absolute = math.abs;

	export const maxState: number = 9;

	// todo: Add a change queue. Reflect changes onto the map once every 0.2 seconds.
	// todo: Serialize the virtual machine AND the update queue so that it continues on after server restarts.

	interface RedstoneData {
		isPowerSource: boolean;
		powerSource: number;
		isDust: boolean;
		dust: number;
	}

	//? Virtual machine.

	function debugMap(pos?: Vec3): void {
		// print(memoryMap.size);
	}

	// The entirety of redstone data is simulated in memory and reflected into the map in a designated interval (if any changes).
	const memoryMap = new Map<number, RedstoneData>();

	/**
	 * Add data into the memory map. This will trigger an update.
	 * @param pos The position where this data is to be added.
	 * @param data The data of the position. This can be dust, or a power source, etc.
	 */
	export function addData(pos: Vec3, data: RedstoneData): void {
		const positionHash: number = hashPosition(pos);
		memoryMap.set(positionHash, data);
		enqueueUpdate(positionHash);
		debugMap();
	}

	/**
	 * Delete data from the memory map. This will trigger an update.
	 * @param pos The position where this data is to be deleted.
	 */
	export function deleteData(pos: Vec3): void {
		const positionHash: number = hashPosition(pos);
		memoryMap.delete(positionHash);
		enqueueUpdate(positionHash);
		debugMap();
	}

	//? Update queue.

	// Updates exist in a FIFO queue to ensure that the side effects are exactly ordered as they were created.
	const updateQueue = new utility.QueueFIFO<number>();

	/**
	 * Create an update in the virtual machine. Use [core.hash_node_position] to interface with this.
	 * @param positionHash The hashed position of the update.
	 */
	function enqueueUpdate(positionHash: number): void {
		updateQueue.push(positionHash);
	}

	//? Update map.

	interface UpdateMapData extends RedstoneData {
		exists: boolean;
		wasPowered: boolean;
	}

	// The update map is very simple in concept.
	// The max cubic width an update can have is: [(maxState * 2) + 1]
	// This data is trapped inside of a persistent cube,
	// The data begins it's life as completely blank data.
	// This data is then copied from the virtual machine memory map into originating
	// at the update position.
	// You can think of this cube as moving around the map invisibly. It is everywhere, and nowhere.
	const updateMap: Map<number, UpdateMapData> = (() => {
		const virtualMap = new Map<number, UpdateMapData>();
		for (const x of $range(-maxState, maxState)) {
			for (const y of $range(-maxState, maxState)) {
				for (const z of $range(-maxState, maxState)) {
					workerVec.x = x;
					workerVec.y = y;
					workerVec.z = z;
					virtualMap.set(hashPosition(workerVec), {
						exists: false,
						isPowerSource: false,
						powerSource: 0,
						isDust: false,
						dust: 0,
						wasPowered: false,
					});
				}
			}
		}
		return virtualMap;
	})();

	const powerSources = new utility.QueueFIFO<number>();

	function clearUpdateMap(): void {
		let positionHash: number = 0;
		let data: UpdateMapData | undefined = undefined;

		for (const x of $range(-maxState, maxState)) {
			for (const y of $range(-maxState, maxState)) {
				for (const z of $range(-maxState, maxState)) {
					workerVec.x = x;
					workerVec.y = y;
					workerVec.z = z;

					positionHash = hashPosition(workerVec);

					data = updateMap.get(positionHash);

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
		// clearUpdateMap();

		for (const x of $range(-maxState, maxState)) {
			for (const y of $range(-maxState, maxState)) {
				for (const z of $range(-maxState, maxState)) {
					workerVec.x = x;
					workerVec.y = y;
					workerVec.z = z;

					const updateMapPositionHash: number =
						hashPosition(workerVec);

					workerVec.x += pos.x;
					workerVec.y += pos.y;
					workerVec.z += pos.z;

					const worldPositionHash: number = hashPosition(workerVec);

					const worldData: RedstoneData | undefined =
						memoryMap.get(worldPositionHash);

					const updateData: UpdateMapData | undefined = updateMap.get(
						updateMapPositionHash
					);

					if (updateData == null) {
						throw new Error(`Logic error of ${x}, ${y}, ${z}`);
					}

					if (worldData == null) {
						updateData.exists = false;
					} else {
						const border: boolean =
							absolute(x) == maxState ||
							absolute(y) == maxState ||
							absolute(z) == maxState;

						updateData.exists = true;

						// If the dust is on the edge of the update map, it is now a power source calculation wise.
						if (border && worldData.isDust && worldData.dust > 1) {
							updateData.isPowerSource = true;
							updateData.powerSource = worldData.dust;
							updateData.isDust = true;
							updateData.dust = worldData.dust;
							powerSources.push(updateMapPositionHash);
						} else {
							if (worldData.isPowerSource) {
								powerSources.push(updateMapPositionHash);
							}
							updateData.isPowerSource = worldData.isPowerSource;
							updateData.powerSource = worldData.powerSource;
							updateData.isDust = worldData.isDust;
							updateData.dust = 0;
							updateData.wasPowered = worldData.dust > 0;
						}
					}
				}
			}
		}
	}

	/**
	 * All power sources reflect outwards.
	 */
	function doLogic() {
		while (powerSources.length() > 0) {
			const sourceHash: number | undefined = powerSources.pop();
			if (sourceHash == null) {
				throw new Error("Logic issue.");
			}

			const data: UpdateMapData | undefined = updateMap.get(sourceHash);

			if (data == null) {
				throw new Error("Map poll logic error.");
			}

			// unhashPosition()
		}
	}

	//? This is how the logic is unwrapped and side effects are run.
	core.register_globalstep((delta: number) => {
		if (updateQueue.length() <= 0) {
			return;
		}
		const data: number | undefined = updateQueue.pop();
		if (data == null) {
			throw new Error("Logic issue.");
		}

		const updatePosition: Vec3 = unhashPosition(data);

		print(`update at: ${updatePosition}`);

		const start: number = core.get_us_time() / 1_000_000;

		copyMemoryMapIntoUpdateMap(updatePosition);

		const end: number = core.get_us_time() / 1_000_000;
		const total: number = end - start;
		print("took: ", total);
	});

	utility.loadFiles([
		// "functions",
		"torch",
		"dust",
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
