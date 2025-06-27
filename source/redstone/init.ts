--if you attempt to read this, god bless you

local 
minetest,vector,math,table,pairs,next
=
minetest,vector,math,table,pairs,next

-- minetest class
local get_node        = minetest.get_node
local get_item_group  = minetest.get_item_group
local get_meta        = minetest.get_meta
local facedir_to_dir  = minetest.facedir_to_dir
local content_id      = minetest.get_name_from_content_id
local get_content_id  = minetest.get_content_id
local get_voxel_manip = minetest.get_voxel_manip
local after           = minetest.after

local swap_node       = minetest.swap_node
local registered_nodes
minetest.register_on_mods_loaded(function()
	registered_nodes  = minetest.registered_nodes
end)

-- math class
local abs   = math.abs
local floor = math.floor
local ceil   = math.ceil

-- vector library
local new_vec         = vector.new
local add_vec         = vector.add
local sub_vec         = vector.subtract
local vector_distance = vector.distance
local vec_equals      = vector.equals

local activator_table = {} -- this holds the translation data of activator tables (activator functions)
local capacitor_table = {}
local player_detection_table = {}
--local instructions = 0

-- redstone class
redstone = {}

redstone.max_state = 9 -- the limit to power transmission

redstone.player_detector_add = function(pos)
	player_detection_table[minetest.serialize(pos)] = pos
end

redstone.player_detector_remove = function(pos)
	player_detection_table[minetest.serialize(pos)] = nil
end


-- enables mods to create data functions
function redstone.register_activator(data)
	activator_table[data.name] = {
		activate   = data.activate,
		deactivate = data.deactivate
	}
end

-- enables mods to create data functions
function redstone.register_capacitor(data)
	capacitor_table[data.name] = {
		off = data.off,
		on  = data.on
	}
end

local path = minetest.get_modpath("redstone")
dofile(path.."/functions.lua")
dofile(path.."/torch.lua")
dofile(path.."/lever.lua")
dofile(path.."/button.lua")
dofile(path.."/repeater.lua")
dofile(path.."/light.lua")
dofile(path.."/piston.lua")
--dofile(path.."/comparator.lua")
dofile(path.."/craft.lua")
dofile(path.."/ore.lua")
dofile(path.."/inverter.lua")
dofile(path.."/player_detector.lua")
dofile(path.."/space_maker.lua")
--dofile(path.."/pressure_plate.lua")
dofile(path.."/capacitors.lua")
dofile(path.."/breaker.lua")
dofile(path.."/detector.lua")
--dofile(path.."/dispenser.lua")


--this is written out manually so that
--math.abs is not needed
local order = {
	{x= 0,y= 0,z= 0},
	{x= 1,y= 0,z= 0},
	{x=-1,y= 0,z= 0},
	{x= 0,y= 0,z= 1},
	{x= 0,y= 0,z=-1},
	{x= 0,y= 1,z= 0},
	{x= 0,y=-1,z= 0},
	{x= 1,y= 1,z= 0}, 
	{x=-1,y= 1,z= 0},
	{x= 0,y= 1,z= 1},
	{x= 0,y= 1,z=-1},
	{x= 1,y=-1,z= 0},
	{x=-1,y=-1,z= 0},
	{x= 0,y=-1,z= 1},
	{x= 0,y=-1,z=-1},
	}

--thanks to RhodiumToad for helping me figure out a good method to do this

local pool = {} -- this holds all redstone data (literal 3d virtual memory map)


local function data_injection(pos,data)
	--instructions = instructions + 1
	-- add data into 3d memory
	if data then
		if not pool[pos.x] then pool[pos.x] = {} end
		if not pool[pos.x][pos.y] then pool[pos.x][pos.y] = {} end
		pool[pos.x][pos.y][pos.z] = data
		--instructions = instructions + 1
		--print("building 3d memory")
	--delete data from 3d memory
	else
		if pool and pool[pos.x] and pool[pos.x][pos.y] then
			pool[pos.x][pos.y][pos.z] = data
			--instructions = instructions + 1
			--print("deleting 3d memory")
			if pool[pos.x][pos.y] and not next(pool[pos.x][pos.y]) then
				pool[pos.x][pos.y] = nil
				--instructions = instructions + 1
				-- only run this if y axis is empty
				if pool[pos.x] and not next(pool[pos.x]) then
					pool[pos.x] = nil
					--instructions = instructions + 1
				end
			end
		end
	end
