local minetest,vector = minetest,vector

local r_max = redstone.max_state

local max_timer = 7
for level = 0,max_timer do




--[[
 ██████╗ ███╗   ██╗
██╔═══██╗████╗  ██║
██║   ██║██╔██╗ ██║
██║   ██║██║╚██╗██║
╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═╝  ╚═══╝
]]--

minetest.register_node("redstone:repeater_on_"..level, {
	description = "Redstone Repeater",
	tiles = {"repeater_on.png"},
	groups = {stone = 1, hard = 1, pickaxe = 1, hand = 4,attached_node = 1,redstone_activation_directional=1,repeater_on=1,repeater=1,torch_directional=1,redstone_power=r_max,repeater_level=level},
	sounds = main.stoneSound(),
	paramtype = "light",
	paramtype2 = "facedir",
	sunlight_propagates = true,
	walkable = false,
	drawtype= "nodebox",
	drop="redstone:repeater_off_0",
	node_box = {
		type = "fixed",
		fixed = {
				--left  front  bottom right back top
				{-0.5, -0.5,  -0.5, 0.5,  -0.3, 0.5}, --base
				{-0.1, -0.5,  0.2, 0.1,  0.1, 0.4}, --output post
				{-0.1, -0.5,  -0.05-(level*0.05), 0.1,  0.1, 0.15-(level*0.05)}, --input post
			},
		},

	on_rightclick = function(pos, node, clicker, itemstack, pointed_thing)
		local newlevel = level + 1
		if newlevel > max_timer then
			newlevel = 0
		end
		local param2 = minetest.get_node(pos).param2
		local dir = minetest.facedir_to_dir(param2)

		minetest.swap_node(pos,{name="redstone:repeater_on_"..newlevel,param2=param2})
		minetest.sound_play("lever", {pos=pos})
		redstone.inject(pos,{
			name = "redstone:repeater_on_"..newlevel,
			torch  = r_max,
			torch_directional = true,
			directional_activator = true,
			input  = vector.subtract(pos,dir),
			output = vector.add(pos,dir),
			dir = dir
		})
	end,
	
	on_timer = function(pos, elapsed)
		local param2 = minetest.get_node(pos).param2
		minetest.swap_node(pos, {name="redstone:repeater_off_"..level,param2=param2})
		local dir = minetest.facedir_to_dir(param2)
		redstone.inject(pos,{
			name = "redstone:repeater_off_"..level,
			directional_activator = true,
			input  = vector.subtract(pos,dir),
			output = vector.add(pos,dir),
			dir = dir
		})
		--redstone.update(pos)
		redstone.update(vector.add(pos,dir))
	end,

	after_destruct = function(pos, oldnode)
		local param2 = oldnode.param2
		local dir = minetest.facedir_to_dir(param2)
		redstone.inject(pos,nil)
		--redstone.update(pos)
		redstone.update(vector.add(pos,dir))
	end,

	after_place_node = function(pos)
		local dir = minetest.facedir_to_dir(minetest.get_node(pos).param2)
		redstone.inject(pos,{
			name = "redstone:repeater_on_"..level,
			torch  = r_max,
			torch_directional = true,
			directional_activator = true,
			input  = vector.subtract(pos,dir),
			output = vector.add(pos,dir),
			dir = dir
		})
		redstone.update(pos)
		redstone.update(vector.add(pos,dir))
	end
})

redstone.register_activator({
	name = "redstone:repeater_on_"..level,
	deactivate = function(pos)
		local timer = minetest.get_node_timer(pos)
		if not timer:is_started() then
			timer:start(level/max_timer)
		end
	end
})


minetest.register_lbm({
	name = "redstone:startup_activator_on_"..level,
	nodenames = {"redstone:repeater_on_"..level},
	run_at_every_load = true,
	action = function(pos)
		local dir = minetest.facedir_to_dir(minetest.get_node(pos).param2)
		redstone.inject(pos,{
			name = "redstone:repeater_on_"..level,
			torch  = r_max,
			torch_directional = true,
			directional_activator = true,
			input  = vector.subtract(pos,dir),
			output = vector.add(pos,dir),
			dir = dir
		})
		--redstone.update(pos)
		redstone.update(vector.add(pos,dir))
	end,
})










