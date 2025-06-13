namespace fireworks {
	const colors: string[] = ["red", "white", "blue"];
	const colors_halloween: string[] = ["orange", "black"];

	function fireworks_pop(pos: Vec3): void {
		for (const [_, color] of ipairs(colors)) {
			core.add_particlespawner({
				amount: 15,
				time: 0.001,
				minpos: pos,
				maxpos: pos,
				minvel: vector.create3d(-16, -16, -16),
				maxvel: vector.create3d(16, 16, 16),
				minacc: vector.create3d({ x: 0, y: 0, z: 0 }),
				maxacc: vector.create3d({ x: 0, y: 0, z: 0 }),
				minexptime: 1.1,
				maxexptime: 1.5,
				minsize: 1,
				maxsize: 2,
				collisiondetection: false,
				collision_removal: false,
				vertical: false,
				texture: "smoke.png^[colorize:" + color + ":255",
				glow: 14,
			});
		}
		core.sound_play("fireworks_pop", {
			pos: pos,
			pitch: math.random(80, 100) / 100,
			gain: 6.0,
			max_hear_distance: 128,
		});
	}

	class FireworksEntity extends types.Entity {
		name = "crafter_fireworks:rocket";

		timer: number = 0;
		sound_played: boolean = false;

		initial_properties: ObjectProperties = {
			hp_max: 1,
			physical: true,
			collide_with_objects: false,
			collisionbox: [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5],
			visual: EntityVisual.sprite,
			visual_size: { x: 1, y: 1 },
			textures: ["fireworks.png"],
			is_visible: true,
			pointable: true,
		};

		on_activate(staticdata: string, dtime_s: number): void {
			this.object.set_acceleration(vector.create3d(0, 50, 0));
			const pos = this.object.get_pos();
			core.add_particlespawner({
				amount: 30,
				time: 1,
				minpos: pos,
				maxpos: pos,
				minvel: vector.create3d(0, -20, 0),
				maxvel: vector.create3d(0, -20, 0),
				minacc: vector.create3d({ x: 0, y: 0, z: 0 }),
				maxacc: vector.create3d({ x: 0, y: 0, z: 0 }),
				minexptime: 1.1,
				maxexptime: 1.5,
				minsize: 1,
				maxsize: 2,
				collisiondetection: false,
				collision_removal: false,
				vertical: false,
				attached: this.object,
				texture: "smoke.png",
			});
			core.sound_play("fireworks_launch", {
				object: this.object,
				pitch: math.random(80, 100) / 100,
			});
		}

		on_step(dtime: number): void {
			this.timer += dtime;
			if (this.timer >= 1) {
				fireworks_pop(this.object.get_pos());
				this.object.remove();
			}
		}
	}

	utility.registerTSEntity(FireworksEntity);

	core.register_craftitem("crafter_fireworks:rocket", {
		description: "Fireworks",
		inventory_image: "fireworks.png",
		wield_image: "fireworks.png",
		on_place: function (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		) {
			if (
				pointed_thing.type != PointedThingType.node ||
				pointed_thing.above == null
			) {
				return;
			}
			core.add_entity(pointed_thing.above, "crafter_fireworks:rocket");
			itemstack.take_item();
			return itemstack;
		},
	});

	core.register_craft({
		type: CraftRecipeType.shapeless,
		output: "fireworks:rocket",
		recipe: ["crafter:paper", "mob:gunpowder"],
	});
}
