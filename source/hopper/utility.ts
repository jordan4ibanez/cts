namespace hopper {
	// Target inventory retrieval.
	// Looks first for a registration matching the specific node name, then for a registration
	// matching group and value, then for a registration matching a group and *any* value.

	export function get_registered_inventories_for(
		target_node_name: string
	): ContainerData | undefined {
		return hopper.containers[target_node_name];
	}

	export function get_eject_button_texts(
		pos: Vec3,
		loc_X: number,
		loc_Y: number
	): string {
		let eject_button_text: string | null = null;
		let eject_button_tooltip: string | null = null;
		if (core.get_meta(pos).get_string("eject") == "true") {
			eject_button_text = "Don't\nEject";
			eject_button_tooltip =
				"This hopper is currently set to eject items from its output\neven if there isn't a compatible block positioned to receive it.\nClick this button to disable this feature.";
		} else {
			eject_button_text = "Eject\nItems";
			eject_button_tooltip =
				"This hopper is currently set to hold on to item if there\nisn't a compatible block positioned to receive it.\nClick this button to have it eject items instead.";
		}
		if (eject_button_text == null || eject_button_tooltip == null) {
			throw new Error("Logic issue.");
		}
		return (
			"button_exit[" +
			tostring(loc_X) +
			"," +
			tostring(loc_Y) +
			";1,1;eject;" +
			eject_button_text +
			"]tooltip[eject;" +
			eject_button_tooltip +
			"]"
		);
	}

	export function get_string_pos(pos: Vec3): string {
		return tostring(pos.x) + "," + tostring(pos.y) + "," + tostring(pos.z);
	}

	// Apparently node_sound_metal_defaults is a newer thing, I ran into games using an older version of the default mod without it.
	export const metal_sounds = crafter.stoneSound();

	// Inventory transfer functions
	function delay(x: any): () => any {
		return () => {
			return x;
		};
	}

	function get_placer(player_name: string): ObjectRef | null {
		if (player_name != "") {
			return core.get_player_by_name(player_name);
		}
		return null;
	}

	// Used to remove items from the target block and put it into the hopper's inventory.
	export function take_item_from(
		hopper_pos: Vec3,
		target_pos: Vec3,
		target_node: NodeTable,
		target_inventory_name?: string
	): void {
		if (target_inventory_name == null) {
			return;
		}
		const target_def: NodeDefinition | undefined =
			core.registered_nodes[target_node.name];
		if (target_def == null) {
			return;
		}
		// Hopper inventory.
		const hopper_meta: MetaRef = core.get_meta(hopper_pos);
		const hopper_inv: InvRef = hopper_meta.get_inventory();

		
		const placer: ObjectRef | null = get_placer(
			hopper_meta.get_string("placer")
		);

		if (placer == null) {
			throw new Error("WHY, is this using AN OBJECT REFERENCE?!");
		}

		// Source inventory.
		const target_inv: InvRef = core.get_meta(target_pos).get_inventory();
		const target_inv_size: number = target_inv.get_size(
			target_inventory_name
		);
		if (target_inv.is_empty(target_inventory_name)) {
			return;
		}

		for (const i of $range(1, target_inv_size)) {
			const stack: ItemStackObject = target_inv.get_stack(
				target_inventory_name,
				i
			);
			const item: string = stack.get_name();
			if (item == "") {
				continue;
			}
			if (!hopper_inv.room_for_item("main", item)) {
				continue;
			}
			const stack_to_take: ItemStackObject = stack.take_item(1);

			if (
				target_def.allow_metadata_inventory_take == null ||
				target_def.allow_metadata_inventory_take(
					target_pos,
					target_inventory_name,
					i,
					stack_to_take,
					placer
				) > 0
			) {
				// 						target_inv:set_stack(target_inventory_name, i, stack)
				// 						//add to hopper
				// 						hopper_inv:add_item("main", stack_to_take)
				// 						if target_def.on_metadata_inventory_take ~= nil and placer ~= nil then
				// 							target_def.on_metadata_inventory_take(target_pos, target_inventory_name, i, stack_to_take, placer)
				// 						end
				// 						break
			}
		}
	}

	// // Used to put items from the hopper inventory into the target block
	// hopper.send_item_to = function(hopper_pos, target_pos, target_node, target_inventory_name, filtered_items)
	// 	local hopper_meta = core.get_meta(hopper_pos)
	// 	local target_def = core.registered_nodes[target_node.name]
	// 	if not target_def then
	// 		return false
	// 	end
	// 	local eject_item = hopper.config.eject_button_enabled and hopper_meta:get_string("eject") == "true" and target_def.buildable_to
	// 	if not eject_item and not target_inventory_name then
	// 		return false
	// 	end
	// 	//hopper inventory
	// 	local hopper_meta = core.get_meta(hopper_pos);
	// 	local hopper_inv = hopper_meta:get_inventory()
	// 	if hopper_inv:is_empty("main") == true then
	// 		return false
	// 	end
	// 	local hopper_inv_size = hopper_inv:get_size("main")
	// 	local placer = get_placer(hopper_meta:get_string("placer"))
	// 	//target inventory
	// 	local target_inv = core.get_meta(target_pos):get_inventory()
	// 	for i = 1,hopper_inv_size do
	// 		local stack = hopper_inv:get_stack("main", i)
	// 		local item = stack:get_name()
	// 		if item ~= "" and (filtered_items == nil or filtered_items[item]) then
	// 			if target_inventory_name then
	// 				if target_inv:room_for_item(target_inventory_name, item) then
	// 					local stack_to_put = stack:take_item(1)
	// 					if target_def.allow_metadata_inventory_put == nil
	// 					or placer == nil // backwards compatibility, older versions of this mod didn't record who placed the hopper
	// 					or target_def.allow_metadata_inventory_put(target_pos, target_inventory_name, i, stack_to_put, placer) > 0 then
	// 						hopper_inv:set_stack("main", i, stack)
	// 						//add to target node
	// 						target_inv:add_item(target_inventory_name, stack_to_put)
	// 						if target_def.on_metadata_inventory_put ~= nil and placer ~= nil then
	// 							target_def.on_metadata_inventory_put(target_pos, target_inventory_name, i, stack_to_put, placer)
	// 						end
	// 						return true
	// 					end
	// 				end
	// 			elseif eject_item then
	// 				local stack_to_put = stack:take_item(1)
	// 				core.add_item(target_pos, stack_to_put)
	// 				hopper_inv:set_stack("main", i, stack)
	// 				return true
	// 			end
	// 		end
	// 	end
	// 	return false
	// end
}