--[[
 ██████╗ ███████╗███████╗
██╔═══██╗██╔════╝██╔════╝
██║   ██║█████╗  █████╗  
██║   ██║██╔══╝  ██╔══╝  
╚██████╔╝██║     ██║     
 ╚═════╝ ╚═╝     ╚═╝     
]]--



minetest.register_node("redstone:repeater_off_"..level, {
    description = "Redstone Repeater",
    tiles = {"repeater_off.png"},
    groups = {stone = 1, hard = 1, pickaxe = 1, hand = 4,attached_node = 1,repeater_off=1,repeater=1,redstone_activation_directional=1,repeater_level=level},
    sounds = main.stoneSound(),
    paramtype = "light",
	paramtype2 = "facedir",
	sunlight_propagates = true,
	walkable = false,
	drawtype= "nodebox",
	drop="redstone:repeater_off_0",
	node_box = {
		type = "fixed",
		fixed = {
				--left  front  bottom right back top
				{-0.5, -0.5,  -0.5, 0.5,  -0.3, 0.5}, --base
				{-0.1, -0.5,  0.2, 0.1,  0.1, 0.4}, --output post
				{-0.1, -0.5,  -0.05-(level*0.05), 0.1,  0.1, 0.15-(level*0.05)}, --input post
			},
		},	

	on_timer = function(pos, elapsed)
		local param2 = minetest.get_node(pos).param2
		minetest.swap_node(pos, {name="redstone:repeater_on_"..level,param2=param2})

		local dir = minetest.facedir_to_dir(param2)
		redstone.inject(pos,{
			name = "redstone:repeater_on_"..level,
			torch  = r_max,
			torch_directional = true,
			directional_activator = true,
			input  = vector.subtract(pos,dir),
			output = vector.add(pos,dir),
			dir = dir
		})
		--redstone.update(pos)
		redstone.update(vector.add(pos,dir))
	end,

	on_rightclick = function(pos, node, clicker, itemstack, pointed_thing)
		local newlevel = level + 1
		if newlevel > max_timer then
			newlevel = 0
		end
		local param2 = minetest.get_node(pos).param2
		local dir = minetest.facedir_to_dir(param2)
		minetest.swap_node(pos,{name="redstone:repeater_off_"..newlevel,param2=param2})
		redstone.inject(pos,{
			name = "redstone:repeater_off_"..newlevel,
			directional_activator = true,
			input  = vector.subtract(pos,dir),
			output = vector.add(pos,dir),
			dir = dir
		})
		minetest.sound_play("lever", {pos=pos})
	end,

	after_destruct = function(pos, oldnode)
		local param2 = oldnode.param2
		local dir = minetest.facedir_to_dir(param2)
		redstone.inject(pos,nil)
		--redstone.update(pos)
		redstone.update(vector.add(pos,dir))
	end,

	after_place_node = function(pos)
		local dir = minetest.facedir_to_dir(minetest.get_node(pos).param2)
		redstone.inject(pos,{
			name = "redstone:repeater_off_"..level,
			directional_activator = true,
			input  = vector.subtract(pos,dir),
			output = vector.add(pos,dir),
			dir = dir
		})
		redstone.update(pos)
		redstone.update(vector.add(pos,dir))
	end
})


redstone.register_activator({
	name = "redstone:repeater_off_"..level,
	activate = function(pos)
		local timer = minetest.get_node_timer(pos)
		if not timer:is_started() then
			timer:start(level/max_timer)
		end
	end
})


minetest.register_lbm({
	name = "redstone:startup_activator_off_"..level,
	nodenames = {"redstone:repeater_off_"..level},
	run_at_every_load = true,
	action = function(pos)
		local dir = minetest.facedir_to_dir(minetest.get_node(pos).param2)
		redstone.inject(pos,{
			name = "redstone:repeater_off_"..level,
			directional_activator = true,
			input  = vector.subtract(pos,dir),
			dir = dir
		})
		--redstone.update(pos)
		redstone.update(vector.add(pos,dir))
	end,
})

end
