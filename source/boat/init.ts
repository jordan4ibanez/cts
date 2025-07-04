namespace boat {
	interface LiquidData {
		source: string;
		flow: string;
	}

	const identifiers: string[] = ["wooden", "iron"];
	const descriptions: string[] = ["Wooden", "Iron"];
	const boatTextures: string[] = ["boat.png", "iron_boat.png"];
	const wieldImages: string[] = ["boatitem.png", "iron_boatitem.png"];
	const materials: string[] = ["crafter:wood", "crafter:iron"];
	const liquids: LiquidData[] = [
		{ source: "crafter:water", flow: "crafter:waterflow" },
		{ source: "crafter:lava", flow: "crafter:lavaflow" },
	];
	const __flowFuncs: ((pos: Vec3) => Vec3 | null)[] = [
		flowLib.flow,
		flowLib.lavaflow,
	];

	for (const i of $range(0, 1)) {
		const entityName: string = `crafter_boat:${identifiers[i]}_boat`;

		const currentLiquidSource: string = liquids[i].source;
		const currentLiquidFlow: string = liquids[i].flow;
		const flowFunction: (pos: Vec3) => Vec3 | null = __flowFuncs[i];

		class BoatEntity extends types.Entity {
			name: string = entityName;

			initial_properties = {
				hp_max: 1,
				physical: true,
				collide_with_objects: false,
				collisionbox: [-0.4, 0, -0.4, 0.4, 0.5, 0.4],
				visual: EntityVisual.mesh,
				mesh: "boat.x",
				textures: [boatTextures[i]],
				visual_size: vector.create3d({ x: 1, y: 1, z: 1 }),
				is_visible: true,
				automatic_face_movement_dir: -90.0,
				automatic_face_movement_max_rotation_per_sec: 600,
			};

			swimming: boolean = false;
			moving: boolean = false;
			on_land: boolean = false;
			rider: string | null = null;
			old_pos: Vec3 = vector.create3d();
			old_velocity: Vec3 = vector.create3d();

			get_staticdata(): string {
				return "";
			}

			on_activate(): void {
				this.object.set_armor_groups({ immortal: 1 });
				this.object.set_velocity(vector.create3d({ x: 0, y: 0, z: 0 }));
				this.object.set_acceleration(
					vector.create3d({ x: 0, y: 0, z: 0 })
				);
				this.old_pos = this.object.get_pos();
				this.old_velocity = this.object.get_velocity();
			}

			on_punch(): void {
				const pos: Vec3 = this.object.get_pos();
				core.add_item(pos, entityName);
				this.object.remove();
			}

			on_rightclick(clicker: ObjectRef): void {
				if (!clicker.is_player()) {
					return;
				}

				const player_name: string = clicker.get_player_name();

				if (this.rider != null && player_name == this.rider) {
					clicker.set_detach();
					const pos: Vec3 = this.object.get_pos();
					pos.y += 1;
					clicker.move_to(pos);
					clicker.add_velocity(vector.create3d(0, 11, 0));
					this.rider = null;
					playerAPI.player_is_attached(clicker, false);
					playerAPI.force_update_animation(clicker);
				} else if (this.rider == null) {
					this.rider = player_name;
					clicker.set_attach(
						this.object,
						"",
						vector.create3d({ x: 0, y: 2, z: 0 }),
						vector.create3d({ x: 0, y: 0, z: 0 })
					);
					playerAPI.set_player_animation(clicker, "sit", 0);
					playerAPI.player_is_attached(clicker, true);
				}
			}

			// Check if the boat is stuck on land.
			check_if_on_land(): void {
				const pos: Vec3 = this.object.get_pos();
				pos.y -= 0.37;
				const bottom_node: string = core.get_node(pos).name;
				if (
					bottom_node == currentLiquidSource ||
					bottom_node == currentLiquidFlow ||
					bottom_node == "air"
				) {
					this.on_land = false;
				} else {
					this.on_land = true;
				}
			}

			// Players drive the boat.
			drive(): void {
				if (this.rider == null) {
					this.moving = false;
					return;
				}

				const rider: ObjectRef | null = core.get_player_by_name(
					this.rider
				);

				if (rider == null) {
					this.rider = null;
					this.moving = false;
					return;
				}

				const move: boolean = rider.get_player_control().up;
				this.moving = false;

				if (!move) {
					return;
				}

				const currentvel: Vec3 = this.object.get_velocity();
				currentvel.y = 0;

				let goal: Vec3 = rider.get_look_dir();
				goal.y = 0;

				goal = vector.multiply(
					vector.normalize(goal),
					this.on_land ? 1 : 20
				);

				let acceleration: Vec3 = vector.create3d(
					goal.x - currentvel.x,
					0,
					goal.z - currentvel.z
				);
				acceleration = vector.multiply(acceleration, 0.01);
				this.object.add_velocity(acceleration);
				this.moving = true;
			}
			// Players push boat.
			push(): void {
				const pos: Vec3 = this.object.get_pos();
				for (const [_, object] of ipairs(
					core.get_objects_inside_radius(pos, 1)
				)) {
					if (
						!object.is_player() ||
						object.get_player_name() == this.rider
					) {
						continue;
					}

					// Convert to 2d.
					const player_pos: Vec3 = object.get_pos();
					pos.y = 0;
					player_pos.y = 0;
					const currentvel: Vec3 = this.object.get_velocity();
					let vel: Vec3 = vector.subtract(pos, player_pos);
					vel = vector.normalize(vel);
					let distance: number = vector.distance(pos, player_pos);
					distance = (1 - distance) * 10;
					vel = vector.multiply(vel, distance);
					let acceleration: Vec3 = vector.create3d(
						vel.x - currentvel.x,
						0,
						vel.z - currentvel.z
					);
					this.object.add_velocity(acceleration);
					acceleration = vector.multiply(acceleration, -1);
					object.add_velocity(acceleration);
				}
			}

			// Makes the boat float.
			float(): void {
				const pos: Vec3 = this.object.get_pos();
				const node: string = core.get_node(pos).name;
				this.swimming = false;

				// Flow normally if floating else don't.
				if (node != currentLiquidSource && node != currentLiquidFlow) {
					this.object.set_acceleration(vector.create3d(0, -10, 0));
					return;
				}

				this.object.set_acceleration(vector.create3d(0, 0, 0));
				this.swimming = true;
				const vel: Vec3 = this.object.get_velocity();
				const goal: number = 9;
				let acceleration: Vec3 = vector.create3d(0, goal - vel.y, 0);
				acceleration = vector.multiply(acceleration, 0.01);
				this.object.add_velocity(acceleration);

				// Unused code?
				//this.object.set_acceleration(vector.new(0,0,0))
			}

			// Slows the boat down.
			slowdown(): void {
				if (this.moving) {
					return;
				}
				const vel: Vec3 = this.object.get_velocity();
				const acceleration: Vec3 = vector.create3d(-vel.x, 0, -vel.z);
				const deceleration: Vec3 = vector.multiply(acceleration, 0.01);
				this.object.add_velocity(deceleration);
			}

			lag_correction(delta: number): void {
				const pos: Vec3 = this.object.get_pos();
				const velocity: Vec3 = this.object.get_velocity();

				if (delta > 0.06) {
					this.object.move_to(this.old_pos);
					this.object.set_velocity(this.old_velocity);
				}

				this.old_pos = pos;
				this.old_velocity = velocity;
			}

			flow(): void {
				let flow_dir: Vec3 | null = flowFunction(this.object.get_pos());
				if (flow_dir == null) {
					return;
				}
				flow_dir = vector.multiply(flow_dir, 10);
				const vel: Vec3 = this.object.get_velocity();
				let acceleration: Vec3 = vector.create3d(
					flow_dir.x - vel.x,
					flow_dir.y - vel.y,
					flow_dir.z - vel.z
				);
				acceleration = vector.multiply(acceleration, 0.01);
				this.object.add_velocity(acceleration);
			}

			on_step(delta: number): void {
				this.check_if_on_land();
				this.push();
				this.drive();
				this.float();
				this.flow();
				this.slowdown();
				this.lag_correction(delta);
			}
		}

		utility.registerTSEntity(BoatEntity);

		core.register_craftitem(entityName, {
			description: `${descriptions[i]} Boat`,
			inventory_image: wieldImages[i],
			wield_image: wieldImages[i],
			liquids_pointable: true,
			on_place: (itemstack, placer, pointed_thing) => {
				if (
					pointed_thing.type != PointedThingType.node ||
					pointed_thing.above == null ||
					pointed_thing.under == null
				) {
					return;
				}

				const sneak: boolean = placer.get_player_control().sneak;
				const noddef: NodeDefinition | undefined =
					core.registered_nodes[
						core.get_node(pointed_thing.under).name
					];

				if (!sneak && noddef?.on_rightclick) {
					core.item_place(itemstack, placer, pointed_thing);
					return;
				}
				core.add_entity(pointed_thing.above, entityName);
				itemstack.take_item();
				return itemstack;
			},
		});

		const currentMaterial = materials[i];

		core.register_craft({
			output: entityName,
			recipe: [
				[currentMaterial, "", currentMaterial],
				[currentMaterial, currentMaterial, currentMaterial],
			],
		});
	}
}
