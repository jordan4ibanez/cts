namespace crafter {
	// Ore def with required tool.

	const tool: string[] = [
		"crafter:woodpick",
		"crafter:coalpick",
		"crafter:stonepick",
		"crafter:ironpick",
		"crafter:lapispick",
		"crafter:goldpick",
		"crafter:diamondpick",
		"crafter:emeraldpick",
		"crafter:sapphirepick",
		"crafter:rubypick",
	];

	const ores: { [id: string]: string[] } = {
		coal: [
			"crafter:woodpick",
			"crafter:coalpick",
			"crafter:stonepick",
			"crafter:ironpick",
			"crafter:lapispick",
			"crafter:goldpick",
			"crafter:diamondpick",
			"crafter:emeraldpick",
			"crafter:sapphirepick",
			"crafter:rubypick",
		],
		iron: [
			"crafter:coalpick",
			"crafter:stonepick",
			"crafter:ironpick",
			"crafter:lapispick",
			"crafter:goldpick",
			"crafter:diamondpick",
			"crafter:emeraldpick",
			"crafter:sapphirepick",
			"crafter:rubypick",
		],
		lapis: [
			"crafter:ironpick",
			"crafter:lapispick",
			"crafter:goldpick",
			"crafter:diamondpick",
			"crafter:emeraldpick",
			"crafter:sapphirepick",
			"crafter:rubypick",
		],
		gold: [
			"crafter:ironpick",
			"crafter:lapispick",
			"crafter:goldpick",
			"crafter:diamondpick",
			"crafter:emeraldpick",
			"crafter:sapphirepick",
			"crafter:rubypick",
		],
		diamond: [
			"crafter:ironpick",
			"crafter:lapispick",
			"crafter:diamondpick",
			"crafter:emeraldpick",
			"crafter:sapphirepick",
			"crafter:rubypick",
		],
		emerald: [
			"crafter:diamondpick",
			"crafter:emeraldpick",
			"crafter:sapphirepick",
			"crafter:rubypick",
		],
		sapphire: [
			"crafter:diamondpick",
			"crafter:emeraldpick",
			"crafter:sapphirepick",
			"crafter:rubypick",
		],
		ruby: [
			"crafter:diamondpick",
			"crafter:emeraldpick",
			"crafter:sapphirepick",
			"crafter:rubypick",
		],
	};

	const drops: { [id: string]: string[] } = {
		coal: ["crafter:coal"],
		iron: ["crafter:ironore"],
		lapis: ["crafter:lapis"],
		gold: ["crafter:goldore"],
		diamond: ["crafter:diamond"],
		emerald: ["crafter:emerald"],
		sapphire: ["crafter:sapphire"],
		ruby: ["crafter:ruby"],
	};

	const levels: { [id: string]: number } = {
		coal: 1,
		iron: 2,
		lapis: 3,
		gold: 3,
		diamond: 4,
		emerald: 5,
		sapphire: 6,
		ruby: 7,
	};

	let level: number = 0;

	for (const [ore, tool_required] of pairs(ores)) {
		if (typeof ore != "string") {
			throw new Error("ore is not a string!");
		}
		level = levels[ore];

		let experience: number = 0;

		if (ore == "iron" || ore == "gold") {
			experience = 0;
		} else {
			experience = level;
		}

		core.register_node("crafter:" + ore + "block", {
			description: string.gsub(ore, "^%l", string.upper)[0] + " Block",
			tiles: [ore + "block.png"],
			groups: { stone: level, pathable: 1 },
			sounds: crafter.stoneSound(),
			// light_source = 14,//debugging ore spawn
			drop: {
				max_items: 1,
				items: [
					{
						rarity: 0,
						tools: tool_required,
						items: ["crafter:" + ore + "block"],
					},
				],
			},
		});

		core.register_node("crafter:" + ore + "ore", {
			description: string.gsub(ore, "^%l", string.upper)[0] + " Ore",
			tiles: ["stone.png^" + ore + "ore.png"],
			groups: { stone: level, pathable: 1, experience: experience },
			sounds: crafter.stoneSound(),
			// light_source = 14,//debugging ore spawn
			drop: {
				max_items: 1,
				items: [
					{
						rarity: 0,
						tools: tool_required,
						items: drops[ore],
					},
				],
			},
			canSilkTouch: true,
		});

		core.register_node(":nether:" + ore + "ore", {
			description:
				"Nether " + string.gsub(ore, "^%l", string.upper)[0] + " Ore",
			tiles: ["netherrack.png^" + ore + "ore.png"],
			groups: { netherrack: level, pathable: 1, experience: experience },
			sounds: crafter.stoneSound(),
			light_source: 7,
			drop: {
				max_items: 1,
				items: [
					{
						rarity: 0,
						tools: tool_required,
						items: drops[ore],
					},
				],
			},
			after_destruct: (pos: Vec3) => {
				if (math.random() > 0.95) {
					core.sound_play("tnt_ignite", {
						pos: pos,
						max_hear_distance: 64,
					});
					core.after(
						1.5,
						function (pos) {
							tnt.tnt(pos, 5);
						},
						pos
					);
				}
			},
			canSilkTouch: true,
		});
	}

	core.register_node("crafter:stone", {
		description: "Stone",
		tiles: ["stone.png"],
		groups: { stone: 1, hand: 1, pathable: 1 },
		sounds: crafter.stoneSound(),
		drop: {
			max_items: 1,
			items: [
				{
					rarity: 0,
					tools: tool,
					items: ["crafter:cobble"],
				},
			],
		},
		canSilkTouch: true,
	});

	core.register_node("crafter:cobble", {
		description: "Cobblestone",
		tiles: ["cobble.png"],
		groups: { stone: 1, pathable: 1 },
		sounds: crafter.stoneSound(),
		drop: {
			max_items: 1,
			items: [
				{
					rarity: 0,
					tools: tool,
					items: ["crafter:cobble"],
				},
			],
		},
	});

	core.register_node("crafter:mossy_cobble", {
		description: "Mossy Cobblestone",
		tiles: ["mossy_cobble.png"],
		groups: { stone: 1, pathable: 1 },
		sounds: crafter.stoneSound(),
		drop: {
			max_items: 1,
			items: [
				{
					rarity: 0,
					tools: tool,
					items: ["crafter:mossy_cobble"],
				},
			],
		},
	});

	core.register_node("crafter:glass", {
		description: "Glass",
		tiles: ["glass.png"],
		drawtype: Drawtype.glasslike,
		paramtype: ParamType1.light,
		sunlight_propagates: true,
		is_ground_content: false,
		use_texture_alpha: TextureAlpha.clip,
		groups: { glass: 1, pathable: 1 },
		sounds: crafter.stoneSound({
			footstep: { name: "glass_footstep", gain: 0.4 },
			dug: { name: "break_glass", gain: 0.4 },
		}),
		drop: "",
		canSilkTouch: true,
	});

	core.register_node("crafter:ice", {
		description: "Ice",
		tiles: ["ice.png"],
		drawtype: Drawtype.normal,
		paramtype: ParamType1.light,
		sunlight_propagates: true,
		is_ground_content: false,
		groups: { glass: 1, pathable: 1, slippery: 3 },
		sounds: crafter.stoneSound({
			footstep: { name: "glass_footstep", gain: 0.4 },
			dug: { name: "break_glass", gain: 0.4 },
		}),
		// use_texture_alpha = false,
		// alpha = 100,
		drop: "",
		after_destruct: (pos: Vec3) => {
			core.set_node(pos, { name: "crafter:water" });
		},
		canSilkTouch: true,
	});

	core.register_node("crafter:ice_mapgen", {
		description: "Ice",
		tiles: ["ice.png"],
		drawtype: Drawtype.normal,
		sunlight_propagates: true,
		is_ground_content: false,
		groups: { glass: 1, pathable: 1, slippery: 3 },
		sounds: crafter.stoneSound({
			footstep: { name: "glass_footstep", gain: 0.4 },
			dug: { name: "break_glass", gain: 0.4 },
		}),
		use_texture_alpha: TextureAlpha.opaque,
		drop: "",
		canSilkTouch: true,
		silkTouchSpecialDrop: "crafter:ice",
	});

	core.register_node("crafter:dirt", {
		description: "Dirt",
		tiles: ["dirt.png"],
		groups: { dirt: 1, soil: 1, pathable: 1, farm_tillable: 1 },
		sounds: crafter.dirtSound(),
		paramtype: ParamType1.light,
	});

	core.register_node("crafter:grass", {
		description: "Grass",
		tiles: ["grass.png"],
		groups: { grass: 1, soil: 1, pathable: 1, farm_tillable: 1 },
		sounds: crafter.dirtSound(),
		drop: "crafter:dirt",
		canSilkTouch: true,
	});

	core.register_node("crafter:sand", {
		description: "Sand",
		tiles: ["sand.png"],
		groups: { sand: 1, falling_node: 1, pathable: 1, soil: 1 },
		sounds: crafter.sandSound(),
	});

	core.register_node("crafter:gravel", {
		description: "Gravel",
		tiles: ["gravel.png"],
		groups: { sand: 1, falling_node: 1, pathable: 1 },
		sounds: crafter.dirtSound(),
		drop: {
			max_items: 1,
			items: [
				{
					// Only drop if using a tool whose name is identical to one
					// of these.
					rarity: 10,
					items: ["crafter:flint"],
					// Whether all items in the dropped item list inherit the
					// hardware coloring palette color from the dug node.
					// Default is 'false'.
					//inherit_color = true,
				},
				{
					// Only drop if using a tool whose name is identical to one
					// of these.
					//tools = {"crafter:shears"},
					rarity: 0,
					items: ["crafter:gravel"],
					// Whether all items in the dropped item list inherit the
					// hardware coloring palette color from the dug node.
					// Default is 'false'.
					//inherit_color = true,
				},
			],
		},
	});

	core.register_node("crafter:tree", {
		description: "Tree",
		tiles: [
			"treeCore.png",
			"treeCore.png",
			"treeOut.png",
			"treeOut.png",
			"treeOut.png",
			"treeOut.png",
		],
		groups: { wood: 1, tree: 1, pathable: 1, flammable: 1 },
		sounds: crafter.woodSound(),
		// Set metadata so treecapitator doesn't destroy houses
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		): ItemStackObject | void => {
			if (
				pointed_thing.type != PointedThingType.node ||
				pointed_thing.above == null ||
				pointed_thing.under == null
			) {
				return;
			}

			const sneak: boolean = placer.get_player_control().sneak;
			const noddef: NodeDefinition | undefined =
				core.registered_nodes[core.get_node(pointed_thing.under).name];

			if (!sneak && noddef && noddef.on_rightclick) {
				core.item_place(itemstack, placer, pointed_thing);
				return;
			}

			const pos: Vec3 = pointed_thing.above;
			core.item_place_node(itemstack, placer, pointed_thing);
			const meta: MetaRef = core.get_meta(pos);
			meta.set_string("placed", "true");
			return itemstack;
		},
		canSilkTouch: true,
	});

	core.register_node("crafter:wood", {
		description: "Wood",
		tiles: ["wood.png"],
		groups: { wood: 1, pathable: 1, flammable: 1 },
		sounds: crafter.woodSound(),
	});

	core.register_node("crafter:leaves", {
		description: "Leaves",
		drawtype: Drawtype.allfaces_optional,
		waving: 1,
		walkable: false,
		climbable: true,
		paramtype: ParamType1.light,
		is_ground_content: false,
		tiles: ["leaves.png"],
		groups: { leaves: 1, leafdecay: 1, flammable: 1 },
		sounds: crafter.grassSound(),
		drop: {
			max_items: 1,
			items: [
				{
					tools: ["crafter:shears"],
					items: ["crafter:dropped_leaves"],
				},
				{
					rarity: 25,
					items: ["crafter:apple"],
				},
				{
					rarity: 20,
					items: ["crafter:sapling"],
				},
			],
		},
	});

	core.register_node("crafter:dropped_leaves", {
		description: "Leaves",
		drawtype: Drawtype.allfaces_optional,
		waving: 0,
		walkable: false,
		climbable: false,
		paramtype: ParamType1.light,
		is_ground_content: false,
		tiles: ["leaves.png"],
		groups: { leaves: 1, flammable: 1 },
		sounds: crafter.grassSound(),
		drop: {
			max_items: 1,
			items: [
				{
					tools: ["crafter:shears"],
					items: ["crafter:dropped_leaves"],
				},
			],
		},
	});

	core.register_node("crafter:water", {
		description: "Water Source",
		drawtype: Drawtype.liquid,
		waving: 3,
		tiles: [
			{
				name: "water_source.png",
				backface_culling: false,
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 1,
				},
			},
			{
				name: "water_source.png",
				backface_culling: true,
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 1,
				},
			},
		],
		use_texture_alpha: TextureAlpha.blend,
		paramtype: ParamType1.light,
		walkable: false,
		pointable: false,
		diggable: false,
		buildable_to: true,
		is_ground_content: false,
		drop: "",
		liquidtype: LiquidType.source,
		liquid_alternative_flowing: "crafter:waterflow",
		liquid_alternative_source: "crafter:water",
		liquid_viscosity: 0,
		post_effect_color: { a: 103, r: 30, g: 60, b: 90 },
		groups: {
			water: 1,
			liquid: 1,
			cools_lava: 1,
			bucket: 1,
			source: 1,
			pathable: 1,
			drowning: 1,
			disable_fall_damage: 1,
			extinguish: 1,
		},
		// sounds = default.node_sound_water_defaults(),

		// Water explodes in the nether.
		on_construct: (pos: Vec3) => {
			const under: string = core.get_node(
				vector.create3d(pos.x, pos.y - 1, pos.z)
			).name;
			if (under == "nether:glowstone") {
				core.remove_node(pos);
				// todo: depends on the aether mod.
				// create_aether_portal(pos)
			} else if (pos.y <= -10033) {
				core.remove_node(pos);
				tnt.tnt(pos, 10);
			}
		},
	});

	core.register_node("crafter:waterflow", {
		description: "Water Flow",
		drawtype: Drawtype.flowingliquid,
		waving: 3,
		tiles: ["water_static.png"],
		special_tiles: [
			{
				name: "water_flow.png",
				backface_culling: false,
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 0.5,
				},
			},
			{
				name: "water_flow.png",
				backface_culling: true,
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 0.5,
				},
			},
		],
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [[0, 0, 0, 0, 0, 0]],
		},
		use_texture_alpha: TextureAlpha.blend,
		paramtype: ParamType1.light,
		paramtype2: ParamType2.flowingliquid,
		walkable: false,
		pointable: false,
		diggable: false,
		buildable_to: true,
		is_ground_content: false,
		drop: "",
		liquidtype: LiquidType.flowing,
		liquid_alternative_flowing: "crafter:waterflow",
		liquid_alternative_source: "crafter:water",
		liquid_viscosity: 0,
		post_effect_color: { a: 103, r: 30, g: 60, b: 90 },
		groups: {
			water: 1,
			liquid: 1,
			notInCreative: 1,
			cools_lava: 1,
			pathable: 1,
			drowning: 1,
			disable_fall_damage: 1,
			extinguish: 1,
		},
		// sounds = default.node_sound_water_defaults(),
	});

	core.register_node("crafter:lava", {
		description: "Lava",
		drawtype: Drawtype.liquid,
		tiles: [
			{
				name: "lava_source.png",
				backface_culling: false,
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 2.0,
				},
			},
			{
				name: "lava_source.png",
				backface_culling: true,
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 2.0,
				},
			},
		],
		paramtype: ParamType1.light,
		light_source: 13,
		walkable: false,
		pointable: false,
		diggable: false,
		buildable_to: true,
		is_ground_content: false,
		drop: "",
		drowning: 1,
		liquidtype: LiquidType.source,
		liquid_alternative_flowing: "crafter:lavaflow",
		liquid_alternative_source: "crafter:lava",
		liquid_viscosity: 7,
		liquid_renewable: false,
		post_effect_color: { a: 191, r: 255, g: 64, b: 0 },
		groups: { lava: 3, liquid: 2, igniter: 1, fire: 1, hurt_inside: 1 },
	});

	core.register_node("crafter:lavaflow", {
		description: "Flowing Lava",
		drawtype: Drawtype.flowingliquid,
		tiles: ["lava_flow.png"],
		special_tiles: [
			{
				name: "lava_flow.png",
				backface_culling: false,
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 3.3,
				},
			},
			{
				name: "lava_flow.png",
				backface_culling: true,
				animation: {
					type: TileAnimationType.vertical_frames,
					aspect_w: 16,
					aspect_h: 16,
					length: 3.3,
				},
			},
		],
		selection_box: {
			type: Nodeboxtype.fixed,
			fixed: [[0, 0, 0, 0, 0, 0]],
		},
		paramtype: ParamType1.light,
		paramtype2: ParamType2.flowingliquid,
		light_source: 13,
		walkable: false,
		pointable: false,
		diggable: false,
		buildable_to: true,
		is_ground_content: false,
		drop: "",
		drowning: 1,
		liquidtype: LiquidType.flowing,
		liquid_alternative_flowing: "crafter:lavaflow",
		liquid_alternative_source: "crafter:lava",
		liquid_viscosity: 7,
		liquid_renewable: false,
		liquid_range: 3,
		post_effect_color: { a: 191, r: 255, g: 64, b: 0 },
		groups: { lava: 3, liquid: 2, igniter: 1, fire: 1, hurt_inside: 1 },
	});

	core.register_node("crafter:ladder", {
		description: "Ladder",
		drawtype: Drawtype.signlike,
		tiles: ["ladder.png"],
		inventory_image: "ladder.png",
		wield_image: "ladder.png",
		paramtype: ParamType1.light,
		paramtype2: ParamType2.wallmounted,
		sunlight_propagates: true,
		walkable: false,
		climbable: true,
		is_ground_content: false,
		node_placement_prediction: "",
		selection_box: {
			type: Nodeboxtype.wallmounted,
			//wall_top = = <default>
			//wall_bottom = = <default>
			//wall_side = = <default>
		},
		groups: { wood: 1, flammable: 1, attached_node: 1 },
		sounds: crafter.woodSound(),
		on_place: (
			itemstack: ItemStackObject,
			placer: ObjectRef,
			pointed_thing: PointedThing
		): ItemStackObject | void => {
			if (
				pointed_thing.type != PointedThingType.node ||
				pointed_thing.above == null ||
				pointed_thing.under == null
			) {
				return itemstack;
			}

			const wdir: number = core.dir_to_wallmounted(
				vector.subtract(pointed_thing.under, pointed_thing.above)
			);

			const fakestack: ItemStackObject = itemstack;
			let retval: boolean = false;
			if (wdir > 1) {
				retval = fakestack.set_name("crafter:ladder");
			} else {
				return itemstack;
			}

			if (!retval) {
				return itemstack;
			}

			let above: Vec3 | null = null;
			[itemstack, above] = core.item_place(
				fakestack,
				placer,
				pointed_thing,
				wdir
			);

			if (above != null) {
				core.sound_play("wood", {
					pos: pointed_thing.above,
					gain: 1.0,
				});
			}

			return itemstack;
		},
	});
}
