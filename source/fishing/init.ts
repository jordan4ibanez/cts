namespace fishing {
	const players_fishing = new Map<string, ObjectRef>();

	function fishingPoleUsage(
		itemstack: ItemStackObject,
		player: ObjectRef,
		pointed_thing: PointedThing
	): ItemStackObject | void {
		const name = player.get_player_name();
		const fishingLure: ObjectRef | undefined = players_fishing.get(name);

		if (fishingLure == null || fishingLure.get_luaentity() == null) {
			const pos: Vec3 = player.get_pos();

			pos.y += 1.625;

			const lureObject: ObjectRef | null = core.add_entity(
				pos,
				"crafter_fishing:lure"
			);
			if (lureObject == null) {
				core.log(
					LogLevel.warning,
					`Failed to add fishing lure to player [${name}]. ObjectRef is null.`
				);
				return;
			}

			const lureLuaEntity: FishingLureEntity | null =
				lureObject.get_luaentity() as FishingLureEntity | null;

			if (lureLuaEntity == null) {
				core.log(
					LogLevel.warning,
					`Failed to add fishing lure to player [${name}]. LuaEntity is null.`
				);
				return;
			}

			lureLuaEntity.playerWieldSlot = player.get_wield_index();
			lureLuaEntity.player = name;

			core.sound_play("woosh", { pos: pos });

			const dir: Vec3 = player.get_look_dir();
			const force: Vec3 = vector.multiply(dir, 20);
			lureObject.set_velocity(force);

			players_fishing.set(name, lureObject);
		}
	}

	core.register_craftitem("crafter_fishing:pole", {
		description: "Fishing Pole",
		inventory_image: "fishing_rod.png",
		stack_max: 1,
		on_place: fishingPoleUsage,
		on_secondary_use: fishingPoleUsage,
	});

	core.register_craft({
		output: "crafter_fishing:pole",
		recipe: [
			["", "", "crafter:stick"],
			["", "crafter:stick", "crafter_mobs:string"],
			["crafter:stick", "", "crafter_mobs:string"],
		],
	});

	class FishingLureEntity extends types.Entity {
		name: string = "crafter_fishing:lure";
		player: string | null = null;

		initial_properties: ObjectProperties = {
			physical: false,
			collide_with_objects: false,
			collisionbox: [-0.1, -0.1, -0.1, 0.1, 0.1, 0.1],
			visual: EntityVisual.sprite,
			visual_size: { x: 0.25, y: 0.25 },
			textures: ["lure.png"],
			is_visible: true,
			pointable: false,
			// 	//glow : -1,
			// 	//automatic_face_movement_dir : 0.0,
			// 	//automatic_face_movement_max_rotation_per_sec : 600,
		};

		inWater: boolean = false;
		interplayer: string | null = null;
		catchTimer: number = 0;
		playerWieldSlot: number = -1;

		on_activate(): void {
			this.object.set_acceleration(vector.create3d(0, -10, 0));
		}

		on_step(dtime: number): void {
			const pos: Vec3 = this.object.get_pos();
			const node: string = core.get_node(pos).name;

			if (this.player == null) {
				this.object.remove();
				return;
			}

			const player: ObjectRef | null = core.get_player_by_name(this.player);
			if (player == null) {
				this.object.remove();
				return;
			}

			if (node == "crafter:water") {
				this.inWater = true;
				const new_pos: Vec3 = vector.floor(pos);
				new_pos.y += 0.5;
				this.object.move_to(vector.create3d(pos.x, new_pos.y, pos.z));
				this.object.set_acceleration(vector.create3d(0, 0, 0));
				this.object.set_velocity(vector.create3d(0, 0, 0));
			} else {
				const newp: Vec3 = vector.copy(pos);
				newp.y -= 0.1;
				const nodeUnder = core.get_node(newp).name;
				if (
					nodeUnder != "air" &&
					nodeUnder != "crafter:water" &&
					nodeUnder != "crafter:waterflow"
				) {
					if (this.player != null) {
						players_fishing.delete(this.player);
					}
					core.sound_play("line_break", { pos: pos, gain: 0.3 });
					this.object.remove();
					return;
				}
			}

			if (this.inWater) {
				const playerControls = player.get_player_control();

				if (playerControls.RMB) {
					const pos2: Vec3 = player.get_pos();
					const vel: Vec3 = vector.direction(
						vector.create3d(pos.x, 0, pos.z),
						vector.create3d(pos2.x, 0, pos2.z)
					);
					this.object.set_velocity(vector.multiply(vel, 2));
					this.catchTimer += dtime;
					if (this.catchTimer >= 0.5) {
						this.catchTimer = 0;
						if (math.random() > 0.94) {
							const obj: ObjectRef | null = core.add_item(
								pos,
								"crafter_fishing:fish"
							);
							if (obj) {
								const distance: number = vector.distance(
									pos,
									pos2
								);
								const dir: Vec3 = vector.direction(pos, pos2);
								const force: Vec3 = vector.multiply(
									dir,
									distance
								);
								force.y = 6;
								obj.set_velocity(force);
								core.sound_play("splash", {
									pos: obj.get_pos(),
									gain: 0.25,
								});
							}
							players_fishing.delete(this.player);
							this.object.remove();
							return;
						}
					}
				} else {
					this.object.set_velocity(vector.create3d(0, 0, 0));
				}

				const pos2: Vec3 = player.get_pos();
				if (
					vector.distance(
						vector.create3d(pos.x, 0, pos.z),
						vector.create3d(pos2.x, 0, pos2.z)
					) < 1
				) {
					players_fishing.delete(this.player);
					core.sound_play("line_break", {
						pos: pos,
						gain: 0.3,
						pitch: 0.5,
					});
					this.object.remove();
					return;
				}
			}
		}
	}
	utility.registerTSEntity(FishingLureEntity);

	core.register_craft({
		type: CraftRecipeType.cooking,
		output: "crafter_fishing:fish_cooked",
		recipe: "crafter_fishing:fish",
	});

	hunger.register_food("crafter_fishing:fish", {
		description: "Raw Fish",
		texture: "fish.png",
		satiation: 6,
		hunger: 3,
	});

	hunger.register_food("crafter_fishing:fish_cooked", {
		description: "Cooked Fish",
		texture: "fish_cooked.png",
		satiation: 22,
		hunger: 5,
	});
}
