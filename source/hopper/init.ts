namespace hopper {
	export const formspec_bg: string =
		"background[-0.19,-0.25;9.41,9.49;gui_hb_bg.png]";

	// This is currently being used as a crutch to fix this mod.
	export class config {
		private constructor() {}

		static readonly texture_resolution: string = "16";
		static readonly single_craftable_item: boolean = true;
		static readonly eject_button_enabled: boolean = true;
	}

	utility.loadFiles([
		"api",
		"utility",
		"nodes/hoppers",
		"nodes/chute",
		"nodes/sorter",
		"crafts",
		"abms",
	]);
	// Formspec handling.
	core.register_on_player_receive_fields((player, formname, fields) => {
		if ("hopper_formspec:" == string.sub(formname, 1, 16)) {
			const pos: Vec3 = core.string_to_pos(string.sub(formname, 17, -1));
			const meta: MetaRef = core.get_meta(pos);
			// fixme: why isn't this using a boolean?
			const eject_setting: boolean = meta.get_string("eject") == "true";
			const filter_all_setting: boolean =
				meta.get_string("filter_all") == "true";

			if (fields.eject != null) {
				if (eject_setting) {
					meta.set_string("eject", "");
				} else {
					meta.set_string("eject", "true");
				}
			}

			if (fields.filter_all != null) {
				if (filter_all_setting) {
					meta.set_string("filter_all", "");
				} else {
					meta.set_string("filter_all", "true");
				}
			}
		}
	});
}