end

--[[
                                         _ __
        ___                             | '  \
   ___  \ /  ___         ,'\_           | .-. \        /|
   \ /  | |,'__ \  ,'\_  |   \          | | | |      ,' |_   /|
 _ | |  | |\/  \ \ |   \ | |\_|    _    | |_| |   _ '-. .-',' |_   _
// | |  | |____| | | |\_|| |__    //    |     | ,'_`. | | '-. .-',' `. ,'\_
\\_| |_,' .-, _  | | |   | |\ \  //    .| |\_/ | / \ || |   | | / |\  \|   \
 `-. .-'| |/ / | | | |   | | \ \//     |  |    | | | || |   | | | |_\ || |\_|
   | |  | || \_| | | |   /_\  \ /      | |`    | | | || |   | | | .---'| |
   | |  | |\___,_\ /_\ _      //       | |     | \_/ || |   | | | |  /\| |
   /_\  | |           //_____//       .||`  _   `._,' | |   | | \ `-' /| |
        /_\           `------'        \ |  /-\ND _     `.\  | |  `._,' /_\
                                       \|        |HE         `.\
                                      __        _           _   __  _
                                     /   |__|  /_\  |\  /| |_) |_  |_)
                                     \__ |  | /   \ | \/ | |_) |__ | \
                                             _  _  
											(_)|-   ___     __     __ __ 
													 |  /\ |__)|  |_ (_  
													 | /--\|__)|__|____) 
]]--


local table_3d
local temp_pool
local r_max = redstone.max_state
local function create_boundary_box(pos)
	--instructions = instructions + 1
	table_3d = {}
	for x = pos.x-r_max,pos.x+r_max do
		--instructions = instructions + 1
		if pool[x] then
			for y = pos.y-r_max,pos.y+r_max do
				--instructions = instructions + 1
				if pool[x][y] then
					for z = pos.z-r_max,pos.z+r_max do
						--instructions = instructions + 1
						temp_pool = pool[x][y][z]
						--instructions = instructions + 1
						if temp_pool then
							if not table_3d[x] then table_3d[x] = {} end
							if not table_3d[x][y] then table_3d[x][y] = {} end

							if (x == pos.x-r_max or x == pos.x+r_max or 
							y == pos.y-r_max or y == pos.y+r_max or 
							z == pos.z-r_max or z == pos.z+r_max) and 
							temp_pool.dust and temp_pool.dust > 1 then
								table_3d[x][y][z] = {torch=temp_pool.dust}
							else
								if temp_pool.dust then
									table_3d[x][y][z] = {dust=0,origin=temp_pool.dust}
								else
									table_3d[x][y][z] = temp_pool
								end
							end
						end
					end
				end
			end
		end
	end
	return(table_3d)
end

local i
local index
local function capacitor_pathfind(source,mem_map)
	for _,order in pairs(order) do
		
		i = add_vec(source,order)
		if not mem_map[i.x] then mem_map[i.x] = {} end
		if not mem_map[i.x][i.y] then mem_map[i.x][i.y] = {} end

		if not mem_map[i.x][i.y][i.z] then

			if i and pool and pool[i.x] and pool[i.x][i.y] and pool[i.x][i.y][i.z] then
				index = pool[i.x][i.y][i.z]
				if index.capacitor then
					mem_map[i.x][i.y][i.z] = {name = index.name, capacitor = 0, source = index.source}
					if index.source then
						mem_map.found = true
					end
					capacitor_pathfind(i,mem_map)
				end
			end
		end
	end
	return mem_map
end

