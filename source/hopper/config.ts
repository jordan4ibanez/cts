namespace hopper {
	// Settings.

	// This is currently being used as a crutch to fix this mod.
	export class config {
		private constructor() {}

		static readonly texture_resolution: string = "16";
	}

	// hopper.config.single_craftable_item = core.settings:get_bool("hopper_single_craftable_item")
	// if hopper.config.single_craftable_item == nil then
	// 	hopper.config.single_craftable_item = true
	// end

	// hopper.config.eject_button_enabled = core.settings:get_bool("hopper_eject_button")
	// if hopper.config.eject_button_enabled == nil then
	// 	hopper.config.eject_button_enabled = true
	// end
}
