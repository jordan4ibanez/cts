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
		directional_activator: boolean;
		input: number;
		output: number;
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
		const positionHash: number = hashPosition(pos);
		memoryMap.set(positionHash, data);
		enqueueUpdate(positionHash);
	}

	/**
	 * Delete data from the memory map. This will trigger an update.
	 * @param pos The position where this data is to be deleted.
	 */
	export function deleteData(pos: Vec3): void {
		const positionHash: number = hashPosition(pos);
		memoryMap.delete(positionHash);
		enqueueUpdate(positionHash);
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
						directional_activator: false,
						input: 0,
						output: 0,
					});
				}
			}
		}
		return virtualMap;
	})();

	/** Where the update map currently exists in the world. */
	let updateMapworldPosition: number = 0;

	/** The power sources that exist in the update map. */
	const powerSources = new utility.QueueFIFO<number>();

	/**
	 * This will copy the virtual machine memory into the update map memory.
	 * @param pos The real world position.
	 */
	function copyMemoryMapIntoUpdateMap(pos: Vec3): void {
		updateMapworldPosition = hashPosition(pos);

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

						if (
							worldData.isPowerSource ||
							(border && worldData.isDust && worldData.dust > 0)
						) {
							powerSources.push(updateMapPositionHash);
							updateData.dust = worldData.dust;
						} else {
							updateData.dust = 0;
						}
						updateData.isPowerSource = worldData.isPowerSource;
						updateData.powerSource = worldData.powerSource;
						updateData.isDust = worldData.isDust;
						updateData.wasPowered = worldData.dust > 0;
						updateData.directional_activator =
							worldData.directional_activator;
						updateData.input = worldData.input;
						updateData.output = worldData.output;
					}
				}
			}
		}
	}

	const dustDirections: readonly Vec3[] = [
		vector.create3d({ x: 1, y: 0, z: 0 }),
		vector.create3d({ x: -1, y: 0, z: 0 }),
		vector.create3d({ x: 0, y: 0, z: 1 }),
		vector.create3d({ x: 0, y: 0, z: -1 }),
		vector.create3d({ x: 0, y: 1, z: 0 }),
		vector.create3d({ x: 0, y: -1, z: 0 }),
		vector.create3d({ x: 1, y: 1, z: 0 }),
		vector.create3d({ x: -1, y: 1, z: 0 }),
		vector.create3d({ x: 0, y: 1, z: 1 }),
		vector.create3d({ x: 0, y: 1, z: -1 }),
		vector.create3d({ x: 1, y: -1, z: 0 }),
		vector.create3d({ x: -1, y: -1, z: 0 }),
		vector.create3d({ x: 0, y: -1, z: 1 }),
		vector.create3d({ x: 0, y: -1, z: -1 }),
	];

	const allSidesDirections: readonly Vec3[] = [
		vector.create3d({ x: 1, y: 0, z: 0 }),
		vector.create3d({ x: -1, y: 0, z: 0 }),
		vector.create3d({ x: 0, y: 0, z: 1 }),
		vector.create3d({ x: 0, y: 0, z: -1 }),
		vector.create3d({ x: 0, y: 1, z: 0 }),
		vector.create3d({ x: 0, y: -1, z: 0 }),
	];

	// Recursive.
	function transmitThroughDust(positionHash: number): void {
		const currentData: UpdateMapData | undefined =
			updateMap.get(positionHash);

		if (currentData == null || !currentData.exists || !currentData.isDust) {
			throw new Error("Logic error at dust.");
		}

		const outputPower: number = currentData.dust - 1;

		if (outputPower <= 0) {
			return;
		}

		const currentPosition: Vec3 = unhashPosition(positionHash);

		for (const dir of dustDirections) {
			workerVec.x = currentPosition.x + dir.x;
			workerVec.y = currentPosition.y + dir.y;
			workerVec.z = currentPosition.z + dir.z;

			const forwardPositionHash: number = hashPosition(workerVec);
			const forwardData: UpdateMapData | undefined =
				updateMap.get(forwardPositionHash);

			// Either out of bounds, or, hit the edge of the update map.
			if (forwardData == null || !forwardData.exists) {
				continue;
			}

			if (forwardData.isDust && forwardData.dust < outputPower) {
				forwardData.dust = outputPower;

				// There is no need to continue at power level 1.
				// It would transmit 0.
				if (outputPower > 1) {
					transmitThroughDust(forwardPositionHash);
				}
			}
		}
	}

	function allDirectionalPowerSourceTrigger(sourcePosition: Vec3): void {
		const thisData: UpdateMapData | undefined = updateMap.get(
			hashPosition(sourcePosition)
		);
		if (thisData == null) {
			throw new Error("Logic error at all directional power source.");
		}

		for (const dir of allSidesDirections) {
			workerVec.x = sourcePosition.x + dir.x;
			workerVec.y = sourcePosition.y + dir.y;
			workerVec.z = sourcePosition.z + dir.z;

			const forwardPositionHash: number = hashPosition(workerVec);

			const forwardData: UpdateMapData | undefined =
				updateMap.get(forwardPositionHash);

			// Either out of bounds, or, hit the edge of the update map.
			if (forwardData == null || !forwardData.exists) {
				continue;
			}

			if (forwardData.isDust) {
				forwardData.dust = thisData.powerSource - 1;
				// And now, the recursion will begin.
				// This function will attempt to sniff out any other dust within range and transmit.
				// Power reduction is equal to one node per unit.
				transmitThroughDust(forwardPositionHash);
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

			if (data.isPowerSource) {
				const sourcePosition: Vec3 = unhashPosition(sourceHash);
				allDirectionalPowerSourceTrigger(sourcePosition);
			} else {
				transmitThroughDust(sourceHash);
			}
		}
	}

	//? Writeback.

	enum RedstoneTrigger {
		on,
		off,
	}

	function triggerSideEffectsAllSides(
		positionHash: number,
		sideEffect: RedstoneTrigger
	): void {
		


	}

	function writeBackSideEffects(
		currentData: UpdateMapData,
		realWorldHash: number,
		atPosition: boolean
	): void {
		// A player placed a torch.
		if (atPosition && currentData.isPowerSource) {
			triggerSideEffectsAllSides(realWorldHash, RedstoneTrigger.on);
			return;
		}

		// Redstone getting turned on or off.
		if (currentData.wasPowered && currentData.dust <= 0) {
			// print("turned off at ", unhashPosition(realWorldHash));
			triggerSideEffectsAllSides(realWorldHash, RedstoneTrigger.off);
		} else if (!currentData.wasPowered && currentData.dust > 0) {
			// print("turned on at ", unhashPosition(realWorldHash));
			triggerSideEffectsAllSides(realWorldHash, RedstoneTrigger.on);
		}
	}

	/**
	 * Write the update map back into the memory map.
	 */
	function writeBack(): void {
		const worldPos = unhashPosition(updateMapworldPosition);

		for (const x of $range(-maxState, maxState)) {
			for (const y of $range(-maxState, maxState)) {
				for (const z of $range(-maxState, maxState)) {
					workerVec.x = x;
					workerVec.y = y;
					workerVec.z = z;

					const currentPositionHash = hashPosition(workerVec);

					const currentData: UpdateMapData | undefined =
						updateMap.get(currentPositionHash);

					if (currentData == null) {
						throw new Error("Writeback logic error.");
					}

					if (!currentData.exists) {
						continue;
					}

					workerVec.x += worldPos.x;
					workerVec.y += worldPos.y;
					workerVec.z += worldPos.z;

					const worldPositionHash: number = hashPosition(workerVec);

					const worldData: RedstoneData | undefined =
						memoryMap.get(worldPositionHash);

					if (worldData == null) {
						throw new Error("Writeback world poll logic error.");
					}

					const atPosition: boolean = x == 0 && y == 0 && z == 0;
					writeBackSideEffects(
						currentData,
						worldPositionHash,
						atPosition
					);

					worldData.isPowerSource = currentData.isPowerSource;
					worldData.powerSource = currentData.powerSource;
					worldData.isDust = currentData.isDust;
					worldData.dust = currentData.dust;
					worldData.directional_activator =
						currentData.directional_activator;
					worldData.input = currentData.input;
					worldData.output = currentData.output;
				}
			}
		}
	}

	//! This is debug ONLY.
	function debugOutputVisual(): void {
		const worldPos = unhashPosition(updateMapworldPosition);

		for (const x of $range(-maxState, maxState)) {
			for (const y of $range(-maxState, maxState)) {
				for (const z of $range(-maxState, maxState)) {
					workerVec.x = x;
					workerVec.y = y;
					workerVec.z = z;

					const currentPositionHash: number = hashPosition(workerVec);

					const currentData: UpdateMapData | undefined =
						updateMap.get(currentPositionHash);

					// Either out of bounds, or, hit the edge of the update map.
					if (currentData == null || !currentData.exists) {
						continue;
					}

					if (currentData.isDust) {
						workerVec.x += worldPos.x;
						workerVec.y += worldPos.y;
						workerVec.z += worldPos.z;

						core.swap_node(workerVec, {
							name: `crafter_redstone:dust_${currentData.dust}`,
						});
					}
				}
			}
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

		// print(`update at: ${updatePosition}`);

		const start: number = core.get_us_time() / 1_000_000;

		copyMemoryMapIntoUpdateMap(updatePosition);
		doLogic();
		writeBack();
		debugOutputVisual();

		const end: number = core.get_us_time() / 1_000_000;
		const total: number = end - start;
		// print("took: ", total);
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
