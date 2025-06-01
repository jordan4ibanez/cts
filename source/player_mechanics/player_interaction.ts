namespace playerMechanics {
	const add_item = core.add_item;
	const random = math.random;
	const play_sound = core.sound_play;
	const add_ps = core.add_particlespawner;
	const abs = math.abs;
	const ceil = math.ceil;
	const new_vec = vector.create3d;
	const multiply_vec = vector.multiply;

	// Hurt sound and disable fall damage group handling.
	// todo: was this sound playing twice?
	// core.register_on_player_hpchange(function(player, hp_change, reason)
	// 	if reason.type == "fall" then
	// 		//fall damage is handled on another globalstep calc
	// 		return(0)
	// 	elseif hp_change < 0 and reason.reason ~= "correction" then
	// 		play_sound("hurt", {object=player, gain = 1.0, max_hear_distance = 60,pitch = random(80,100)/100})
	// 	end
	// 	return(hp_change)
	// end, true)

	// Throw all items on death.
	// local pos
	// local inv
	// local stack
	// local count
	// local obj
	// local name

	core.register_on_dieplayer(
		(player: ObjectRef, reason: HPChangeReasonDefinition) => {
			const pos: Vec3 = player.get_pos();
			const inv: InvRef = player.get_inventory();
			for (const i of $range(1, inv.get_size("main"))) {
				const stack: ItemStackObject = inv.get_stack("main", i);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("main", i, ItemStack(""));
				}
			}

			{
				const stack: ItemStackObject = inv.get_stack("armor_head", 1);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("armor_head", 1, ItemStack(""));
				}
			}

			{
				const stack: ItemStackObject = inv.get_stack("armor_torso", 1);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("armor_torso", 1, ItemStack(""));
				}
			}
			{
				const stack: ItemStackObject = inv.get_stack("armor_legs", 1);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("armor_legs", 1, ItemStack(""));
				}
			}
			{
				const stack: ItemStackObject = inv.get_stack("armor_feet", 1);
				const name: string = stack.get_name();
				if (name != "") {
					item_handling.throw_item(pos, stack);
					inv.set_stack("armor_feet", 1, ItemStack(""));
				}
			}
			// todo: dump_craft comes from player_mechanics
			// 	dump_craft(player)
			// todo: this needs the crafter armor mod
			// 	recalculate_armor(player)
		}
	);

	// This dumps the players crafting table on closing the inventory.
	export function dump_craft(player: ObjectRef): void {
		const pos: Vec3 = player.get_pos();
		const inv: InvRef = player.get_inventory();
		for (const i of $range(1, inv.get_size("craft"))) {
			const stack: ItemStackObject = inv.get_stack("craft", i);
			const name: string = stack.get_name();
			if (name != "") {
				item_handling.throw_item(pos, stack);
				inv.set_stack("craft", i, ItemStack(""));
			}
		}
	}

	// Play sound to keep up with player's placing vs inconsistent client placing sound.

	// local node
	// local sound
	// local placing

	core.register_on_placenode(
		(pos, newnode, placer, oldnode, itemstack, pointed_thing) => {
			const node: NodeDefinition | undefined =
				core.registered_nodes[newnode.name];
			if (node == null) {
				throw new Error(
					`Player [${placer.get_player_name()}] placed a non-existent node [${
						newnode.name
					}]`
				);
			}

			// 	sound = node.sounds
			// 	placing = ""
			// 	if sound then
			// 		placing = sound.placing
			// 	end
			// 	//only play the sound when is defined
			// 	if type(placing) == "table" then
			// 		play_sound(placing.name, {
			// 			  pos = pos,
			// 			  gain = placing.gain,
			// 			  max_hear_distance = 32,
			// 			  //pitch = random(60,100)/100
			// 		})
			// 	end
		}
	);

	// //replace stack when empty (building)
	// local new
	// local inv
	// local old
	// local count
	// core.register_on_placenode(function(pos, newnode, placer, oldnode, itemstack, pointed_thing)
	// 	old = itemstack:get_name()
	// 	//pass through to check
	// 	core.after(0,function(pos, newnode, placer, oldnode, itemstack, pointed_thing,old)
	// 		if not placer then
	// 			return
	// 		end
	// 		new = placer:get_wielded_item():get_name()
	// 		if old ~= new and new == "" then
	// 			inv = placer:get_inventory()
	// 			//check if another stack
	// 			if inv:contains_item("main", old) then
	// 				//print("moving stack")
	// 				//run through inventory
	// 				for i = 1,inv:get_size("main") do
	// 					//if found set wielded item and remove old stack
	// 					if inv:get_stack("main", i):get_name() == old then
	// 						count = inv:get_stack("main", i):get_count()
	// 						placer:set_wielded_item(old.." "..count)
	// 						inv:set_stack("main",i,ItemStack(""))
	// 						play_sound("pickup", {
	// 							  to_player = player,
	// 							  gain = 0.7,
	// 							  pitch = random(60,100)/100
	// 						})
	// 						return
	// 					end
	// 				end
	// 			end
	// 		end
	// 	end,pos, newnode, placer, oldnode, itemstack, pointed_thing,old)
	// end)
	// local do_critical_particles = function(pos)
	// 	add_ps({
	// 		amount = 40,
	// 		time = 0.001,
	// 		minpos = pos,
	// 		maxpos = pos,
	// 		minvel = new_vec(-2,-2,-2),
	// 		maxvel = new_vec(2,8,2),
	// 		minacc = {x=0, y=4, z=0},
	// 		maxacc = {x=0, y=12, z=0},
	// 		minexptime = 1.1,
	// 		maxexptime = 1.5,
	// 		minsize = 1,
	// 		maxsize = 2,
	// 		collisiondetection = false,
	// 		vertical = false,
	// 		texture = "critical.png",
	// 	})
	// end
	// //we need to do this to override the default damage mechanics
	// local pool = {}
	// local name
	// core.register_on_joinplayer(function(player)
	// 	name = player:get_player_name()
	// 	pool[name] = core.get_us_time()/1000000
	// end)
	// local name
	// function player_can_be_punched(player)
	// 	name = player:get_player_name()
	// 	return((core.get_us_time()/1000000)-pool[name] >= 0.5)
	// end
	// //this throws the player when they're punched and activates the custom damage mechanics
	// local name
	// local temp_pool
	// local hurt
	// local punch_diff
	// local hurt
	// local hp
	// local puncher_vel
	// local vel
	// local hp_modifier
	// local modify_output
	// core.register_on_punchplayer(function(player, hitter, time_from_last_punch, tool_capabilities, dir, damage)
	// 	name = player:get_player_name()
	// 	temp_pool = pool[name]
	// 	punch_diff = (core.get_us_time()/1000000)-temp_pool
	// 	hurt = tool_capabilities.damage_groups.damage
	// 	if not hurt then
	// 		hurt = 0
	// 	end
	// 	hp = player:get_hp()
	// 	if punch_diff >= 0.5 and hp > 0 then
	// 		temp_pool = core.get_us_time()/1000000
	// 		if hitter:is_player() and hitter ~= player then
	// 			puncher_vel = hitter:get_player_velocity().y
	// 			if puncher_vel < 0 then
	// 				hurt = hurt * 1.5
	// 				do_critical_particles(player:get_pos())
	// 				play_sound("critical", {pos=player:get_pos(), gain = 0.1, max_hear_distance = 16,pitch = random(80,100)/100})
	// 			end
	// 		end
	// 		dir = multiply_vec(dir,10)
	// 		vel = player:get_player_velocity()
	// 		dir.y = 0
	// 		if vel.y <= 0 then
	// 			dir.y = 7
	// 		end
	// 		hp_modifier = ceil(calculate_armor_absorbtion(player)/3)
	// 		//print("hp_modifier:",hp_modifier)
	// 		damage_armor(player,abs(hurt))
	// 		//print("hurt:",hurt,"|","hp_modifier:",hp_modifier)
	// 		modify_output = (hurt == 0)
	// 		hurt = hurt - hp_modifier
	// 		if not modify_output and hurt <= 0 then
	// 			hurt = 1
	// 		elseif modify_output then
	// 			hurt = 0
	// 		end
	// 		player:add_player_velocity(dir)
	// 		player:set_hp(hp-hurt)
	// 	end
	// end)
	// local inv
	// core.register_on_respawnplayer(function(player)
	// 	player:add_player_velocity(multiply_vec(player:get_player_velocity(),-1))
	// 	inv = player:get_inventory()
	// 	inv:set_list("main", {})
	// 	inv:set_list("craft", {})
	//     inv:set_list("craftpreview", {})
	//     inv:set_list("armor_head", {})
	//     inv:set_list("armor_torso", {})
	//     inv:set_list("armor_legs", {})
	//     inv:set_list("armor_feet", {})
	// end)
}
