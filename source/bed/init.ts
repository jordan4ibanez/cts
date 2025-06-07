namespace bed {
	const mod_storage: MetaRef = core.get_mod_storage();

	const timeNightBegin = 19000;
	const timeNightEnd = 5500;

	const sleep_channel = new Map<string, ModChannel>();

	const pool = {};

	const sleep_loop: boolean = false;

	core.register_on_joinplayer((player: ObjectRef) => {
		const name: string = player.get_player_name();
		sleep_channel.set(
			name,
			core.mod_channel_join(name + ":crafter_sleep_channel")
		);
	});

	function csm_send_player_to_sleep(player: ObjectRef): void {
		const name: string = player.get_player_name();
		const channel: ModChannel | undefined = sleep_channel.get(name);
		if (channel == null) {
			throw new Error(`Player [${name}] has no sleep channel.`);
		}
		channel.send_all("1");
	}

	function csm_wake_player_up(player: ObjectRef): void {
		const name: string = player.get_player_name();
		const channel: ModChannel | undefined = sleep_channel.get(name);
		if (channel == null) {
			throw new Error(`Player [${name}] has no sleep channel.`);
		}
		channel.send_all("0");
	}

	// core.register_on_modchannel_message(function(channel_name, sender, message)
	// 	local channel_decyphered = channel_name:gsub(sender,"")
	// 	if channel_decyphered == ":crafter_sleep_channel" then
	// 		if pool[sender] then
	// 			pool[sender].sleeping = true
	// 		end
	// 	end
	// end)
	// local name
	// local wake_up = function(player)
	// 	name = player:get_player_name()
	// 	player_is_sleeping(player,false)
	// 	player:set_eye_offset({x=0,y=0,z=0},{x=0,y=0,z=0})
	// 	pool[name] = nil
	// 	core.close_formspec(name, "bed")
	// 	csm_wake_player_up(player)
	// end
	// local function global_sleep_check()
	// 	sleep_loop = true
	// 	//core.chat_send_all("sleep looping"+tostring(math.random()))
	// 	local sleep_table = {}
	// 	for _,player in ipairs(core.get_connected_players()) do
	// 		local name = player:get_player_name()
	// 		sleep_table[name] = true
	// 	end
	// 	local bed_count = 0
	// 	for name,data in pairs(pool) do
	// 		local player = core.get_player_by_name(name)
	// 		if player then
	// 			bed_count = bed_count + 1
	// 			if data.sleeping then
	// 				sleep_table[name] = nil
	// 			end
	// 			if data.pos then
	// 				player:move_to(data.pos)
	// 			end
	// 		else
	// 			pool[name] = nil
	// 		end
	// 	end
	// 	local count = 0
	// 	for name,val in pairs(sleep_table) do
	// 		count = count + 1
	// 	end
	// 	if count == 0 then
	// 		core.set_timeofday(time_night.ending/24000)
	// 		for _,player in ipairs(core.get_connected_players()) do
	// 			wake_up(player)
	// 		end
	// 		sleep_loop = false
	// 		return
	// 	end
	// 	if bed_count == 0 then
	// 		sleep_loop = false
	// 	end
	// end
	// local global_step_timer = 0
	// core.register_globalstep(function(dtime)
	// 	if sleep_loop then
	// 		global_step_timer = global_step_timer + dtime
	// 		if global_step_timer > 0.25 then
	// 			global_step_timer = 0
	// 			global_sleep_check()
	// 		end
	// 	end
	// end)
	// // delete data on player leaving
	// local name
	// core.register_on_leaveplayer(function(player)
	// 	name = player:get_player_name()
	// 	pool[name] = nil
	// end)
	// local bed_gui = "size[16,12]"+
	// "position[0.5,0.5]"+
	// "bgcolor[#00000000]"+
	// "button[5.5,8.5;5,2;button;leave bed]"
	// local yaw_translation = {
	// 	[0] = math.pi,
	// 	[1] = math.pi/2,
	// 	[2] = 0,
	// 	[3] = math.pi*1.5,
	// }
	// local name
	// local time
	// local do_sleep = function(player,pos,dir)
	// 	time = core.get_timeofday() * 24000
	// 	name = player:get_player_name()
	// 	if time > time_night.begin or time < time_night.ending then
	// 		local real_dir = core.facedir_to_dir(dir)
	// 		player:add_player_velocity(vector.multiply(player:get_player_velocity(),-1))
	// 		local new_pos = vector.subtract(pos,vector.divide(real_dir,2))
	// 		player:move_to(new_pos)
	// 		player:set_look_vertical(0)
	// 		player:set_look_horizontal(yaw_translation[dir])
	// 		core.show_formspec(name, "bed", bed_gui)
	// 		player_is_sleeping(player,true)
	// 		set_player_animation(player,"lay",0,false)
	// 		player:set_eye_offset({x=0,y=-12,z=-7},{x=0,y=0,z=0})
	// 		pool[name] = {pos=new_pos,sleeping=false}
	// 		csm_send_player_to_sleep(player)
	// 		sleep_loop = true
	// 	else
	// 		core.chat_send_player(name, "You can only sleep at night")
	// 	end
	// end
	// core.register_on_player_receive_fields(function(player, formname, fields)
	// 	if formname and formname == "bed" then
	// 		wake_up(player)
	// 	end
	// end)
	// core.register_on_respawnplayer(function(player)
	// 	wake_up(player)
	// end)
	// //these are beds
	// core.register_node("bed:bed", {
	//     description = "Bed",
	//     inventory_image = "bed.png",
	//     wield_image = "bed.png",
	//     paramtype2 = "facedir",
	//     tiles = {"bed_top.png^[transform1","wood.png","bed_side.png","bed_side.png^[transform4","bed_front.png","nothing.png"},
	//     groups = {wood = 1, hard = 1, axe = 1, hand = 3, instant=1},
	//     sounds = main.woodSound({placing=""}),
	//     drawtype = "nodebox",
	// 	node_placement_prediction = "",
	// 	on_place = function(itemstack, placer, pointed_thing)
	// 		if not pointed_thing.type == "node" then
	// 			return
	// 		end
	// 		local sneak = placer:get_player_control().sneak
	// 		local noddef = core.registered_nodes[core.get_node(pointed_thing.under).name]
	// 		if not sneak and noddef.on_rightclick then
	// 			core.item_place(itemstack, placer, pointed_thing)
	// 			return
	// 		end
	// 		local _,pos = core.item_place_node(ItemStack("bed:bed_front"), placer, pointed_thing)
	// 		if pos then
	// 			local param2 = core.get_node(pos).param2
	// 			local pos2 = vector.add(pos, vector.multiply(core.facedir_to_dir(param2),-1))
	// 			local buildable = core.registered_nodes[core.get_node(pos2).name].buildable_to
	// 			if not buildable then
	// 				core.remove_node(pos)
	// 				return(itemstack)
	// 			else
	// 				core.add_node(pos2,{name="bed:bed_back", param2=param2})
	// 				itemstack:take_item()
	// 				core.sound_play("wood", {
	// 					  pos = pos,
	// 				})
	// 				return(itemstack)
	// 			end
	// 		end
	// 		return(itemstack)
	// 	end,
	// })
	// core.register_node("bed:bed_front", {
	//     description = "Bed",
	//     paramtype = "light",
	//     paramtype2 = "facedir",
	//     tiles = {"bed_top.png^[transform1","wood.png","bed_side.png","bed_side.png^[transform4","bed_front.png","nothing.png"},
	//     groups = {wood = 1, hard = 1, axe = 1, hand = 3, instant=1,bouncy=50},
	//     sounds = main.woodSound({placing=""}),
	//     drawtype = "nodebox",
	//     node_box = {
	// 		type = "fixed",
	// 		fixed = {
	// 				{-0.5, -5/16, -0.5, 0.5, 0.06, 0.5},
	// 				{-0.5, -0.5, 0.5, -5/16, -5/16, 5/16},
	// 				{0.5, -0.5, 0.5, 5/16, -5/16, 5/16},
	// 			},
	// 		},
	// 	node_placement_prediction = "",
	// 	drop = "bed:bed",
	// 	on_dig = function(pos, node, digger)
	// 		local param2 = core.get_node(pos).param2
	// 		local facedir = core.facedir_to_dir(param2)
	// 		facedir = vector.multiply(facedir,-1)
	// 		local obj = core.add_item(pos, "bed:bed")
	// 		core.remove_node(pos)
	// 		core.remove_node(vector.add(pos,facedir))
	// 		//remove_spawnpoint(pos,digger)
	// 		//remove_spawnpoint(vector.add(pos,facedir),digger)
	// 		core.punch_node(vector.new(pos.x,pos.y+1,pos.z))
	// 	end,
	// 	on_rightclick = function(pos, node, clicker, itemstack, pointed_thing)
	// 		if pos.y <= -10033 then
	// 			tnt(pos,10)
	// 			return
	// 		end
	// 		local param2 = core.get_node(pos).param2
	// 		do_sleep(clicker,pos,param2)
	// 	end,
	// })
	// core.register_node("bed:bed_back", {
	//     description = "Bed",
	//     paramtype = "light",
	//     paramtype2 = "facedir",
	//     tiles = {"bed_top_end.png^[transform1","wood.png","bed_side_end.png","bed_side_end.png^[transform4","nothing.png","bed_end.png"},
	//     groups = {wood = 1, hard = 1, axe = 1, hand = 3, instant=1,bouncy=50},
	//     sounds = main.woodSound(),
	//     drawtype = "nodebox",
	//     node_placement_prediction = "",
	//     node_box = {
	// 		type = "fixed",
	// 		fixed = {
	// 				{-0.5, -5/16, -0.5, 0.5, 0.06, 0.5},
	// 				{-0.5, -0.5, -0.5, -5/16, -5/16, -5/16},
	// 				{0.5, -0.5, -0.5, 5/16, -5/16, -5/16},
	// 			},
	// 		},
	// 	drop = "",
	// 	on_dig = function(pos, node, digger)
	// 		local param2 = core.get_node(pos).param2
	// 		local facedir = core.facedir_to_dir(param2)
	// 		local obj = core.add_item(pos, "bed:bed")
	// 		core.remove_node(pos)
	// 		core.remove_node(vector.add(pos,facedir))
	// 		//remove_spawnpoint(pos,digger)
	// 		//remove_spawnpoint(vector.add(pos,facedir),digger)
	// 		core.punch_node(vector.new(pos.x,pos.y+1,pos.z))
	// 	end,
	// 	on_rightclick = function(pos, node, clicker, itemstack, pointed_thing)
	// 		if pos.y <= -10033 then
	// 			tnt(pos,10)
	// 			return
	// 		end
	// 		local param2 = core.get_node(pos).param2
	// 		local dir = core.facedir_to_dir(param2)
	// 		do_sleep(clicker,vector.add(pos,dir),param2)
	// 	end,
	// })
	// core.register_craft({
	// 	output = "bed:bed",
	// 	recipe = {
	// 		{"main:dropped_leaves", "main:dropped_leaves", "main:dropped_leaves"},
	// 		{"main:wood"          , "main:wood"          , "main:wood"          },
	// 	},
	// })
}
