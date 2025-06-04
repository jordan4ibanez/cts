namespace farming {
	// Quick definition of hoes.
	const material: string[] = ["wood", "stone", "iron", "gold", "diamond"];
	const construct: string[] = ["wood", "cobble", "iron", "gold", "diamond"];

	function till_soil(pos: Vec3) {
		const nodey: string = core.get_node(pos).name;
		const is_dirt: boolean = nodey == "main:dirt" || nodey == "main:grass";
		// 	if is_dirt then
		// 		core.sound_play("dirt",{pos=pos})
		// 		core.set_node(pos,{name="farming:farmland_dry"})
		// 		return(true)
		// 	end
	}

	// for level,material in pairs(material) do
	// 	local wear = 100*(6-level)
	// 	local groupcaps2
	// 	if material == "wood" then
	// 		groupcaps2={
	// 			dirt =  {times={[1]=0.4,[2]=1.5,[3]=3,[4]=6,[5]=12},    uses=59, maxlevel=1},
	// 			snow =  {times={[1]=0.4,[2]=1.5,[3]=3,[4]=6,[5]=12},    uses=59, maxlevel=1},
	// 			grass = {times={[1]=0.45,[2]=1.5,[3]=3,[4]=6,[5]=12},   uses=59, maxlevel=1},
	// 			sand =  {times={[1]=0.4,[2]=1.5,[3]=3,[4]=6,[5]=12},    uses=59, maxlevel=1},
	// 		}
	// 		damage = 2.5
	// 	elseif material == "stone" then
	// 		groupcaps2={
	// 			dirt =  {times={[1]=0.2,[2]=0.2,[3]=1.5,[4]=3,[5]=6},   uses=131, maxlevel=1},
	// 			snow =  {times={[1]=0.2,[2]=0.2,[3]=1.5,[4]=3,[5]=6},   uses=131, maxlevel=1},
	// 			grass = {times={[1]=0.25,[2]=0.25,[3]=1.5,[4]=3,[5]=6}, uses=131, maxlevel=1},
	// 			sand =  {times={[1]=0.2,[2]=0.2,[3]=1.5,[4]=3,[5]=6},   uses=131, maxlevel=1},
	// 		}
	// 		damage = 3.5
	// 	elseif material == "iron" then
	// 		groupcaps2={
	// 			dirt =  {times={[1]=0.15,[2]=0.15,[3]=0.15,[4]=1.5,[5]=3}, uses=250, maxlevel=1},
	// 			snow =  {times={[1]=0.15,[2]=0.15,[3]=0.15,[4]=1.5,[5]=3}, uses=250, maxlevel=1},
	// 			grass = {times={[1]=0.15,[2]=0.15,[3]=0.15,[4]=1.5,[5]=3}, uses=250, maxlevel=1},
	// 			sand =  {times={[1]=0.15,[2]=0.15,[3]=0.15,[4]=1.5,[5]=3}, uses=250, maxlevel=1},
	// 		}
	// 		damage = 4.5
	// 	elseif material == "gold" then
	// 		groupcaps2={
	// 			dirt =  {times={[1]=0.1,[2]=0.1,[3]=0.1,[4]=0.1,[5]=1.5}, uses=32, maxlevel=1},
	// 			snow =  {times={[1]=0.1,[2]=0.1,[3]=0.1,[4]=0.1,[5]=1.5}, uses=32, maxlevel=1},
	// 			grass = {times={[1]=0.1,[2]=0.1,[3]=0.1,[4]=0.1,[5]=1.5}, uses=32, maxlevel=1},
	// 			sand =  {times={[1]=0.1,[2]=0.1,[3]=0.1,[4]=0.1,[5]=1.5}, uses=32, maxlevel=1},
	// 		}
	// 		damage = 2.5
	// 	elseif material == "diamond" then
	// 		groupcaps2={
	// 			dirt =  {times={[1]= 0.1,[2]=0.1,[3]=0.1,[4]=0.1,[5]=1.5},     uses=1561, maxlevel=1},
	// 			snow =  {times={[1]= 0.1,[2]=0.1,[3]=0.1,[4]=0.1,[5]=1.5},     uses=1561, maxlevel=1},
	// 			grass = {times={[1]= 0.15,[2]=0.15,[3]=0.15,[4]=0.15,[5]=1.5}, uses=1561, maxlevel=1},
	// 			sand =  {times={[1]= 0.1,[2]=0.1,[3]=0.1,[4]=0.1,[5]=1.5},     uses=1561, maxlevel=1},
	// 		}
	// 		damage = 5.5
	// 	end
	// 	core.register_tool("farming:"..material.."hoe", {
	// 		description = material:gsub("^%l", string.upper).." Hoe",
	// 		inventory_image = material.."hoe.png",
	// 		tool_capabilities = {
	// 				full_punch_interval = 0,
	// 				//max_drop_level=0,
	// 				groupcaps=groupcaps2,
	// 				damage_groups = {damage=damage},
	// 			},
	// 		sound = {breaks = {name="tool_break",gain=0.4}}, // change this
	// 		groups = {flammable = 2, tool=1 },
	// 		on_place = function(itemstack, placer, pointed_thing)
	// 			local noddef = core.registered_nodes[core.get_node(pointed_thing.under).name]
	// 			local sneak = placer:get_player_control().sneak
	// 			if not sneak and noddef.on_rightclick then
	// 				core.item_place(itemstack, placer, pointed_thing)
	// 				return
	// 			end
	// 			local tilled = till_soil(pointed_thing.under)
	// 			if tilled == true then
	// 				if core.registered_nodes[core.get_node(vector.new(pointed_thing.under.x,pointed_thing.under.y+1,pointed_thing.under.z)).name].buildable_to then
	// 					core.dig_node(vector.new(pointed_thing.under.x,pointed_thing.under.y+1,pointed_thing.under.z))
	// 				end
	// 				itemstack:add_wear(wear)
	// 			end
	// 			local damage = itemstack:get_wear()
	// 			if damage <= 0 and tilled == true  then
	// 				core.sound_play("tool_break",{object=placer})
	// 			end
	// 			return(itemstack)
	// 		end,
	// 	})
	// 	core.register_craft({
	// 		output = "farming:"..material.."hoe",
	// 		recipe = {
	// 			{"","main:"..construct[level], "main:"..construct[level]},
	// 			{"","main:stick", ""},
	// 			{"", "main:stick", ""}
	// 		}
	// 	})
	// 	core.register_craft({
	// 		output = "farming:"..material.."hoe",
	// 		recipe = {
	// 			{"main:"..construct[level],"main:"..construct[level], ""},
	// 			{"","main:stick", ""},
	// 			{"", "main:stick", ""}
	// 		}
	// 	})
	// end
}