local table_3d
local found
local temp_pool
local function capacitor_sniff(pos)
	table_3d = {}
	table_3d = capacitor_pathfind(pos,table_3d)
	found = table_3d.found
	table_3d.found = nil
	if found then
		for x,datax in pairs(table_3d) do
			for y,datay in pairs(datax) do
				for z,data in pairs(datay) do
					temp_pool = pool[x][y][z]
					if temp_pool then
						temp_pool.capacitor = 1
						if capacitor_table[temp_pool.name] then
							swap_node(new_vec(x,y,z),{name=capacitor_table[temp_pool.name].on})
							redstone.update(new_vec(x,y,z))
						end
					end
				end
			end
		end
	else
		for x,datax in pairs(table_3d) do
			for y,datay in pairs(datax) do
				for z,data in pairs(datay) do
					temp_pool = pool[x][y][z]
					if temp_pool then
						temp_pool.capacitor = 0
						if capacitor_table[temp_pool.name] then
							swap_node(new_vec(x,y,z),{name=capacitor_table[temp_pool.name].off})
							redstone.update(new_vec(x,y,z))
						end
					end
				end
			end
		end
	end
end



-- activators
local n_pos
local temp_pool
local temp_pool2
local non_directional_activator = function(pos)
	if pool[pos.x] and pool[pos.x][pos.y] and pool[pos.x][pos.y][pos.z] then
		temp_pool = pool[pos.x][pos.y][pos.z]
		if temp_pool then
			for _,order in pairs(order) do
				n_pos = add_vec(pos,order)
				if pool[n_pos.x] and pool[n_pos.x][n_pos.y] and pool[n_pos.x][n_pos.y][n_pos.z] then
					temp_pool2 = pool[n_pos.x][n_pos.y][n_pos.z]
					if temp_pool2 then
						if (not temp_pool2.directional_activator and temp_pool2.torch) or 
						(temp_pool2.dust and temp_pool2.dust > 0) or 
						(temp_pool2.torch_directional and vector.equals(temp_pool2.output, pos)) then
							if activator_table[temp_pool.name] and activator_table[temp_pool.name].activate then
								activator_table[temp_pool.name].activate(pos)
							end
							return
						end
					end
				end
			end	
			if activator_table[temp_pool.name] and activator_table[temp_pool.name].deactivate then
				activator_table[temp_pool.name].deactivate(pos)
			end
		end
	end
end

-- directional activators
local n_pos
local temp_pool
local temp_pool2
local input
local ignore
local directional_activator = function(pos)
	
	ignore = false
	input = nil
	temp_pool = nil
	temp_pool2 = nil

	if not (pool[pos.x] and pool[pos.x][pos.y] and pool[pos.x][pos.y][pos.z]) then return end
	
	temp_pool = pool[pos.x][pos.y][pos.z]
	
	if not temp_pool then ignore = true end

	if not ignore then
		input = temp_pool.input
	end

	if not input then ignore = true end

	if not ignore then
		input = temp_pool.input
	end

	if not ignore and pool and pool[input.x] and pool[input.x][input.y] and pool[input.x][input.y][input.z] then
		temp_pool2 = pool[input.x][input.y][input.z]
	else
		ignore = true
	end

	if not temp_pool2 then ignore = true end

	if not ignore and ((temp_pool2.dust and temp_pool2.dust > 0) or (temp_pool2.torch and temp_pool2.directional_activator and temp_pool2.dir == temp_pool.dir) or 
	(not temp_pool2.directional_activator and temp_pool2.torch) or (temp_pool2.capacitor and temp_pool2.capacitor > 0))  then
		if  activator_table[temp_pool.name] and activator_table[temp_pool.name].activate then
			activator_table[temp_pool.name].activate(pos)
			return
		end
		return
	end

	if activator_table[temp_pool.name] and activator_table[temp_pool.name].deactivate then
		activator_table[temp_pool.name].deactivate(pos)
	end
end

