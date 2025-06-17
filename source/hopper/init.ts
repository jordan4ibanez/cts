namespace hopper {
	// hopper.formspec_bg = "background[-0.19,-0.25;9.41,9.49;gui_hb_bg.png]"
	// dofile(MP.."/config.lua")
	// dofile(MP.."/api.lua")
	// dofile(MP.."/utility.lua")
	// dofile(MP.."/doc.lua")
	// dofile(MP.."/nodes/hoppers.lua")
	// dofile(MP.."/nodes/chute.lua")
	// dofile(MP.."/nodes/sorter.lua")
	// dofile(MP.."/crafts.lua")
	// dofile(MP.."/abms.lua")
	// Formspec handling.
	core.register_on_player_receive_fields((player, formname, fields) => {
		if ("hopper_formspec:" == string.sub(formname, 1, 16)) {
			const pos: Vec3 = core.string_to_pos(string.sub(formname, 17, -1));
			const meta: MetaRef = core.get_meta(pos);
			// fixme: why isn't this using a boolean?
			const eject_setting: boolean = meta.get_string("eject") == "true";
			const filter_all_setting: boolean =
				meta.get_string("filter_all") == "true";
			// 		if fields.eject then
			// 			if eject_setting then
			// 				meta:set_string("eject", nil)
			// 			else
			// 				meta:set_string("eject", "true")
			// 			end
			// 		end
			// 		if fields.filter_all then
			// 			if filter_all_setting then
			// 				meta:set_string("filter_all", nil)
			// 			else
			// 				meta:set_string("filter_all", "true")
			// 			end
			// 		end
		}
	});
}
