// local
// minetest,math,pairs,table
// =
// minetest,math,pairs,table

namespace door {
	const get_item_group = core.get_item_group;
	const get_node = core.get_node;
	const set_node = core.set_node;
	const play_sound = core.sound_play;
	const t_copy = table.copy;

	// local node
	// local name
	// local opened
	// local closed
	// local closed
	// local top
	// local bottom
	// local param2
	// local pos2

	for (const material of ["wood", "iron"]) {
		// This is the function that makes the door open and close when rightclicked.
		function door_rightclick(pos: Vec3) {
			const node: NodeTable = get_node(pos);
			const name: string = node.name;
			const opened: number = get_item_group(name, "crafter_door_open");
			const closed: number = get_item_group(name, "crafter_door_closed");
			const top: number = get_item_group(name, "crafter_door_top");
			const bottom: number = get_item_group(name, "crafter_door_bottom");
			const param2: number | undefined = node.param2;
			const pos2: Vec3 = vector.create3d(pos);

			// Close the door.
			if (opened > 0) {
				play_sound("door_close", {
					pos: pos,
					pitch: math.random(80, 100) / 100,
				});

				if (top > 0) {
					pos2.y = pos2.y - 1;
					set_node(pos, {
						name: "door:top_" + material + "_closed",
						param2: param2,
					});
					set_node(pos2, {
						name: "door:bottom_" + material + "_closed",
						param2: param2,
					});
				} else if (bottom > 0) {
					pos2.y = pos2.y + 1;
					set_node(pos, {
						name: "door:bottom_" + material + "_closed",
						param2: param2,
					});
					set_node(pos2, {
						name: "door:top_" + material + "_closed",
						param2: param2,
					});
				}

				// Open the door.
			} else if (closed > 0) {
				play_sound("door_open", {
					pos: pos,
					pitch: math.random(80, 100) / 100,
				});
				if (top > 0) {
					pos2.y = pos2.y - 1;
					set_node(pos, {
						name: "door:top_" + material + "_open",
						param2: param2,
					});
					set_node(pos2, {
						name: "door:bottom_" + material + "_open",
						param2: param2,
					});
				} else if (bottom > 0) {
					pos2.y = pos2.y + 1;
					set_node(pos, {
						name: "door:bottom_" + material + "_open",
						param2: param2,
					});
					set_node(pos2, {
						name: "door:top_" + material + "_open",
						param2: param2,
					});
				}
			}
		}

		// This is where the top and bottom of the door are created.
		for (const door of ["top","bottom"]) {
				for (const state of  ["open","closed"]) {
					let door_node_box: number[]= []
					if (state == "closed") {
						door_node_box = [-0.5, -0.5,  -0.5, 0.5,  0.5, -0.3]
                    } else if (state == "open") {
						door_node_box = [5/16, -0.5,  -0.5, 0.5,  0.5, 0.5]
                    }

		// 			local tiles
		// 			local groups
		// 			local sounds
		// 			local on_rightclick
					let redstone_deactivation: ((pos: Vec3) => void) | undefined;
					let redstone_activation: ((pos: Vec3) => void) | undefined
                    
					// Redstone input.
					if (state == "open") {
						redstone_deactivation = (pos: Vec3) => {
							door_rightclick(pos)
                        }
                    } else if (state == "closed") {
						redstone_activation = (pos: Vec3) => {
							door_rightclick(pos)
                        }
                    }

		// 			if material == "wood" then
		// 				sounds = main.woodSound()
		// 				on_rightclick = function(pos, node, clicker, itemstack, pointed_thing)
		// 					door_rightclick(pos)
		// 				end
		// 				//bottom
		// 				if door == "bottom" then
		// 					tiles = {"wood.png"}
		// 					groups = {wood = 2, tree = 1, hard = 1, axe = 1, hand = 3, crafter_door_bottom = 1,door_open = ((state == "open" and 1) or 0),door_closed = ((state == "closed" and 1) or 0)}

		// 				//top
		// 				else
		// 					if state == "closed" then
		// 						tiles = {"wood.png","wood.png","wood.png","wood.png","wood_door_top.png","wood_door_top.png"}
		// 					elseif state == "open" then
		// 						tiles = {"wood.png","wood.png","wood_door_top.png","wood_door_top.png","wood.png","wood.png"}
		// 					end
		// 					groups = {wood = 2, tree = 1, hard = 1, axe = 1, hand = 3, redstone_activation = 1, crafter_door_top = 1,door_open = ((state == "open" and 1) or 0),door_closed = ((state == "closed" and 1) or 0)}
		// 				end
		// 			elseif material == "iron" then
		// 				sounds = main.stoneSound()
		// 				if door == "bottom" then
		// 					tiles = {"iron_block.png"}
		// 					groups = {stone = 1, hard = 1, pickaxe = 1, hand = 4, bottom = 1,crafter_door_open = ((state == "open" and 1) or 0),crafter_door_closed = ((state == "closed" and 1) or 0)}

		// 				else
		// 					if state == "closed" then
		// 						tiles = {"iron_block.png","iron_block.png","iron_block.png","iron_block.png","iron_door_top.png","iron_door_top.png"}
		// 					elseif state == "open" then
		// 						tiles = {"iron_block.png","iron_block.png","iron_door_top.png","iron_door_top.png","iron_block.png","iron_block.png"}
		// 					end
		// 					groups = {stone = 1, hard = 1, pickaxe = 1, hand = 4, redstone_activation = 1, top = 1,crafter_door_open = ((state == "open" and 1) or 0),crafter_door_closed = ((state == "closed" and 1) or 0)}
		// 				end
		// 			end
		// 			core.register_node("door:"..door.."_"..material.."_"..state, {
		// 				description = material:gsub("^%l", string.upper).." Door",
		// 				tiles = tiles,
		// 				wield_image = "door_inv_"..material..".png",
		// 				inventory_image = "door_inv_"..material..".png",
		// 				drawtype = "nodebox",
		// 				paramtype = "light",
		// 				paramtype2 = "facedir",
		// 				groups = groups,
		// 				sounds = sounds,
		// 				drop = "door:bottom_"..material.."_closed",
		// 				node_placement_prediction = "",
		// 				node_box = {
		// 					type = "fixed",
		// 					fixed = {
		// 							//left front bottom right back top
		// 							door_node_box
		// 						},
		// 					},
		// 				//redstone activation is in both because only the bottom is defined as an activator and it's easier to do it like this

		// 				redstone_activation = redstone_activation,
		// 				redstone_deactivation = redstone_deactivation,

		// 				on_rightclick = on_rightclick,
		// 				after_place_node = function(pos, placer, itemstack, pointed_thing)
		// 					local node = get_node(pos)
		// 					local param2 = node.param2
		// 					local pos2 = t_copy(pos)
		// 					pos2.y = pos2.y + 1
		// 					if get_node(pos2).name == "air" then
		// 						set_node(pos2,{name="door:top_"..material.."_closed",param2=param2})
		// 					else
		// 						core.remove_node(pos)
		// 						itemstack:add_item(ItemStack("door:bottom_"..material.."_closed"))
		// 					end
		// 				end,
		// 				after_dig_node = function(pos, oldnode, oldmetadata, digger)
		// 					if string.match(oldnode.name, ":bottom") then
		// 						pos.y = pos.y + 1
		// 						core.remove_node(pos)
		// 					else
		// 						pos.y = pos.y - 1
		// 						core.remove_node(pos)
		// 					end
		// 				end,
		// 			})
                }
        }
		// core.register_craft({
		// 	output = "door:bottom_"..material.."_closed",
		// 	recipe = {
		// 		{"main:"..material,"main:"..material},
		// 		{"main:"..material,"main:"..material},
		// 		{"main:"..material,"main:"..material}
		// 	}
		// })
	}
}