--make redstone wire pass on current one level lower than it is
local i
local index
local passed_on_level
local x,y,z
local function redstone_distribute(pos,power,mem_map,output)

	power = power - 1

	--directional torches
	if output then
		x=output.x
		y=output.y
		z=output.z
		if mem_map.dust[x] and mem_map.dust[x][y] and mem_map.dust[x][y][z] then
			if mem_map.dust[x][y][z].dust < power then
				mem_map.dust[x][y][z].dust = power
				redstone_distribute(new_vec(x,y,z),power,mem_map,nil)
			end
		end
	else
		--redstone and torch
		for _,order in pairs(order) do
			--instructions = instructions + 1
			i = add_vec(pos,order)
			x=i.x
			y=i.y
			z=i.z
			if mem_map.dust[x] and mem_map.dust[x][y] and mem_map.dust[x][y][z] then
				if mem_map.dust[x][y][z].dust < power then
					mem_map.dust[x][y][z].dust = power
					redstone_distribute(new_vec(x,y,z),power,mem_map,nil)
				end
			end
		end
	end
	return(mem_map)
end


--[[
                     , 
                ,.  | \ 
               |: \ ; :\ 
               :' ;\| ::\ 
                \ : | `::\ 
                _)  |   `:`. 
              ,' , `.    ;: ; 
            ,' ;:  ;"'  ,:: |_ 
           /,   ` .    ;::: |:`-.__ 
        _,' _o\  ,::.`:' ;  ;   . ' 
    _,-'           `:.          ;""\, 
 ,-'                     ,:         `-;, 
 \,                       ;:           ;--._ 
  `.______,-,----._     ,' ;:        ,/ ,  ,` 
         / /,-';'  \     ; `:      ,'/,::.::: 
       ,',;-'-'_,--;    ;   :.   ,',',;:::::: 
      ( /___,-'     `.     ;::,,'o/  ,::::::: 
       `'             )    ;:,'o /  ;"-   -:: 
                      \__ _,'o ,'         ,:: 
                         ) `--'       ,..:::: 
                         ; `.        ,::::::: 
                          ;  ``::.    ::::::: 
]]-- sic em boy!
local i
local index
local function dust_sniff(pos,mem_map,boundary,single,origin,ignore)
	if not single then
		--print("all position index--")
		for _,order in pairs(order) do
			--instructions = instructions + 1
			i = add_vec(pos,order)

			if not mem_map[i.x] then mem_map[i.x] = {} end
			if not mem_map[i.x][i.y] then mem_map[i.x][i.y] = {} end

			if not mem_map[i.x][i.y][i.z] then
				if i and boundary and boundary[i.x] and boundary[i.x][i.y] and boundary[i.x][i.y][i.z] then
					index = boundary[i.x][i.y][i.z]

					if index.dust then

						mem_map[i.x][i.y][i.z] = true

						if not mem_map.dust[i.x] then mem_map.dust[i.x] = {} end
						if not mem_map.dust[i.x][i.y] then mem_map.dust[i.x][i.y] = {} end

						mem_map.dust[i.x][i.y][i.z] = index

						dust_sniff(i,mem_map,boundary)
					
					elseif index.torch and index.torch > 1 then
						if index.torch_directional and vec_equals(pos,index.output) then
							
							mem_map[i.x][i.y][i.z] = true

							if not mem_map.torch[i.x] then mem_map.torch[i.x] = {} end
							if not mem_map.torch[i.x][i.y] then mem_map.torch[i.x][i.y] = {} end

							mem_map.torch[i.x][i.y][i.z] = index

							
						elseif not index.torch_directional then

							mem_map[i.x][i.y][i.z] = true

							if not mem_map.torch[i.x] then mem_map.torch[i.x] = {} end
							if not mem_map.torch[i.x][i.y] then mem_map.torch[i.x][i.y] = {} end

							mem_map.torch[i.x][i.y][i.z] = index
						end
					end

					if index.activator then
						mem_map[i.x][i.y][i.z] = true

						if not mem_map.activator[i.x] then mem_map.activator[i.x] = {} end
						if not mem_map.activator[i.x][i.y] then mem_map.activator[i.x][i.y] = {} end

						mem_map.activator[i.x][i.y][i.z] = index
					elseif index.directional_activator and vec_equals(pos,index.input) then

						mem_map[i.x][i.y][i.z] = true

						if not mem_map.activator[i.x] then mem_map.activator[i.x] = {} end
						if not mem_map.activator[i.x][i.y] then mem_map.activator[i.x][i.y] = {} end

						mem_map.activator[i.x][i.y][i.z] = index
					end
				end
			end
		end
	else
		--print("single position index")
		
		i = pos


		if not mem_map[i.x] then mem_map[i.x] = {} end
		if not mem_map[i.x][i.y] then mem_map[i.x][i.y] = {} end

		if not mem_map[i.x][i.y][i.z] then
			if i and boundary and boundary[i.x] and boundary[i.x][i.y] and boundary[i.x][i.y][i.z] then
				index = boundary[i.x][i.y][i.z]
				if index.dust then

					mem_map[i.x][i.y][i.z] = true

					if not mem_map.dust[i.x] then mem_map.dust[i.x] = {} end
					if not mem_map.dust[i.x][i.y] then mem_map.dust[i.x][i.y] = {} end

					mem_map.dust[i.x][i.y][i.z] = index

					dust_sniff(i,mem_map,boundary)
				
				elseif index.torch and index.torch > 1 then
					if index.torch_directional and (vec_equals(origin,index.output) or ignore) then
						
						mem_map[i.x][i.y][i.z] = true

						if not mem_map.torch[i.x] then mem_map.torch[i.x] = {} end
						if not mem_map.torch[i.x][i.y] then mem_map.torch[i.x][i.y] = {} end

						mem_map.torch[i.x][i.y][i.z] = index

						
					elseif not index.torch_directional then

						mem_map[i.x][i.y][i.z] = true

						if not mem_map.torch[i.x] then mem_map.torch[i.x] = {} end
						if not mem_map.torch[i.x][i.y] then mem_map.torch[i.x][i.y] = {} end

						mem_map.torch[i.x][i.y][i.z] = index
					end
				end

				if index.activator then
					mem_map[i.x][i.y][i.z] = true

					if not mem_map.activator[i.x] then mem_map.activator[i.x] = {} end
					if not mem_map.activator[i.x][i.y] then mem_map.activator[i.x][i.y] = {} end

					mem_map.activator[i.x][i.y][i.z] = index
				elseif index.directional_activator and (vec_equals(origin,index.input) or ignore) then

					mem_map[i.x][i.y][i.z] = true

					if not mem_map.activator[i.x] then mem_map.activator[i.x] = {} end
					if not mem_map.activator[i.x][i.y] then mem_map.activator[i.x][i.y] = {} end

					mem_map.activator[i.x][i.y][i.z] = index
				end
			end
		end
	end
	return mem_map
end

--make all power sources push power out
local pos
local node
local power
local boundary
local dust_detected
local dust_map
local pos3
local temp_pool3
local directional
local function calculate(pos,is_capacitor)
	if not is_capacitor then
		boundary = create_boundary_box(pos)
		dust_map = {}

		dust_map.dust = {}
		dust_map.torch = {}
		dust_map.activator = {}

		dust_detected = false

		directional = false

		if boundary[pos.x] and boundary[pos.x][pos.y] and boundary[pos.x][pos.y][pos.z] then
			if boundary[pos.x][pos.y][pos.z].torch_directional or boundary[pos.x][pos.y][pos.z].directional_activator then
				directional = true
			end
		end

		-- sniff all possible dust within boundaries
		if not directional then
			dust_sniff(pos,dust_map,boundary)
			for _,pos2 in pairs(order) do
				pos3 = add_vec(pos,pos2)
				if boundary[pos3.x] and boundary[pos3.x][pos3.y] and boundary[pos3.x][pos3.y][pos3.z] and
					not (dust_map[pos3.x] and dust_map[pos3.x][pos3.y] and dust_map[pos3.x][pos3.y][pos3.z]) then
					temp_pool3 = boundary[pos3.x][pos3.y][pos3.z]
					if temp_pool3.dust then
						dust_sniff(pos3,dust_map,boundary)
					end
				end
			end
		else
			dust_sniff(pos,dust_map,boundary,true,pos,true)

			local input = boundary[pos.x][pos.y][pos.z].input
			local output = boundary[pos.x][pos.y][pos.z].output

			if input and boundary[input.x] and boundary[input.x][input.y] and boundary[input.x][input.y][input.z] then
				dust_sniff(input,dust_map,boundary,true,pos)
			end
			if output and boundary[output.x] and boundary[output.x][output.y] and boundary[output.x][output.y][output.z] then
				dust_sniff(output,dust_map,boundary,true,pos)
			end
		end
		--do torches
		for x,datax in pairs(dust_map.torch) do
			for y,datay in pairs(datax) do
				for z,data in pairs(datay) do
					if data.torch then
						if data.torch_directional then
							redstone_distribute(new_vec(x,y,z),data.torch,dust_map,data.output)
						else
							redstone_distribute(new_vec(x,y,z),data.torch,dust_map)
						end
					end
				end
			end
		end

		--set dust, set pool memory
		for x,datax in pairs(dust_map.dust) do
			for y,datay in pairs(datax) do
				for z,data in pairs(datay) do
					if data.dust and data.dust ~= data.origin then
						swap_node(new_vec(x,y,z),{name="redstone:dust_"..data.dust})
						data_injection(new_vec(x,y,z),data)
					end
				end
			end
		end
		
		--activators
		--this must be run at the end
		for x,datax in pairs(dust_map.activator) do
			for y,datay in pairs(datax) do
				for z,data in pairs(datay) do
					if data.directional_activator then
						directional_activator(new_vec(x,y,z))
					elseif data.activator then
						non_directional_activator(new_vec(x,y,z))
					end
				end
			end
		end
	else
		capacitor_sniff(pos)
	end
end


function redstone.inject(pos,data)
	data_injection(pos,data)
end



local level
local pos2
local power
local max
local function player_detector_calculation()
	for _,pos in pairs(player_detection_table) do
		level = pool[pos.x][pos.y][pos.z].torch
		max = 0
		for _,player in ipairs(minetest.get_connected_players()) do
			pos2 = player:get_pos()
			power = floor(11-vector_distance(pos2,pos))
			if power > r_max then
				power = r_max
			elseif power < 0 then
				power = 0
			end

			if power > max then
				max = power
			end
		end

		if max ~= level then
			swap_node(pos,{name="redstone:player_detector_"..max})
			redstone.inject(pos,{
				name = "redstone:player_detector_"..max,
				torch = max,
			})
			redstone.update(pos)
		end
	end
end


local recursion_check = {}
local bad_node
local queue = {}
function redstone.update(pos,is_capacitor)
	local count = table.getn(queue)
	local s_pos = minetest.serialize(pos)
	if not recursion_check[s_pos] then
		recursion_check[s_pos] = 0
	end
	recursion_check[s_pos] = recursion_check[s_pos] + 1
	if recursion_check[s_pos] > 25 then
		--print(recursion_check[s_pos])
		minetest.after(0,function()
			bad_node = minetest.get_node(pos).name
			bad_node = minetest.get_node_drops(bad_node, "main:rubypick")
			for _,nodey in pairs(bad_node) do
				minetest.throw_item(pos,nodey)
			end
			minetest.remove_node(pos)
			data_injection(pos,nil)
			redstone.update(pos)
		end)
		return
	end
	calculate(pos,is_capacitor)
end
local dtime_goal = 0.02
local sleep = 0
minetest.register_globalstep(function(dtime)
	player_detector_calculation()
	recursion_check = {}
	--[[
	if dtime > dtime_goal then
		sleep = dtime - dtime_goal
	end

	if sleep == 0 then

		for index,element in pairs(queue) do
			calculate(element.pos,element.is_capacitor)
		end

		queue = {}
		
	else
		sleep = sleep - dtime
		if sleep <= 0 then
			sleep = 0
		end
	end
	]]--
	--if instructions and instructions > 0 then
	--	print(instructions)
	--end
	--instructions = 0
end)


----------------------------------------------------------------------------



local instruction_order = {
	{x= 1,y= 0,z= 0},
	{x=-1,y= 0,z= 0},
	{x= 0,y= 0,z= 1},
	{x= 0,y= 0,z=-1},
	{x= 0,y= 1,z= 0},
	{x= 0,y=-1,z= 0},
	{x= 1,y= 1,z= 0}, 
	{x=-1,y= 1,z= 0},
	{x= 0,y= 1,z= 1},
	{x= 0,y= 1,z=-1},
	{x= 1,y=-1,z= 0},
	{x=-1,y=-1,z= 0},
	{x= 0,y=-1,z= 1},
	{x= 0,y=-1,z=-1},
	}


-- this is used for dynamic instruction set rebuilds
local function instruction_rebuild(pos,delete)
	if not delete then
		local instruction_set = {}
		for _,pos2 in pairs(instruction_order) do
			local pos3 = vector.add(pos,pos2)
			if pool[pos3.x] and pool[pos3.x][pos3.y] and pool[pos3.x][pos3.y][pos3.z] then
				table.insert(instruction_set,pos2)
			end
		end
	else
		for _,pos2 in pairs(instruction_order) do
		
		end
	end
	
	print(dump(instruction_set))
end



-- this is used for creating fast data for the game to utilize
local function initial_instruction_build(pos)
	local instruction_set = {}
	for _,pos2 in pairs(instruction_order) do
		local pos3 = vector.add(pos,pos2)
		if pool[pos3.x] and pool[pos3.x][pos3.y] and pool[pos3.x][pos3.y][pos3.z] then
			table.insert(instruction_set,pos2)
		end
	end
	pool[pos.x][pos.y][pos.z].instruction_set = instruction_set
end


--[[
       / .'
 .---. \/
(._.' \()
 ^"""^"
]]--
















minetest.register_craftitem("redstone:dust", {
	description = "Redstone Dust",
	inventory_image = "redstone_dust_item.png",
	wield_image = "redstone_dust_item.png",
	wield_scale = {x = 1, y = 1, z = 1 + 1/16},
	liquids_pointable = false,
	on_place = function(itemstack, placer, pointed_thing)
		if not pointed_thing.type == "node" then
			return
		end		
		local sneak = placer:get_player_control().sneak
		local noddef = registered_nodes[get_node(pointed_thing.under).name]
		if not sneak and noddef.on_rightclick then
			minetest.item_place(itemstack, placer, pointed_thing)
			return
		end
		
		local _,worked = minetest.item_place(ItemStack("redstone:dust_0"), placer, pointed_thing)
		if worked then
			itemstack:take_item()
			return(itemstack)
		end
	end,
})

--power levels r_max-1 being the highest
local d_max = r_max-1
for i = 0,d_max do

	local color = floor(255 * (i/d_max))
	
	minetest.register_node("redstone:dust_"..i,{
		description = "Redstone Dust",
		wield_image = "redstone_dust_item.png",
		tiles = {
			"redstone_dust_main.png^[colorize:red:"..color, "redstone_turn.png^[colorize:red:"..color,
			"redstone_t.png^[colorize:red:"..color, "redstone_cross.png^[colorize:red:"..color
		},
		power=i,
		drawtype = "raillike",
		paramtype = "light",
		sunlight_propagates = true,
		is_ground_content = false,
		walkable = false,
		node_placement_prediction = "",
		selection_box = {
			type = "fixed",
			fixed = {-1/2, -1/2, -1/2, 1/2, -1/2+1/16, 1/2},
		},
		sounds = main.stoneSound(),
		groups={dig_immediate=1,attached_node=1,redstone_dust=1,redstone=1,redstone_power=i},
		drop="redstone:dust",
		on_construct = function(pos)
			data_injection(pos,{dust=i})
			--instruction_rebuild(pos)
			calculate(pos)
		end,
		after_destruct = function(pos)			
			data_injection(pos,nil)
			--instruction_rebuild(pos,true)
			calculate(pos)
		end,
		connects_to = {"group:redstone"},
	})

	minetest.register_lbm({
        name = "redstone:"..i,
		nodenames = {"redstone:dust_"..i},
		run_at_every_load = true,
        action = function(pos)
			data_injection(pos,{dust=i})
			--minetest.after(0,function()
				--initial_instruction_build(pos)
			--end)
        end,
    })
end
