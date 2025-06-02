namespace playerAPI {
	// Todo: current animation enum.

	interface ApiPlayerData {
		visual: EntityVisual;
		mesh: string;
		animation_speed: number;
		visual_size: Vec3;
		textures: string[];
		current_animation: string;
		swimming: boolean;
		collisionbox: number[];
		old_controls: PlayerControlObject;
		stepheight: number;
		eye_height: number;
		attached: boolean;
		wield_item: ObjectRef | null;
		sleeping: boolean;
		force_update: boolean;
	}

	const pool = new Map<string, ApiPlayerData>();

	// Set player wield item.
	function update_wield_item(player: ObjectRef): void {
		const name = player.get_player_name();

		const data: ApiPlayerData | undefined = pool.get(name);

		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}

		let object: ObjectRef | null = data.wield_item;
		const item: string = player.get_wielded_item().get_name();

		let entity;

		if (
			object == null ||
			(object != null && object.get_luaentity() == null)
		) {
			object = core.add_entity(
				player.get_pos(),
				"crafter_player_api:item"
			);
			if (object == null) {
				core.log(
					LogLevel.warning,
					`Failed to add wield entity to player [${name}]. Bailing out.`
				);
				return;
			}

			entity = object.get_luaentity() as PlayerHoldingItemEntity | null;

			if (entity != null) {
				entity.set_item(item);
				entity.wielder = name;
				object.set_attach(
					player,
					"Right_Hand",
					vector.create3d(0, 0, 1),
					vector.create3d(180, 270, 180)
				);
				data.wield_item = object;
			} else {
				core.log(
					LogLevel.warning,
					`Wield LuaEntity for player [${name}] was null. Bailing out.`
				);
				// Catch it.
				return;
			}
		}

		// It was already checked to be not-null as thoroughly as possible.
		entity = object.get_luaentity() as PlayerHoldingItemEntity;

		const object_string: string = entity.itemstring;

		if (object_string != item) {
			entity.itemstring = item;
			entity.set_item(item);
		}
	}

	// Easy way to allocate new players.
	function set_all_properties(player: ObjectRef): void {
		const name = player.get_player_name();
		const newData: ApiPlayerData = {
			visual: EntityVisual.mesh,
			mesh: "player.b3d",
			animation_speed: 24,
			visual_size: vector.create3d({ x: 1, y: 1, z: 1 }),
			textures: ["player.png", "blank_skin.png"],
			current_animation: "",
			swimming: false,
			collisionbox: [-0.3, 0.0, -0.3, 0.3, 1.7, 0.3],
			old_controls: player.get_player_control(),
			stepheight: 0.6,
			eye_height: 1.47,
			attached: false,
			wield_item: null,
			sleeping: false,
			force_update: false,
		};

		player.set_properties({
			visual: newData.visual,
			mesh: newData.mesh,
			textures: newData.textures,
			collisionbox: newData.collisionbox,
			eye_height: newData.eye_height,
			stepheight: newData.stepheight,
			visual_size: newData.visual_size,
		});

		pool.set(name, newData);

		set_animation(player, "stand", 0);
	}

	// Easy way to set textures.
	function set_textures(player: ObjectRef, textures: string[]): void {
		player.set_properties({ textures: textures });
	}

	// export enum animation {
	// 	stand,
	// 	lay,
	// 	walk,
	// 	mine,
	// 	walk_mine,
	// 	sit,
	// 	sneak,
	// 	sneak_mine_stand,
	// 	sneak_walk,
	// 	sneak_mine_walk,
	// 	swim,
	// 	swim_still,
	// 	die,
	// }

	const animation_list: Dictionary<string, Vec2> = {
		stand: { x: 5, y: 5 },
		lay: { x: 162, y: 162 },
		walk: { x: 168, y: 187 },
		mine: { x: 189, y: 198 },
		walk_mine: { x: 200, y: 219 },
		sit: { x: 81, y: 160 },
		sneak: { x: 60, y: 60 },
		sneak_mine_stand: { x: 20, y: 30 },
		sneak_walk: { x: 60, y: 80 },
		sneak_mine_walk: { x: 40, y: 59 },
		swim: { x: 221, y: 241 },
		swim_still: { x: 226, y: 226 },
		die: { x: 242, y: 253 },
	};

	// Easy way to set animation.
	function set_animation(
		player: ObjectRef,
		animation_name: string,
		speed: number,
		loop?: boolean
	) {
		const name = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		const current_animation: string = data.current_animation;
		if (current_animation == animation_name) {
			return;
		}
		let gottenAnimation: Vec2 | undefined = animation_list[animation_name];
		if (gottenAnimation == null) {
			throw new Error(`Animation [${animation_name}] does not exist.`);
		}
		data.current_animation = animation_name;
		player.set_animation(gottenAnimation, speed, 0, loop);
	}

	// Allows mods to force update animation.
	export function force_update_animation(player: ObjectRef): void {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		data.force_update = true;
	}

	// Force updates the player.
	function create_force_update(player: ObjectRef): void {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		data.force_update = true;
	}

	// Allows other mods to set animations per player.
	export function set_player_animation(
		player: ObjectRef,
		animation: string,
		speed: number,
		loop: boolean
	): void {
		set_animation(player, animation, speed, loop);
	}

	export function player_is_attached(
		player: ObjectRef,
		truth: boolean
	): void {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		data.attached = truth;
	}

	export function get_if_player_attached(player: ObjectRef): boolean {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.attached;
	}

	export function player_is_sleeping(
		player: ObjectRef,
		truth: boolean
	): void {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		data.sleeping = truth;
	}

	export function get_if_player_sleeping(player: ObjectRef): boolean {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		return data.sleeping;
	}

	// Toggles nametag visibility.
	function show_nametag(player: ObjectRef, show: boolean): void {
		player.set_nametag_attributes({
			color: {
				r: 255,
				b: 255,
				a: show ? 255 : 0,
				g: 255,
			},
		});
	}

	// Remove all player data.
	core.register_on_leaveplayer((player: ObjectRef) => {
		pool.delete(player.get_player_name());
	});

	// Converts yaw to degrees.
	// function degrees(yaw: number): number {
	// 	return (yaw * 180.0) / math.pi;
	// }

	function radians(deg: number): number {
		return deg * (math.pi / 180);
	}
	const pitchSwimAdd = radians(90);
	const pitchSneakAdd = radians(15);

	// Controls head bone.
	function pitch_look(player: ObjectRef, sneak: boolean): void {
		const swimming: boolean = playerMechanics.is_player_swimming(player);

		let pitch: number = player.get_look_vertical() * -1;

		if (swimming) {
			pitch += pitchSwimAdd;
		} else if (sneak) {
			pitch += pitchSneakAdd;
		}
		player.set_bone_override("Head", {
			position: { vec: vector.create3d(0, 6.3, 0), absolute: true },
			rotation: { vec: vector.create3d(pitch, 0, 0), absolute: true },
		});
	}

	// Checks if the player has done anything with their keyboard/mouse.
	function control_check(
		player: ObjectRef,
		control_table: PlayerControlObject
	): boolean {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		if (data.force_update) {
			data.old_controls = control_table;
			return true;
		}
		for (const [i, k] of pairs(data.old_controls)) {
			if (control_table[i] != k) {
				data.old_controls = control_table;
				return true;
			}
		}
		data.old_controls = control_table;
		return false;
	}

	interface AnimationKeySet extends Dictionary<string, boolean> {
		up: boolean;
		down: boolean;
		left: boolean;
		right: boolean;
	}

	interface AnimationComponent {
		animation: string;
		speed: number;
	}

	interface AnimationStateSet {
		true: AnimationComponent[];
		false: AnimationComponent[];
	}

	interface AnimationContainer {
		keys?: AnimationKeySet;
		states: AnimationStateSet;
	}

	// Movement to animation translations.
	class translation_table {
		private constructor() {}
		static readonly walk: AnimationContainer = {
			keys: {
				// required keys
				up: true,
				down: true,
				left: true,
				right: true,
			},
			states: {
				// states
				false: [
					// mouse input
					{ animation: "walk", speed: 24 },
					{ animation: "walk", speed: 36 },
					{ animation: "walk", speed: 42 },
				],
				true: [
					{ animation: "walk_mine", speed: 24 },
					{ animation: "walk_mine", speed: 36 },
					{ animation: "walk_mine", speed: 42 },
				],
			},
		};
		static readonly sneak: AnimationContainer = {
			keys: {
				up: true,
				down: true,
				left: true,
				right: true,
			},
			states: {
				true: [
					// moving
					//mouse input
					{ animation: "sneak_walk", speed: 24 },
					{ animation: "sneak_mine_walk", speed: 24 },
				],
				false: [
					// moving
					//mouse input
					{ animation: "sneak", speed: 0 },
					{ animation: "sneak_mine_stand", speed: 24 },
				],
			},
		};
		static readonly stand: AnimationContainer = {
			states: {
				true: [{ animation: "mine", speed: 24 }],
				false: [{ animation: "stand", speed: 0 }],
			},
		};
		static readonly swim: AnimationContainer = {
			keys: {
				// required keys
				up: true,
				down: true,
				left: true,
				right: true,
			},
			states: {
				true: [{ animation: "swim", speed: 24 }],
				false: [{ animation: "swim_still", speed: 0 }],
			},
		};
	}

	// Translate input and combine with state.
	function control_translation(
		player: ObjectRef,
		control: PlayerControlObject
	): void {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		const state: number = playerMechanics.get_player_state(player);
		const swimming: boolean = playerMechanics.is_player_swimming(player);
		let mouse: boolean = control.LMB || control.RMB;
		if (swimming) {
			for (const [k, i] of pairs(control)) {
				if (!i) {
					continue;
				}
				const keys: AnimationKeySet | undefined =
					translation_table.swim.keys;
				if (keys == null) {
					throw new Error("Swim keys are undefined.");
				}
				if (keys[k]) {
					const translated: AnimationComponent | undefined =
						translation_table.swim.states.true[0];
					if (translated == null) {
						throw new Error(
							"Swim states missing true array index 0."
						);
					}
					set_animation(
						player,
						translated.animation,
						translated.speed
					);
					return;
				}
			}
			const translated: AnimationComponent =
				translation_table.swim.states.false[0];
			if (translated == null) {
				throw new Error("Swim states missing false array index 0.");
			}
			set_animation(player, translated.animation, translated.speed);
			return;
		} else {
			if (control.sneak) {
				for (const [k, i] of pairs(control)) {
					if (!i) {
						continue;
					}
					const keys: AnimationKeySet | undefined =
						translation_table.sneak.keys;
					if (keys == null) {
						throw new Error("Sneak keys are undefined.");
					}
					if (keys[k]) {
						const index: number = mouse ? 1 : 0;
						const translated: AnimationComponent | undefined =
							translation_table.sneak.states.true[index];
						if (translated == null) {
							throw new Error(
								`Sneak states true is missing index [${index}]`
							);
						}
						set_animation(
							player,
							translated.animation,
							translated.speed
						);
						return;
					}
				}
				const index: number = mouse ? 1 : 0;
				const translated: AnimationComponent | undefined =
					translation_table.sneak.states.false[index];
				if (translated == null) {
					throw new Error(
						`Sneak states false is missing index [${index}]`
					);
				}
				set_animation(player, translated.animation, translated.speed);
				return;
			} else {
				for (const [k, i] of pairs(control)) {
					if (!i) {
						continue;
					}
					const keys: AnimationKeySet | undefined =
						translation_table.walk.keys;
					if (keys == null) {
						throw new Error("Walk keys are undefined.");
					}
					if (keys[k]) {
						const translated: AnimationComponent | undefined = (
							mouse
								? translation_table.walk.states.true
								: translation_table.walk.states.false
						)[state];
						if (translated == null) {
							throw new Error(
								`Walk state missing [${tostring(
									mouse
								)}] index [${state}]`
							);
						}
						set_animation(
							player,
							translated.animation,
							translated.speed
						);
						return;
					}
				}
			}
			const translated: AnimationComponent | undefined = (
				mouse
					? translation_table.stand.states.true
					: translation_table.stand.states.false
			)[0];
			if (translated == null) {
				throw new Error(
					`Stand state missing [${tostring(mouse)}] index 0`
				);
			}
			set_animation(player, translated.animation, translated.speed);
		}
	}

	// Translates player movement to animation.
	function do_animations(player: ObjectRef): void {
		const name: string = player.get_player_name();
		const data: ApiPlayerData | undefined = pool.get(name);
		if (data == null) {
			throw new Error(`Player [${name}] was never added to the pool.`);
		}
		const control_table: PlayerControlObject = player.get_player_control();
		pitch_look(player, control_table.sneak);
		if (player.get_hp() <= 0) {
			set_animation(player, "die", 40, false);
		} else if (!data.sleeping && (!data.attached || !player.get_attach())) {
			data.attached = false;
			const update: boolean = control_check(player, control_table);
			update_wield_item(player);
			if (update) {
				control_translation(player, control_table);
			}
		}
	}

	// Update appearance when the player joins.
	core.register_on_joinplayer((player: ObjectRef) => {
		set_all_properties(player);
	});

	core.register_on_respawnplayer((player: ObjectRef) => {
		create_force_update(player);
	});

	// Inject into global loop.
	core.register_globalstep(() => {
		for (const [_, player] of ipairs(core.get_connected_players())) {
			do_animations(player);
		}
	});

	class PlayerHoldingItemEntity extends types.Entity {
		name: string = "crafter_player_api:item";
		wielder: string | null = null;
		itemstring: string = "";

		initial_properties = {
			hp_max: 1,
			visual: EntityVisual.wielditem,
			physical: false,
			textures: [""],
			// automatic_rotate: 1.5,
			is_visible: true,
			pointable: false,
			collide_with_objects: false,
			collisionbox: [-0.21, -0.21, -0.21, 0.21, 0.21, 0.21],
			selectionbox: [-0.21, -0.21, -0.21, 0.21, 0.21, 0.21],
			visual_size: { x: 0.21, y: 0.21 },
		};

		set_item(item: string): void {
			const stack = ItemStack(item || this.itemstring);
			this.itemstring = stack.to_string();
			const itemname: string =
				(stack.is_known() && stack.get_name()) || "unknown";
			const def: ItemDefinition | undefined =
				core.registered_items[itemname];
			if (def == null) {
				throw new Error(
					`Tried to set item to [${itemname}] which is undefined.`
				);
			}

			// Make nodes draw correctly in hand.
			const newSize = vector.create2d(0, 0);

			if (core.registered_nodes[itemname]) {
				newSize.x = 0.21;
				newSize.y = 0.21;
			} else {
				newSize.x = 0.4;
				newSize.y = 0.4;
			}

			this.object.set_properties({
				textures: [itemname],
				wield_item: this.itemstring,
				glow: def.light_source,
				visual_size: newSize,
			});
		}

		on_step(): void {
			if (
				this.wielder == null ||
				(this.wielder != null && !core.get_player_by_name(this.wielder))
			) {
				this.object.remove();
			}
		}
	}

	utility.registerTSEntity(PlayerHoldingItemEntity);
}
