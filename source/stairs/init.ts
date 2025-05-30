namespace stairs {
//stairs - shift click to place upside down
for (const [name,def] of pairs(core.registered_nodes)) {
    if (typeof name != "string") {
        core.log(LogLevel.warning, "Number in global registered nodes table")
        continue;
    }

	if (def.drawtype == Drawtype.normal && string.match(name, "main:")[0] != null) {
	
		// Set up stair.

		const def2: NodeDefinition = table.copy(def as LuaTable) as NodeDefinition
		const newname = "stairs:"+string.gsub(name, "main:", "")+"_stair"
		def2.mod_origin = "stairs"
		// def2.name = newname
		def2.description = def.description+" Stair"
		def2.drop = newname
		def2.paramtype = ParamType1.light
		def2.drawtype = Drawtype.nodebox
		def2.paramtype2 = ParamType2.facedir
		def2.node_placement_prediction = ""
		def2.node_box = {
			type : Nodeboxtype.fixed,
			fixed : [
			[-8/16, -8/16, -0/16, 8/16, 8/16, 8/16],
			[-8/16, -8/16, -8/16, 8/16, 0/16, 8/16],
            ]
		}
		// Ability to place stairs upside down.
		def2.on_place = (itemstack: ItemStackObject, placer: ObjectRef, pointed_thing: PointedThing) => {
			const sneak: boolean = placer.get_player_control().sneak
			if (sneak) {
				const [_,worked] = core.item_place(ItemStack(newname+"_upsidedown"), placer, pointed_thing)
				if (worked) {
					itemstack.take_item()
                }
            } else{
				core.item_place(itemstack, placer, pointed_thing)
            }
			return(itemstack)
        }
        if (!def2.groups) {
            throw new Error(`Undefined groups for [${name}]`)
        }
		def2.groups["stairs"] = 1
		core.register_node(newname,def2)
		
		core.register_craft({
			output : newname+" 6",
			recipe : [
				[ "","",name ],
				[ "",name, name],
				[ name, name,name],
            ]
		})
		
		core.register_craft({
			output : newname+" 6",
			recipe : [
				[ name,"","" ],
				[ name, name,""],
				[ name, name,name],
            ]
		})
    }
}

// Upside down stairs.
for (const [name,def] of pairs(core.registered_nodes)) {
    if (typeof name != "string") {
        core.log(LogLevel.warning, "Number in global registered nodes table")
        continue;
    }

	if (def.drawtype == Drawtype.normal && string.match(name, "main:")[0] != null) {
		const def2: NodeDefinition = table.copy(def as LuaTable) as NodeDefinition
		const newname = "stairs:"+string.gsub(name, "main:", "")+"_stair_upsidedown"
		def2.mod_origin = "stairs"
		// def2.name = newname
		def2.description = def.description+" Stair"
		def2.drop = string.gsub(newname, "_upsidedown", "")[0]
		def2.paramtype = ParamType1.light
		def2.drawtype = Drawtype.nodebox
		def2.paramtype2 = ParamType2.facedir
		
		def2.node_box = {
			type : Nodeboxtype.fixed,
			fixed : [
			[-8/16, -8/16, -0/16, 8/16, 8/16, 8/16],
			[-8/16, -0/16, -8/16, 8/16, 8/16, 8/16],
            ]
		}
        if (!def2.groups) {
            throw new Error(`Undefined groups for [${name}]`)
        }
		def2.groups["stairs"] = 1
		core.register_node(newname,def2)
    }
}


//////////////////////////////////////////////////////- slabs

// todo: Why isn't this just using the global place node thing that makes the sound play when you place a node?!
function place_slab_sound (pos: Vec3,newnode: string): void {
	const node: NodeDefinition | null = core.registered_nodes[newnode] 
    if (node == null) {
        core.log(LogLevel.warning, `Node [${newnode}] has a null definition`)
        return;
    }

	const sound: NodeSoundSpec | undefined = node.sounds

	let placing: string | SimpleSoundSpec | null = null;

	if (sound && sound && sound.placing) {
		placing = sound.placing
    }

	// Only play the sound when is defined.
	if (placing != null) {
        let finalSound: string = ""
        let finalGain = 1.0;
        if (typeof placing == "string"){
            finalSound = placing;
        } else if (placing.name) {
            finalSound = placing.name;
            if (placing.gain) {
                finalGain = placing.gain;
            }
        } else {
            core.log(LogLevel.warning, `Node [${newnode}] has a missing placing sound.`)
        }
		core.sound_play(finalSound, {
			  pos : pos,
			  gain : finalGain,
			  //pitch = math.random(60,100)/100
		})
    }
}
// Slabs - shift click to place upside down.
 for (const [name,def] of pairs(core.registered_nodes)) {
    if (typeof name != "string") {
        core.log(LogLevel.warning, "Number in global registered nodes table")
        continue;
    }
	if (def.drawtype == Drawtype.normal && string.match(name, "main:")) {
	
		// Set up slab.
		local def2 = table.copy(def)
		local newname = "stairs:"..string.gsub(name, "main:", "").."_slab"
		def2.mod_origin = "stairs"
		def2.name = newname
		def2.description = def.description.." Slab"
		def2.drop = newname
		def2.paramtype = "light"
		def2.drawtype = "nodebox"
		def2.on_dig = nil
		def2.node_placement_prediction = ""
		def2.node_box = {
			type = "fixed",
			fixed = {
			{-8/16, -8/16, -8/16, 8/16, 0/16, 8/16},
			}
		}
// 		//we're passing in the local variables newname and name into this function
// 		//calculating wether to turn a half slab into a full block
// 		def2.on_place = function(itemstack, placer, pointed_thing)
// 			//get all the required variables
// 			local sneak = placer:get_player_control().sneak
// 			local ydiff = pointed_thing.above.y-pointed_thing.under.y
// 			local node_under = core.get_node(pointed_thing.under).name
// 			local rightsideup = (newname == node_under)
// 			local upsidedown = (newname.."_upsidedown" == node_under)
			
// 			local placement_worked = false
// 			//upsidedown slab placement
// 			if sneak == true then
// 				local _,worked = core.item_place(ItemStack(newname.."_upsidedown"), placer, pointed_thing)
// 				if worked then
// 					itemstack:take_item()
// 					placement_worked = true
// 				end
// 			//normal placement - (back of slab) or normal node
// 			elseif (rightsideup and ydiff == -1) or (upsidedown and ydiff == 1) or (not rightsideup and not upsidedown) or ydiff == 0 then
// 				local itemstack,worked = core.item_place(itemstack, placer, pointed_thing)
// 				if worked then
// 					placement_worked = true
// 				end
// 			//normal slab to full slab
// 			elseif rightsideup and ydiff == 1 then
// 				place_slab_sound(pointed_thing.under,newname)
// 				core.set_node(pointed_thing.under, {name = name})
// 				itemstack:take_item()
// 				placement_worked = true
// 			//upsidedown slab to full slab
// 			elseif upsidedown and ydiff == -1 then
// 				place_slab_sound(pointed_thing.under,newname)
// 				core.set_node(pointed_thing.under, {name = name})
// 				itemstack:take_item()
// 				placement_worked = true
// 			end
			
// 			//try to do pointed_thing above
// 			if placement_worked == false then
// 				local node_above = core.get_node(pointed_thing.above).name
// 				local rightsideup = (newname == node_above)
// 				local upsidedown = (newname.."_upsidedown" == node_above)
// 				if rightsideup or upsidedown then
// 					place_slab_sound(pointed_thing.above,newname)
// 					core.set_node(pointed_thing.above, {name = name})
// 					itemstack:take_item()
// 				end
// 			end
			
			
// 			return(itemstack)
// 		end
// 		def2.groups["slabs"] = 1
// 		def2.groups[name]=1
// 		core.register_node(newname,def2)
// 		//equalize recipe 6 half slabs turn into 3 full blocks
// 		core.register_craft({
// 			output = newname.." 6",
// 			recipe = {
// 				{ name, name,name},
// 			}
// 		})
// 		core.register_craft({
// 			output = name,
// 			recipe = {
// 				{ newname},
// 				{ newname},
// 			}
// 		})
		
    }
 }

// //upside down stairs
// for name,def in pairs(core.registered_nodes) do
// 	if def.drawtype == "normal" and string.match(name, "main:") then
// 		local def2 = table.copy(def)
// 		local newname = "stairs:"..string.gsub(name, "main:", "").."_slab_upsidedown"
// 		def2.mod_origin = "stairs"
// 		def2.name = newname
// 		def2.description = def.description.." Slab"
// 		def2.drop = string.gsub(newname, "_upsidedown", "")
// 		def2.paramtype = "light"
// 		def2.on_dig = nil
// 		def2.drawtype = "nodebox"
// 		def2.node_box = {
// 			type = "fixed",
// 			fixed = {
// 			{-8/16, -0/16, -8/16, 8/16, 8/16, 8/16},
// 			}
// 		}
// 		def2.groups["slabs"] = 1
// 		def2.groups[name]=1
// 		core.register_node(newname,def2)
// 	end
// end
}