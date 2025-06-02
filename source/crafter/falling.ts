namespace crafter {
	// local
	// minetest,vector,table,pairs,type,math
	// =
	// minetest,vector,table,pairs,type,math

	//
	// Falling entity rewrite.
	//

	// local param_translation = {
	// 	[0] = 0,
	// 	[3] = math.pi/2,
	// 	[2] = math.pi,
	// 	[1] = math.pi*1.5,
	// }

	const facedir_to_euler: { x: number; y: number; z: number }[] = [
		{ y: 0, x: 0, z: 0 },
		{ y: -math.pi / 2, x: 0, z: 0 },
		{ y: math.pi, x: 0, z: 0 },
		{ y: math.pi / 2, x: 0, z: 0 },
		{ y: math.pi / 2, x: -math.pi / 2, z: math.pi / 2 },
		{ y: math.pi / 2, x: math.pi, z: math.pi / 2 },
		{ y: math.pi / 2, x: math.pi / 2, z: math.pi / 2 },
		{ y: math.pi / 2, x: 0, z: math.pi / 2 },
		{ y: -math.pi / 2, x: math.pi / 2, z: math.pi / 2 },
		{ y: -math.pi / 2, x: 0, z: math.pi / 2 },
		{ y: -math.pi / 2, x: -math.pi / 2, z: math.pi / 2 },
		{ y: -math.pi / 2, x: math.pi, z: math.pi / 2 },
		{ y: 0, x: 0, z: math.pi / 2 },
		{ y: 0, x: -math.pi / 2, z: math.pi / 2 },
		{ y: 0, x: math.pi, z: math.pi / 2 },
		{ y: 0, x: math.pi / 2, z: math.pi / 2 },
		{ y: math.pi, x: math.pi, z: math.pi / 2 },
		{ y: math.pi, x: math.pi / 2, z: math.pi / 2 },
		{ y: math.pi, x: 0, z: math.pi / 2 },
		{ y: math.pi, x: -math.pi / 2, z: math.pi / 2 },
		{ y: math.pi, x: math.pi, z: 0 },
		{ y: -math.pi / 2, x: math.pi, z: 0 },
		{ y: 0, x: math.pi, z: 0 },
		{ y: math.pi / 2, x: math.pi, z: 0 },
	];

	class FallingNode extends types.Entity {
		override name: string = ":__builtin:falling_node";
		initial_properties = {
			visual: EntityVisual.wielditem,
			visual_size: { x: 0.667, y: 0.667 },
			textures: [],
			physical: true,
			is_visible: false,
			collide_with_objects: false,
			collisionbox: [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5],
		};

		node: NodeTable = {
			name: "",
		};
		meta?: MetaData;
		floats: boolean = false;
		liquidtype?: LiquidType;

		set_node(node: NodeTable, metadata?: MetaRef | MetaData): void {
			node.param2 = node.param2 || 0;

			this.node = node;

			let meta: MetaRef | MetaData = {} as MetaRef;

			if (
				(meta as MetaRef).to_table &&
				type((meta as MetaRef).to_table) == "function"
			) {
				const attempt = (meta as MetaRef).to_table();
				if (attempt) {
					meta = attempt;
				}
			}

			// This was transformed in the previous statement, I think?
			meta = meta as MetaData;

			for (let [_, list] of pairs(meta.inventory || {})) {
				for (let [i, stack] of pairs(list)) {
					if (type(stack) == "userdata") {
						list[i as number] = (
							stack as ItemStackObject
						).to_string();
					}
				}
			}

			const def: NodeDefinition | undefined =
				core.registered_nodes[node.name];

			if (!def) {
				// Don't allow unknown nodes to fall.
				core.log(
					LogLevel.error,
					"Unknown falling node removed at " +
						core.pos_to_string(this.object.get_pos())
				);
				this.object.remove();
				return;
			}

			this.meta = meta;

			// Cache whether we're supposed to float on water.
			this.floats = core.get_item_group(node.name, "float") != 0;

			// Save liquidtype for falling water
			this.liquidtype = def.liquidtype;

			// Set up entity visuals.
			// For compatibility with older clients we continue to use "item" visual
			// for simple situations.

			const drawtypes: { [id: string]: boolean } = {
				normal: true,
				glasslike: true,
				allfaces: true,
				nodebox: true,
			};

			const p2types: { [id: string]: boolean } = {
				none: true,
				facedir: true,
				"4dir": true,
			};

			if (
				def.drawtype &&
				drawtypes[def.drawtype] &&
				def.paramtype2 &&
				p2types[def.paramtype2] &&
				def.use_texture_alpha != TextureAlpha.blend
			) {
				// Calculate size of falling node.
				const s: Vec3 = vector.zero();
				s.x = (def.visual_scale || 1) * 0.667;
				s.y = s.x;
				s.z = s.x;
				// Compensate for wield_scale.
				if (def.wield_scale) {
					s.x = s.x / def.wield_scale.x;
					s.y = s.y / def.wield_scale.y;
					s.z = s.z / def.wield_scale.z;
				}
				this.object.set_properties({
					is_visible: true,
					visual: EntityVisual.item,
					wield_item: node.name,
					visual_size: s,
					glow: def.light_source,
				});
				// Rotate as needed.
				if (def.paramtype2 == ParamType2.facedir) {
					const fdir: number = (node.param2 % 32) % 24;
					const euler: Vec3 | null = facedir_to_euler[
						fdir + 1
					] as Vec3;
					if (euler != null) {
						this.object.set_rotation(euler);
					}
				} else if (def.paramtype2 == ParamType2["4dir"]) {
					const fdir: number = node.param2 % 4;
					const euler: Vec3 | null = facedir_to_euler[
						fdir + 1
					] as Vec3;
					if (euler != null) {
						this.object.set_rotation(euler);
					}
				}
			} else if (def.drawtype != Drawtype.airlike) {
				this.object.set_properties({
					is_visible: true,
					node: node,
					glow: def.light_source,
				});
			}

			// Set collision box (certain nodeboxes only for now).
			const nb_types: { [id: string]: boolean } = {
				fixed: true,
				leveled: true,
				connected: true,
			};

			if (
				def.drawtype == Drawtype.nodebox &&
				def.node_box &&
				nb_types[def.node_box.type] &&
				def.node_box.fixed
			) {
				let box: number | number[] | number[][] | null =
					def.node_box.fixed.slice();

				if (box && type(box[1]) == "table") {
					box = (box.length == 1 && box[1]) || null; // We can only use a single box.
				}

				if (box != null) {
					box = box as number[];
					if (
						def.paramtype2 == ParamType2.leveled &&
						(this.node.level || 0) > 0
					) {
						box[5] = -0.5 + (this.node.level || 0) / 64;
					}
					this.object.set_properties({
						collisionbox: box,
					});
				}
			}
		}

		get_staticdata(): string {
			const ds = {
				node: this.node,
				meta: this.meta,
			};
			return core.serialize(ds);
		}

		on_activate(staticdata: string): void {
			this.object.set_armor_groups({ immortal: 1 });

			// Lua unsafety just kinda unravels here.
			const ds: { node: MapNode; meta: MetaData } | MapNode | any =
				core.deserialize(staticdata);

			if (ds && ds.node) {
				this.set_node(ds.node, ds.meta);
			} else if (ds) {
				this.set_node(ds);
			} else if (staticdata != "") {
				this.set_node({ name: staticdata } as MapNode);
			}
		}

		on_step(delta: number) {
			// Set gravity
			const acceleration: Vec3 = this.object.get_acceleration();
			if (
				!vector.equals(
					acceleration,
					vector.create3d({ x: 0, y: -10, z: 0 })
				)
			) {
				this.object.set_acceleration(
					vector.create3d({ x: 0, y: -10, z: 0 })
				);
			}
			// Turn to actual node when colliding with ground, or continue to move
			const pos: Vec3 = this.object.get_pos();
			// Position of bottom center point
			const bcp: Vec3 = vector.create3d({
				x: pos.x,
				y: pos.y - 0.7,
				z: pos.z,
			});
			// 'bcn' is nil for unloaded nodes
			const bcn: NodeTable | null = core.get_node_or_nil(bcp);
			// Delete on contact with ignore at world edges
			if (bcn && bcn.name == "ignore") {
				this.object.remove();
				return;
			}

			const bcd = bcn && core.registered_nodes[bcn.name];
			if (
				bcn &&
				(!bcd ||
					bcd.walkable ||
					(core.get_item_group(this.node.name, "float") != 0 &&
						bcd.liquidtype != LiquidType.none))
			) {
				if (bcd && bcd.leveled && bcn.name == this.node.name) {
					let addlevel = this.node.level;
					if (!addlevel || addlevel <= 0) {
						addlevel = bcd.leveled;
					}
					if (core.add_node_level(bcp, addlevel) == 0) {
						this.object.remove();
						return;
					}
				} else if (
					bcd &&
					bcd.buildable_to &&
					(core.get_item_group(this.node.name, "float") == 0 ||
						bcd.liquidtype == LiquidType.none)
				) {
					core.remove_node(bcp);
					return;
				}
				const np: Vec3 = vector.create3d({
					x: bcp.x,
					y: bcp.y + 1,
					z: bcp.z,
				});
				// Check what's here
				const n2: NodeTable = core.get_node(np);
				const nd: NodeDefinition | undefined =
					core.registered_nodes[n2.name];
				// If it's not air or liquid, remove node and replace it with
				// it's drops
				if (
					n2.name != "air" &&
					(!nd || nd.liquidtype == LiquidType.none)
				) {
					const drops: string[] | null = core.get_node_drops(
						this.node.name,
						""
					);
					if (drops && drops.length > 0) {
						for (const [_, droppy] of pairs(drops)) {
							// fixme: this was engine custom.
							// core.throw_item(np,droppy)
						}
					} else {
						// fixme: this was engine custom.
						// core.throw_item(np,self.node)
					}
					this.object.remove();
					return;
				}

				// Create node and remove entity
				const def: NodeDefinition | undefined =
					core.registered_nodes[this.node.name];
				if (def != null) {
					core.add_node(np, this.node);

					if (this.meta) {
						const meta: MetaRef = core.get_meta(np);
						meta.from_table(this.meta);
					}
					if (def.sounds && def.sounds.fall) {
						core.sound_play(def.sounds.fall, { pos: np }, true);
					}
				}
				this.object.remove();
				core.check_for_falling(np);
				return;
			}
			const vel: Vec3 = this.object.get_velocity();
			if (vector.equals(vel, vector.create3d({ x: 0, y: 0, z: 0 }))) {
				const npos: Vec3 = this.object.get_pos();
				this.object.set_pos(vector.round(npos));
			}
		}
	}

	utility.registerTSEntity(FallingNode);

	// core.register_on_joinplayer((player: ObjectRef) => {
	// 	const pos = player.get_pos();
	// 	pos.y += 5;

	// 	core.set_node(pos, { name: "crafter:dirt" });
	// 	core.spawn_falling_node(pos);
	// });
}
