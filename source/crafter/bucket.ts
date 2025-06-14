/*
BEFORE YOU ASK WHY ARE YOU DOING THIS!

It works better and doesn't block digging with a bucket through water.

https://youtu.be/j0cq27qqnE8
*/
namespace crafter {
	function bucket_raycast(player: ObjectRef): PointedThing | null {
		const pos: Vec3 = player.get_pos();
		const eyeHeight = player.get_properties().eye_height;
		if (!eyeHeight) {
			throw new Error("How did a player's eye height become null?");
		}
		pos.y = pos.y + eyeHeight;
		let lookDir: Vec3 = player.get_look_dir();
		lookDir = vector.multiply(lookDir, 4);
		const pos2: Vec3 = vector.add(pos, lookDir);

		const ray: RaycastObject = core.raycast(pos, pos2, false, true);

		for (const pointedThing of ray) {
			if (pointedThing != null) {
				return pointedThing;
			}
		}
		return null;
	}

	// Item definitions.
	// fixme: Why aren't we using functions?!

	core.register_craftitem("crafter:bucket", {
		description: "Bucket",
		inventory_image: "bucket.png",
		stack_max: 1,
		// wield_image = "bucket.png",
		// liquids_pointable = true,
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			_: PointedThing
		) => {
			const bucketPointedThing: PointedThing | null =
				bucket_raycast(placer);

			if (
				bucketPointedThing == null ||
				bucketPointedThing.type == PointedThingType.object ||
				bucketPointedThing.under == null
			) {
				return;
			}

			const posUnder: Vec3 = bucketPointedThing.under;

			const nodeName: string = core.get_node(posUnder).name;

			if (nodeName == "crafter:water") {
				itemstack.replace(ItemStack("crafter:bucket_water"));
				core.remove_node(posUnder);
				return itemstack;
			} else if (
				nodeName == "crafter:lava" ||
				nodeName == "nether:lava"
			) {
				itemstack.replace(ItemStack("crafter:bucket_lava"));
				core.remove_node(posUnder);
				return itemstack;
			}
		},

		on_secondary_use: (
			itemstack: ItemStackObject,
			user: ObjectRef,
			_: PointedThing
		) => {
			const bucketPointedThing: PointedThing | null =
				bucket_raycast(user);

			if (
				bucketPointedThing == null ||
				bucketPointedThing.type == PointedThingType.object ||
				bucketPointedThing.under == null
			) {
				return;
			}
			const posUnder: Vec3 = bucketPointedThing.under;

			const nodeName: string = core.get_node(posUnder).name;

			if (nodeName == "crafter:water") {
				itemstack.replace(ItemStack("crafter:bucket_water"));
				core.remove_node(posUnder);
				return itemstack;
			} else if (
				nodeName == "crafter:lava" ||
				nodeName == "nether:lava"
			) {
				itemstack.replace(ItemStack("crafter:bucket_lava"));
				core.remove_node(posUnder);
				return itemstack;
			}
		},
	});

	core.register_craftitem("crafter:bucket_water", {
		description: "Bucket of Water",
		inventory_image: "bucket_water.png",
		stack_max: 1,
		// liquids_pointable = false,
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			_: PointedThing
		) => {
			const bucketPointedThing: PointedThing | null =
				bucket_raycast(placer);

			if (
				bucketPointedThing == null ||
				bucketPointedThing.type == PointedThingType.object ||
				bucketPointedThing.above == null ||
				bucketPointedThing.under == null
			) {
				return;
			}

			const posUnder: Vec3 = bucketPointedThing.under;
			const posAbove: Vec3 = bucketPointedThing.above;

			const nodeUnder: string = core.get_node(posUnder).name;
			const nodeAbove: string = core.get_node(posAbove).name;

			const buildableUnder: boolean = (() => {
				const def: NodeDefinition | undefined =
					core.registered_nodes[nodeUnder];
				return (def && def.buildable_to) || false;
			})();

			const buildableAbove: boolean = (() => {
				const def: NodeDefinition | undefined =
					core.registered_nodes[nodeAbove];
				return (def && def.buildable_to) || false;
			})();

			// Set it to water.
			if (buildableUnder == true) {
				core.set_node(posUnder, { name: "crafter:water" });
				itemstack.replace(ItemStack("crafter:bucket"));
				return itemstack;
			} else if (buildableAbove) {
				core.set_node(posAbove, { name: "crafter:water" });
				itemstack.replace(ItemStack("crafter:bucket"));
				return itemstack;
			}
		},
		on_secondary_use: (
			itemstack: ItemStackObject,
			user: ObjectRef,
			_: PointedThing
		) => {
			const bucketPointedThing: PointedThing | null =
				bucket_raycast(user);

			if (
				bucketPointedThing == null ||
				bucketPointedThing.type == PointedThingType.object ||
				bucketPointedThing.above == null ||
				bucketPointedThing.under == null
			) {
				return;
			}

			const posUnder: Vec3 = bucketPointedThing.under;
			const posAbove: Vec3 = bucketPointedThing.above;

			const nodeUnder: string = core.get_node(posUnder).name;
			const nodeAbove: string = core.get_node(posAbove).name;

			const buildableUnder: boolean = (() => {
				const def: NodeDefinition | undefined =
					core.registered_nodes[nodeUnder];
				return (def && def.buildable_to) || false;
			})();

			const buildableAbove: boolean = (() => {
				const def: NodeDefinition | undefined =
					core.registered_nodes[nodeAbove];
				return (def && def.buildable_to) || false;
			})();

			// Set it to water.
			if (buildableUnder == true) {
				core.add_node(posUnder, { name: "crafter:water" });
				itemstack.replace(ItemStack("crafter:bucket"));
				return itemstack;
			} else if (buildableAbove) {
				core.add_node(posAbove, { name: "crafter:water" });
				itemstack.replace(ItemStack("crafter:bucket"));
				return itemstack;
			}
		},
	});

	// fixme: there are hardcodes for the NETHER IN HERE! Use a module!

	core.register_craftitem("crafter:bucket_lava", {
		description: "Bucket of Lava",
		inventory_image: "bucket_lava.png",
		stack_max: 1,
		// liquids_pointable = false,
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		) => {
			// fixme: WHY ARE THERE 2 POINTED THINGS?!

			if (
				pointed_thing.under &&
				core.get_node(pointed_thing.under).name == "crafter_tnt:tnt"
			) {
				core.remove_node(pointed_thing.under);
				// fixme: this was calling the TNT mod.
				// tnt(pointed_thing.under,7)
				itemstack.replace(ItemStack("crafter:bucket"));
				return itemstack;
			}

			const bucketPointedThing: PointedThing | null =
				bucket_raycast(placer);

			if (
				bucketPointedThing == null ||
				bucketPointedThing.type == PointedThingType.object ||
				bucketPointedThing.above == null ||
				bucketPointedThing.under == null
			) {
				return;
			}

			const posUnder: Vec3 = bucketPointedThing.under;
			const posAbove: Vec3 = bucketPointedThing.above;

			const nodeUnder: string = core.get_node(posUnder).name;
			const nodeAbove: string = core.get_node(posAbove).name;

			const buildableUnder: boolean = (() => {
				const def: NodeDefinition | undefined =
					core.registered_nodes[nodeUnder];
				return (def && def.buildable_to) || false;
			})();

			const buildableAbove: boolean = (() => {
				const def: NodeDefinition | undefined =
					core.registered_nodes[nodeAbove];
				return (def && def.buildable_to) || false;
			})();

			// Set it to lava.
			if (buildableUnder == true) {
				if (posUnder.y < 20_000) {
					if (posUnder.y > -10_033) {
						core.add_node(posUnder, { name: "crafter:lava" });
					} else {
						core.add_node(posUnder, { name: "nether:lava" });
					}
					itemstack.replace(ItemStack("crafter:bucket"));
					return itemstack;
				}
			} else if (buildableAbove) {
				if (posAbove.y < 20_000) {
					if (posAbove.y > -10_033) {
						core.add_node(posAbove, { name: "crafter:lava" });
					} else {
						core.add_node(posAbove, { name: "nether:lava" });
					}
					itemstack.replace(ItemStack("crafter:bucket"));
					return itemstack;
				}
			}
		},
		on_secondary_use: (
			itemstack: ItemStackObject,
			user: ObjectRef,
			_: PointedThing
		) => {
			const pointedThing: PointedThing | null = bucket_raycast(user);

			if (
				pointedThing == null ||
				pointedThing.type == PointedThingType.object ||
				pointedThing.above == null ||
				pointedThing.under == null
			) {
				return;
			}

			const posUnder: Vec3 = pointedThing.under;
			const posAbove: Vec3 = pointedThing.above;

			const nodeUnder: string = core.get_node(posUnder).name;
			const nodeAbove: string = core.get_node(posAbove).name;

			const buildableUnder: boolean = (() => {
				const def: NodeDefinition | undefined =
					core.registered_nodes[nodeUnder];
				return (def && def.buildable_to) || false;
			})();

			const buildableAbove: boolean = (() => {
				const def: NodeDefinition | undefined =
					core.registered_nodes[nodeAbove];
				return (def && def.buildable_to) || false;
			})();

			// Set it to lava.
			if (buildableUnder == true) {
				if (posUnder.y < 20_000) {
					if (posUnder.y > -10_033) {
						core.add_node(posUnder, { name: "crafter:lava" });
					} else {
						core.add_node(posUnder, { name: "nether:lava" });
					}
					itemstack.replace(ItemStack("crafter:bucket"));
					return itemstack;
				}
			} else if (buildableAbove) {
				if (posAbove.y < 20_000) {
					if (posAbove.y > -10_033) {
						core.add_node(posAbove, { name: "crafter:lava" });
					} else {
						core.add_node(posAbove, { name: "nether:lava" });
					}
					itemstack.replace(ItemStack("crafter:bucket"));
					return itemstack;
				}
			}
		},
	});
}
