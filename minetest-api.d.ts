export {};

//* note: All enums were moved to mods/utility/enums.ts

//? Everything was just dumped in as I looked down the lua_api.md

//! If you don't have your mod depend on the utility library, this will just blow up when you try to use it.

// todo: crafter custom stuff needs to be dumped into a custom class instead of polluting this.
// todo: Other people (may) want to try to use this and will get random invalid data.

/** @noSelf **/
interface core {
	PLAYER_MAX_HP_DEFAULT: number;
	get_current_modname(): string;
	get_modpath(modName: string): string | null;
	get_modnames(): string[];
	get_game_info(): GameInfo;
	get_worldpath(): string;
	is_singleplayer(): boolean;
	has_feature(featureName: string): boolean;
	get_player_information(playerName: string): PlayerInformation;
	get_player_window_information(playerName: string): WindowInformation;
	mkdir(dir: string): boolean;
	rmdir(dir: string): boolean;
	cpdir(dir: string, dst: string): boolean;
	mvdir(dir: string): boolean;
	get_dir_list(dir: string, isDir: boolean): string[];
	safe_file_write(path: string, content: string): boolean;
	get_version(): LuantiInfo;
	sha1(data: any, raw: boolean): string;
	colorspec_to_colorstring(colorSpec: ColorSpec): string;
	colorspec_to_bytes(colorSpec: ColorSpec): string;
	encode_png(
		width: number,
		height: number,
		data: ColorSpec[] | string,
		compression: number
	): string;
	urlencode(url: string): string;
	debug(anything: string): void;
	log(level: LogLevel, text: string): void;
	register_node(nodeName: string, definition: NodeDefinition): void;
	register_craftitem(craftItemName: string, definition: ItemDefinition): void;
	register_tool(toolName: string, definition: ItemDefinition): void;
	override_item(itemName: string, definition: NodeDefinition): void;
	unregister_item(itemName: string): void;
	register_entity(entityName: string, definition: LuaEntity): void;
	register_abm(abm: ABMDefinition): void;
	register_lbm(lbm: LBMDefinition): void;
	register_alias(alias: string, originalName: string): void;
	register_alias_force(alias: string, originalName: string): void;
	register_ore(ore: OreDefinition): void;
	register_biome(biome: BiomeDefinition): void;
	unregister_biome(biomeName: string): void;
	register_decoration(decoration: DecorationDefinition): void;
	register_schematic(schematic: SchematicDefinition): number;
	clear_registered_biomes(): void;
	clear_registered_decorations(): void;
	clear_registered_ores(): void;
	clear_registered_schematics(): void;
	register_craft(craftRecipe: CraftRecipeDefinition): void;
	clear_craft(craftRecipe: CraftRecipeDefinition): void;
	register_chatcommand(
		commandName: string,
		definition: ChatCommandDefinition
	): void;
	override_chatcommand(
		commandName: string,
		definition: ChatCommandDefinition
	): void;
	unregister_chatcommand(commandName: string): void;
	register_privilege(
		privilegeName: string,
		definition: PrivilegeDefinition
	): void;
	register_authentication_handler(
		authHandler: AuthenticationHandlerDefinition
	): void;
	register_globalstep(fun: (delta: number) => void): void;
	register_on_mods_loaded(fun: () => void): void;
	register_on_shutdown(fun: () => void): void;
	register_on_placenode(
		fun: (
			pos: Vec3,
			node: NodeTable,
			placer: ObjectRef,
			oldNode: NodeTable,
			itemStack: ItemStackObject,
			pointedThing: PointedThing
		) => void
	): void;
	register_on_dignode(
		fun: (pos: Vec3, oldNode: NodeTable, digger: ObjectRef) => void
	): void;
	register_on_punchnode(
		fun: (
			pos: Vec3,
			node: NodeTable,
			puncher: ObjectRef,
			pointedThing: PointedThing
		) => void
	): void;
	register_on_generated(
		fun: (minp: Vec3, maxp: Vec3, blockSeed: number) => void
	): void;
	register_on_newplayer(fun: (player: ObjectRef) => void): void;
	register_on_punchplayer(
		fun: (
			player: ObjectRef,
			hitter: ObjectRef,
			timeFromLastPunch: number,
			toolCapabilities: ToolCapabilities,
			dir: Vec3,
			damage: number
		) => void
	): void;
	register_on_rightclickplayer(
		fun: (player: ObjectRef, clicker: ObjectRef) => void
	): void;
	register_on_player_hpchange(
		fun: (
			player: ObjectRef,
			hpChange: number,
			reason: HPChangeReasonDefinition
		) => boolean | void,
		modifier: boolean
	): void;
	register_on_dieplayer(
		fun: (player: ObjectRef, reason: HPChangeReasonDefinition) => void
	): void;
	register_on_respawnplayer(fun: (player: ObjectRef) => void): void;
	register_on_prejoinplayer(fun: (name: string, ip: string) => void): void;
	register_on_joinplayer(
		fun: (player: ObjectRef, lastLogin: string) => void
	): void;
	register_on_leaveplayer(
		fun: (player: ObjectRef, timedOut: boolean) => void
	): void;
	register_on_authplayer(
		fun: (name: string, ip: string, isSuccess: boolean) => void
	): void;
	register_on_auth_fail(fun: (name: string, ip: string) => void): void;
	register_on_cheat(
		fun: (player: ObjectRef, cheat: CheatDefinition) => void
	): void;
	register_on_chat_message(
		fun: (name: string, message: string) => void
	): void;
	register_on_chatcommand(
		fun: (name: string, command: string, params: string) => boolean
	): void;
	register_on_player_receive_fields(
		fun: (
			player: ObjectRef,
			formName: string,
			fields: Dictionary<string, any>
		) => void
	): void;
	register_on_craft(
		fun: (
			itemStack: ItemStackObject,
			player: ObjectRef,
			oldCraftGrid: any[],
			craftInv: string
		) => void
	): void;
	register_craft_predict(
		fun: (
			itemStack: ItemStackObject,
			player: ObjectRef,
			oldCraftGrid: any[],
			craftInv: string
		) => void
	): void;
	register_allow_player_inventory_action(
		fun: (
			player: ObjectRef,
			action: string,
			inventory: InvRef,
			inventoryInfo: ActionDefinition
		) => void | number
	): void;
	register_on_player_inventory_action(
		fun: (
			player: ObjectRef,
			action: string,
			inventory: string,
			inventoryInfo: ActionDefinition
		) => void
	): void;
	register_on_protection_violation(
		fun: (position: Vec3, name: string) => void
	): void;
	register_on_item_eat(
		fun: (
			hpChange: number,
			replaceWithItem: boolean,
			itemStack: ItemStackObject,
			user: ObjectRef,
			pointedThing: PointedThing
		) => void
	): void;
	register_on_item_pickup(
		fun: (
			itemStack: ItemStackObject,
			picker: ObjectRef,
			pointedThing: PointedThing,
			timeFromLastPunch: number,
			...any: any
		) => void
	): void;
	register_on_priv_grant(
		fun: (name: string, granter: string, priv: string) => void
	): void;
	register_on_priv_revoke(
		fun: (name: string, revoker: string, priv: string) => void
	): void;
	register_can_bypass_userlimit(
		fun: (name: string, ip: string) => void
	): void;
	register_on_modchannel_message(
		fun: (channelName: string, sender: string, message: string) => void
	): void;
	register_on_liquid_transformed(
		fun: (posList: Vec3[], nodeList: string[]) => void
	): void;
	register_on_mapblocks_changed(
		fun: (modifiedBlocks: string[], nodeList: any[]) => void
	): void;
	settings: LuantiSettingsObject;
	setting_get_pos(name: string): Vec3;
	string_to_privs(str: string, delim: string): string;
	privs_to_string(privs: string, delim: string): string;
	get_player_privs(playerName: string): Dictionary<string, boolean>;
	check_player_privs(
		playerOrName: ObjectRef | string,
		stringListOrMap: string | Dictionary<string, boolean>
	): boolean | boolean[];
	check_password_entry(
		playerName: string,
		entry: string,
		password: string
	): boolean;
	get_password_hash(playerName: string, rawPassword: string): string;
	get_player_ip(playerName: string): string;
	get_auth_handler(): AuthenticationHandlerDefinition;
	notify_authentication_modified(playerName: string): void;
	set_player_password(playerName: string, passwordHash: string): void;
	set_player_privs(playerName: string, priv: { string: boolean }): void;
	auth_reload(): void;
	chat_send_all(message: string): void;
	chat_send_player(playerName: string, message: string): void;
	format_chat_message(playerName: string, message: string): void;
	set_node(position: Vec3, nodeTable: NodeTable): void;
	add_node(position: Vec3, nodeTable: NodeTable): void;
	bulk_set_node(positions: Vec3[], nodeTable: NodeTable): void;
	swap_node(position: Vec3, nodeTable: NodeTable): void;
	remove_node(position: Vec3): void;
	get_node(position: Vec3): NodeTable;
	get_node_or_nil(position: Vec3): NodeTable | null;
	get_node_light(position: Vec3, timeOfDay: number | null): number | null;
	get_natural_light(position: Vec3, timeOfDay: number): number;
	get_artificial_light(param1: number): number;
	place_node(position: Vec3, nodeTable: NodeTable): void;
	dig_node(position: Vec3): boolean;
	punch_node(position: Vec3): void;
	spawn_falling_node(position: Vec3): [boolean, ObjectRef] | boolean;
	find_nodes_with_meta(pos1: Vec3, pos2: Vec3): Vec3[];
	get_meta(position: Vec3): MetaRef;
	get_node_timer(position: Vec3): NodeTimerObject;
	add_entity(
		position: Vec3,
		entityName: string,
		staticData?: string
	): ObjectRef | null;
	add_item(position: Vec3, item: ItemStackObject | string): ObjectRef | null;
	get_player_by_name(playerName: string): ObjectRef | null;
	get_objects_inside_radius(position: Vec3, radius: number): ObjectRef[];
	get_objects_in_area(pos1: Vec3, pos2: Vec3): ObjectRef[];
	set_timeofday(newTimeOfDay: number): void;
	get_timeofday(): number;
	get_gametime(): number;
	get_day_count(): number;
	find_node_near(
		position: Vec3,
		radius: number,
		nodeNames: string[],
		searchCenter?: boolean
	): Vec3 | null;
	find_nodes_in_area(
		pos1: Vec3,
		pos2: Vec3,
		nodeNames: string[],
		grouped: true
	): Dictionary<string, Vec3[]>;
	find_nodes_in_area(
		pos1: Vec3,
		pos2: Vec3,
		nodeNames: string | string[]
		// grouped?: false //? This is ommited to simplify the api.
	): LuaMultiReturn<[Vec3[], Dictionary<string, number>]>;
	find_nodes_in_area_under_air(
		pos1: Vec3,
		pos2: Vec3,
		nodeNames: string[]
	): Vec3[];
	get_perlin(nodeParams: NoiseParams): PerlinNoiseObject;
	get_perlin(
		seedDiff: number,
		octaves: number,
		persistence: number,
		spread: number
	): PerlinNoiseObject;
	get_voxel_manip(pos1: Vec3, pos2: Vec3): VoxelManipObject;
	set_gen_notify(flags: GenNotifyFlags, decorationIDs: number[]): void;
	get_gen_notify(): number[];
	get_decoration_id(decorationName: string): number;
	get_mapgen_object(objectName: string): GenNotifyObject;
	get_heat(position: Vec3): number;
	get_humidity(position: Vec3): number;
	get_biome_data(position: Vec3): BiomeDataDefinition | null;
	get_biome_id(biomeName: string): number;
	get_biome_name(biomeID: number): string;
	get_mapgen_setting(settingName: string): MapGenSettingsDefinition;
	set_mapgen_params(mapgenParams: MapGenSettingsDefinition): void;
	get_mapgen_edges(mapgenLimit: number, chunkSize: number): void;
	get_mapgen_setting(settingName: string): MapGenSettingsDefinition;
	get_mapgen_setting_noiseparams(settingName: string): NoiseParams;
	set_mapgen_setting(name: string, value: any, overrideMeta: boolean): void;
	set_noiseparams(
		name: string,
		noiseParams: NoiseParams,
		overrideMeta: boolean
	): void;
	get_noiseparams(name: string): NoiseParams;
	generate_ores(voxelManip: VoxelManipObject, pos1: Vec3, pos2: Vec3): void;
	generate_decorations(
		voxelManip: VoxelManipObject,
		pos1: Vec3,
		pos2: Vec3
	): void;
	clear_objects(options: ClearObjectsOptions): void;
	load_area(pos1: Vec3, pos2: Vec3): void;
	emerge_area(
		pos1: Vec3,
		pos2: Vec3,
		fun: EmergeAreaCallback,
		param: any
	): void;
	delete_area(pos1: Vec3, pos2: Vec3): void;
	line_of_sight(pos1: Vec3, pos2: Vec3): [boolean, Vec3];
	raycast(
		pos1: Vec3,
		pos2: Vec3,
		hitObjects: boolean,
		hitLiquids: boolean
	): RaycastObject;
	find_path(
		pos1: Vec3,
		pos2: Vec3,
		searchDistance: number,
		maxJump: number,
		maxDrop: number,
		algorithm: SearchAlgorithm
	): Vec3[];
	spawn_tree(position: Vec3, definition: TreeDefinition): void;
	transforming_liquid_add(position: Vec3): void;
	get_node_max_level(position: Vec3): number;
	get_node_level(position: Vec3): number;
	set_node_level(position: Vec3, level: number): number;
	add_node_level(position: Vec3, level: number): number;
	fix_light(pos1: Vec3, pos2: Vec3): boolean;
	check_single_for_falling(position: Vec3): void;
	check_for_falling(position: Vec3): void;
	get_spawn_level(x: number, z: number): number | null;
	mod_channel_join(channelName: string): ModChannel;
	get_perlin_map(params: NoiseParams, size: Vec3): PerlinNoiseMapObject;
	get_inventory(position: InvRefLocation): InvRef;
	create_detached_inventory(
		name: string,
		callbacks: DetachedInventoryCallbacks,
		playerName: string
	): InvRef;
	remove_detached_inventory(name: string): boolean;
	do_item_eat(
		hpChange: number,
		replaceWithItem: ItemStackObject,
		itemStack: ItemStackObject,
		user: ObjectRef,
		pointedThing: PointedThing
	): ItemStackObject | null;
	show_formspec(playerName: string, formName: string, formSpec: string): void;
	close_formspec(playerName: string, formName: string): void;
	formspec_escape(escape: string): string;
	explode_table_event(string: string): Map<any, any>;
	explode_textlist_event(string: string): Map<any, any>;
	explode_scrollbar_event(string: string): Map<any, any>;
	inventorycube(img1: string, img2: string, img3: string): string;
	get_pointed_thing_position(
		pointedThing: PointedThing,
		above: boolean
	): Vec3 | null;
	dir_to_facedir(direction: Vec3, is6d?: boolean): number;
	facedir_to_dir(faceDir: number): Vec3;
	dir_to_fourdir(direction: Vec3): number;
	fourdir_to_dir(faceDir: number): Vec3;
	dir_to_wallmounted(direction: Vec3): number;
	wallmounted_to_dir(faceDir: number): Vec3;
	dir_to_yaw(direction: Vec3): number;
	yaw_to_dir(yaw: number): Vec3;
	is_colored_paramtype(pType: number): boolean;
	strip_param2_color(param2: number, paramType2: ParamType2): number | null;
	get_node_drops(node: string | NodeTable, toolName: string): string[] | null;
	get_craft_result(
		input: CraftRecipeCheckDefinition
	): LuaMultiReturn<[CraftResultObject, CraftRecipeCheckDefinition]>;
	get_craft_recipe(output: string | NodeTable): CraftRecipeObject;
	get_all_craft_recipes(
		queryItem: string | NodeTable
	): CraftRecipeDefinition[] | null;
	handle_node_drops(
		position: Vec3,
		drops: string[] | ItemStackObject[],
		digger: ObjectRef
	): void;
	itemstring_with_palette(
		item: ItemStackObject,
		paletteIndex: number
	): string;
	itemstring_with_color(
		item: ItemStackObject,
		colorString: DynamicColorSpec
	): string;
	rollback_get_node_actions(
		position: Vec3,
		range: number,
		seconds: number,
		limit: number
	): Rollback[];
	rollback_revert_actions_by(
		actor: string,
		seconds: number
	): [boolean, string];
	item_place_node(
		itemStack: ItemStackObject,
		placer: ObjectRef,
		pointedThing: PointedThing,
		param2?: number,
		preventAfterPlace?: boolean
	): LuaMultiReturn<[ItemStackObject, Vec3 | null]>;
	//? Deprecated.
	// item_place_object(itemStack: ItemStackObject, placer: ObjectRef, pointedThing: PointedThing): ItemStackObject
	item_place(
		itemStack: ItemStackObject,
		placer: ObjectRef,
		pointedThing: PointedThing,
		param2?: number
	): LuaMultiReturn<[ItemStackObject, Vec3 | null]>;
	item_pickup(
		itemStack: ItemStackObject,
		picker: ObjectRef,
		pointedThing: PointedThing,
		timeFromLastPunch: number,
		...any: any
	): ItemStackObject;
	item_drop(
		itemStack: ItemStackObject,
		dropper: ObjectRef | null,
		position: Vec3
	): [ItemStackObject, ObjectRef] | null;
	item_eat(hpChange: number, replaceWithItem: string): void;
	node_punch(
		position: Vec3,
		nodeTable: NodeTable,
		puncher: ObjectRef,
		pointedThing: PointedThing
	): void;
	node_dig(position: Vec3, nodeTable: NodeTable, digger: ObjectRef): void;

	// Optional: Variable number of arguments that are passed to func.
	// Aka: It's up to you to make it type safe.
	after(seconds: number, fun: (...any: any) => void, ...any: any): Job;

	handle_async(
		fun: (...any: any) => any,
		callback: (...any: any) => any,
		...any: any
	): any; // any any any any
	register_async_dofile(path: string): void;
	request_shutdown(message: string, reconnect: boolean, delay: number): void;
	cancel_shutdown_requests(): void;
	get_server_status(name: string, joined: boolean): void;
	get_server_uptime(): number;
	get_server_max_lag(): number;
	remove_player(playerName: string): number;
	remove_player_auth(playerName: string): boolean;
	dynamic_add_media(
		options: DynamicAddMediaOptions,
		fun: (name: string) => void
	): void;
	get_ban_list(): string;
	get_ban_description(ipOrName: string): string;
	ban_player(playerName: string): boolean;
	unban_player_or_ip(ipOrName: string): void;
	kick_player(playerName: string, reason: string): boolean;
	disconnect_player(name: string, reason: string): boolean;
	add_particle(definition: ParticleDefinition): void;
	add_particlespawner(definition: ParticleSpawnerDefinition): number;
	delete_particlespawner(id: number, playerName: string): void;
	create_schematic(
		pos1: Vec3,
		pos2: Vec3,
		probabilityList: SchematicProbability[],
		fileName: string,
		sliceProbList: SchematicSliceProbability[]
	): void;
	place_schematic(
		position: Vec3,
		schematic: SchematicDefinition | string,
		rotation: SchematicRotation,
		replacements: Map<string, string> | null,
		forcePlacement: boolean,
		flags: SchematicPlacementFlag | string
	): void;
	place_schematic_on_vmanip(
		voxelManip: VoxelManipObject,
		position: Vec3,
		schematic: SchematicDefinition,
		rotation: SchematicRotation,
		replacement: Map<string, string>,
		forcePlacement: boolean,
		flags: SchematicPlacementFlag[]
	): void;
	serialize_schematic(
		schematic: SchematicDefinition,
		format: SchematicFormat,
		options: SchematicSerializationOption[]
	): void;
	read_schematic(
		schematic: SchematicDefinition | string,
		options: SchematicReadOptionYSlice[]
	): Array<any>;

	// Function only exists if Luanti server was built with cURL support.
	request_http_api?(): HTTPApi | null;

	get_mod_storage(): MetaRef;
	get_connected_players(): ObjectRef[];
	is_player(thing: ObjectRef): boolean;
	player_exists(playerName: string): boolean;
	hud_replace_builtin(
		name: HudReplaceBuiltinOption,
		definition: HudDefinition
	): void;
	parse_relative_number(
		arg: ParseRelativeNumberArgument,
		relativeTo: number
	): number | null;
	send_join_message(playerName: string): void;
	send_leave_message(playerName: string, timedOut: boolean): void;
	hash_node_position(position: Vec3): number;
	get_position_from_hash(hash: number): Vec3;
	get_item_group(name: string, group: string): number;
	raillike_group(name: string): number;
	get_content_id(name: string): number;
	get_name_from_content_id(id: number): string;
	// fixme: This is probably wrong.
	parse_json(string: string, nullValue?: any): Dictionary<string, any>;
	write_json(data: any[], styled: boolean): string | null;
	serialize(any: any): string;
	deserialize(string: string, safe?: boolean): any;
	compress(data: string, method: CompressionMethod, ...any: any): string;
	decompress(data: string, method: CompressionMethod, ...any: any): string;
	rgba(red: number, green: number, blue: number, alpha: number): string;
	encode_base64(string: string): string;
	decode_base64(string: string): string;
	is_protected(position: Vec3, name: string): boolean;
	record_protection_violation(position: Vec3, name: string): void;
	is_creative_enabled(name: string): boolean;
	is_area_protected(
		pos1: Vec3,
		pos2: Vec3,
		playerName: string,
		interval: number
	): boolean;
	rotate_and_place(
		itemStack: ItemStackObject,
		placer: ObjectRef,
		pointedThing: PointedThing,
		infiniteStacks: boolean,
		orientFlags: RotateAndPlaceOrientationFlag,
		preventAfterPlace: boolean
	): ItemStackObject;
	rotate_node(
		itemStack: ItemStackObject,
		placer: ObjectRef,
		pointedThing: PointedThing
	): void;
	calculate_knockback(
		player: ObjectRef,
		hitter: ObjectRef,
		timeFromLastPunch: number,
		toolCapabilities: ToolCapabilities,
		dir: Vec3,
		distance: number,
		damage: number
	): number;
	forceload_block(position: Vec3, transient: boolean, limit: number): boolean;
	forceload_free_block(position: Vec3, transient: boolean): void;
	compare_block_status(
		position: Vec3,
		condition: BlockStatusCondition
	): boolean | null;
	request_insecure_environment(): any;
	global_exists(name: string): boolean;

	registered_items: Dictionary<string, ItemDefinition>;
	registered_nodes: Dictionary<string, NodeDefinition>;
	registered_craftitems: Dictionary<string, ItemDefinition>;
	registered_tools: Dictionary<string, ItemDefinition>;
	registered_entities: Dictionary<string, LuaEntity>;
	object_refs: Dictionary<string, ObjectRef>;
	luaentities: Dictionary<string, LuaEntity>;
	registered_abms: ABMDefinition[];
	registered_lbms: LBMDefinition[];
	registered_aliases: Dictionary<string, string>;
	registered_ores: Dictionary<string, OreDefinition>;
	registered_biomes: Dictionary<string, BiomeDefinition>;
	registered_decorations: Dictionary<string, DecorationDefinition>;
	registered_schematics: Dictionary<string, SchematicDefinition>;
	registered_chatcommands: Dictionary<string, ChatCommandDefinition>;
	registered_privileges: Dictionary<string, PrivilegeDefinition>;

	wrap_text(str: string, limit: number, asTable: boolean): string | string[];
	pos_to_string(position: Vec3, decimalPlaces?: number): string;
	string_to_pos(string: string): Vec3;
	string_to_area(positions: string, relativeTo: Vec3): [Vec3, Vec3];
	formspec_escape(string: string): string;
	is_yes(arg: any): boolean;
	is_nan(arg: number): boolean;
	get_us_time(): number;
	pointed_thing_to_face_pos(
		placer: ObjectRef,
		pointedThing: PointedThing
	): Vec3;
	get_tool_wear_after_use(uses: number, initialWear: number): number;
	get_dig_params(
		groups: Dictionary<string, number>,
		toolCapabilities: ToolCapabilities,
		wear?: number
	): DigParamsReturn;
	get_hit_params(
		groups: string[],
		toolCapabilities: ToolCapabilities,
		timeFromLastPunch: number,
		wear: number
	): HitParamsReturn;

	// Returns Singular and Plural translators.
	get_translator(
		textDomain: string
	): LuaMultiReturn<[Translator, Translator]>;
	translate(textDomain: string, ...string: string[]): string;

	sound_play(
		spec: SimpleSoundSpec | string,
		parameters: SoundParameterTable,
		ephemeral?: boolean
	): number;
	sound_stop(handle: number): void;
	sound_fade(handle: number, step: number, gain: number): void;

	get_color_escape_sequence(color: string): string;
	colorize(color: string, message: string): string;
	get_background_escape_sequence(color: string): string;
	strip_foreground_colors(string: string): string;
	strip_background_colors(string: string): string;
	strip_colors(string: string): string;

	/**
	 * WARNING! THIS IS NOT MEANT TO BE USED IN PRODUCTION!
	 * This is only exposed to allow extension!
	 */
	spawn_item(pos: Vec3, item: ItemStackObject | string): ObjectRef | null;

	features: {
		glasslike_framed: boolean;
		nodebox_as_selectionbox: boolean;
		get_all_craft_recipes_works: boolean;
		use_texture_alpha: boolean;
		no_legacy_abms: boolean;
		texture_names_parens: boolean;
		area_store_custom_ids: boolean;
		add_entity_with_staticdata: boolean;
		no_chat_message_prediction: boolean;
		object_use_texture_alpha: boolean;
		object_independent_selectionbox: boolean;
		httpfetch_binary_data: boolean;
		formspec_version_element: boolean;
		area_store_persistent_ids: boolean;
		pathfinder_works: boolean;
		object_step_has_moveresult: boolean;
		direct_velocity_on_players: boolean;
		use_texture_alpha_string_modes: boolean;
		degrotate_240_steps: boolean;
		abm_min_max_y: boolean;
		dynamic_add_media_table: boolean;
		particlespawner_tweenable: boolean;
		get_sky_as_table: boolean;
		get_light_data_buffer: boolean;
		mod_storage_on_disk: boolean;
		compress_zstd: boolean;
		sound_params_start_time: boolean;
		physics_overrides_v2: boolean;
		hud_def_type_field: boolean;
		random_state_restore: boolean;
		after_order_expiry_registration: boolean;
		wallmounted_rotate: boolean;
		item_specific_pointabilities: boolean;
		blocking_pointability_type: boolean;
		dynamic_add_media_startup: boolean;
		dynamic_add_media_filepath: boolean;
		lsystem_decoration_type: boolean;
		item_meta_range: boolean;
		node_interaction_actor: boolean;
		moveresult_new_pos: boolean;
		override_item_remove_fields: boolean;
		hotbar_hud_element: boolean;
		bulk_lbms: boolean;
		abm_without_neighbors: boolean;
		biome_weights: boolean;
		particle_blend_clip: boolean;
		remove_item_match_meta: boolean;
		httpfetch_additional_methods: boolean;
	};
}

// /** @noSelf **/ interface HeightMapObject {

// }

// /** @noSelf **/ interface BiomeMapObject {

// }

// /** @noSelf **/ interface HeatMapObject {

// }

// /** @noSelf **/ interface HumidityMapObject {

// }

//~ Structs. (Plain Old Data: NO implicit self [this is null]) ===============================================

/** @noSelf **/
declare global {
	const core: core;

	/** @noSelf **/ interface InvRefLocation {
		type: string;
		name?: string;
		pos?: Vec3;
	}

	/** @noSelf **/ interface TreeDefinition {
		axiom: string;
		rules_a: string;
		rules_b: string;
		rules_c: string;
		rules_d: string;
		trunk: string;
		leaves: string;
		leaves2: string;
		leaves2_chance: number;
		angle: number;
		iterations: number;
		random_level: number;
		trunk_type: string;
		thin_branches: boolean;
		fruit: string;
		fruit_chance: number;
		seed: number;
	}

	type GenNotifyObject = Map<string, Vec3[]>;

	/** @noSelf **/ interface SimpleSoundSpec {
		name?: string;
		gain?: number;
		pitch?: number;
		fade?: number;
	}

	/**
	 * I'm sure this can be used for something.
	 */
	/** @noSelf **/ interface ComplexSoundSpec extends SimpleSoundSpec {
		randomizePitch?: boolean;
		min?: number;
		max?: number;
	}

	/** @noSelf **/ interface SoundParameterTable extends SimpleSoundSpec {
		start_time?: number;
		loop?: boolean;
		pos?: Vec3;
		object?: ObjectRef;
		to_player?: string;
		max_hear_distance?: number;
	}

	/** @noSelf **/ interface NodeBox {
		type: Nodeboxtype;
		fixed?: box | boxTable;
		wall_top?: box | boxTable;
		wall_bottom?: box | boxTable;
		wall_side?: box | boxTable;
		connect_top?: box | boxTable;
		connect_bottom?: box | boxTable;
		connect_front?: box | boxTable;
		connect_left?: box | boxTable;
		connect_back?: box | boxTable;
		connect_right?: box | boxTable;
		disconnected_top?: box | boxTable;
		disconnected_bottom?: box | boxTable;
		disconnected_front?: box | boxTable;
		disconnected_left?: box | boxTable;
		disconnected_back?: box | boxTable;
		disconnected_right?: box | boxTable;
		disconnected?: box | boxTable;
		disconnected_sides?: box | boxTable;
	}

	type box = number[];

	type boxTable = box[];

	type itemstring = string;

	/** @noSelf **/ interface GameInfo {
		id: string;
		title: string;
		author: string;
		path: string;
	}

	/** @noSelf **/ interface PlayerInformation {
		address: string;
		ip_version: number;
		connection_uptime: number;
		protocol_version: number;
		formspec_version: number;
		lang_code: string;
		min_rtt: number;
		max_rtt: number;
		avg_rtt: number;
		min_jitter: number;
		max_jitter: number;
		avg_jitter: number;
	}

	/** @noSelf **/ interface WindowInformation {
		size: Vec2;
		max_formspec_size: Vec2;
		real_gui_scaling: number;
		real_hud_scaling: number;
	}

	/** @noSelf **/ interface LuantiInfo {
		project: string;
		string: string;
		proto_min: string;
		proto_max: string;
		hash: string;
		is_dev: boolean;
	}

	/** @noSelf **/ interface ColorSpec {
		a: number;
		r: number;
		g: number;
		b: number;
	}

	/** @noSelf **/ interface NodeSoundSpec {
		footstep?: SimpleSoundSpec | string;
		dig?: SimpleSoundSpec | string;
		dug?: SimpleSoundSpec | string;
		// place?: SimpleSoundSpec | string;
		place_failed?: SimpleSoundSpec | string;
		fall?: SimpleSoundSpec | string;
		// break?: SimpleSoundSpec | string;
		placed?: SimpleSoundSpec | string;
		//* Crafter custom.
		placing?: SimpleSoundSpec | string;
	}

	/** @noSelf **/ interface ItemDropSpec {
		tools?: string[];
		rarity?: number;
		items?: string[];
		inherit_color?: boolean;
		tool_groups?: string[] | string[][];
	}

	/** @noSelf **/ interface NodeDropSpec {
		max_items?: number;
		items: ItemDropSpec[];
	}

	/** @noSelf **/ interface MapNode {
		name: string;
		prob: number;
		param2: number;
		force_place: boolean;
	}

	/** @noSelf **/ interface NodeTable {
		name: string;
		param1?: number;
		param2?: number;
		level?: number;
	}

	/** @noSelf **/ interface PointedThing {
		type: PointedThingType;
		under?: Vec3;
		above?: Vec3;
		ref?: ObjectRef;
		// Currently only Raycast supports these fields.
		intersection_point?: Vec3;
		// The ID of the pointed selection box (counting starts from 1).
		box_id?: number;
		// Unit vector, points outwards of the selected selection box.
		intersection_normal?: Vec3;
	}

	/** @noSelf **/ interface GroupCap {
		// Allow the end programmer to do it their way.
		times: Dictionary<number, number>;
		uses?: number;
		maxlevel?: number;
		// This is a bolt on specifically for Forgotten Lands. You can still use it though, but it won't do anything without implementation.
		maxdrop?: number;
	}

	/** @noSelf **/ interface ToolCapabilities {
		full_punch_interval?: number;
		max_drop_level?: number;
		groupcaps?: Dictionary<string, GroupCap>;
		damage_groups?: Dictionary<string, number>;
		punch_attack_uses?: number;
	}

	/** @noSelf **/ interface ItemSounds {
		breaks: SimpleSoundSpec | string;
		eat: SimpleSoundSpec | string;
		punch_use: SimpleSoundSpec | string;
		punch_use_air: SimpleSoundSpec | string;
	}

	/** @noSelf **/ interface Collision {
		type: string;
		axis: string;
		node_pos: Vec3;
		object: ObjectRef;
		old_velocity: Vec3;
		new_velocity: Vec3;
		// Available since 5.9.0.
		new_pos: Vec3;
	}

	/** @noSelf **/ interface MoveResult {
		touching_ground: boolean;
		collides: boolean;
		standing_on_object: boolean;
		collisions: Collision[];
	}

	type DynamicColorSpec = ColorSpec | string;

	/** @noSelf **/ interface ItemDefinition {
		type?: string;
		description?: string;
		short_description?: string;
		groups?: Dictionary<string, number>;

		//! Note: crafter custom.
		mob_hit_wear?: number;
		wearing_texture?: string;

		inventory_image?: string;
		inventory_overlay?: string;
		wield_image?: string;
		wield_overlay?: string;
		wield_scale?: Vec3;
		palette?: string;
		color?: DynamicColorSpec;
		stack_max?: number;
		range?: number;
		liquids_pointable?: boolean;
		light_source?: number;
		tool_capabilities?: ToolCapabilities;
		node_placement_prediction?: string;
		node_dig_prediction?: string;
		sound?: {
			breaks?: SimpleSoundSpec | string;
			eat?: SimpleSoundSpec | string;
			punch_use?: SimpleSoundSpec | string;
			punch_use_air?: SimpleSoundSpec | string;
		};
		// todo: Not sure if these are actually void
		on_place?(
			itemStack: ItemStackObject,
			placer: ObjectRef,
			pointedThing: PointedThing
		): ItemStackObject | void;
		on_secondary_use?(
			itemStack: ItemStackObject,
			user: ObjectRef,
			pointedThing: PointedThing
		): ItemStackObject | void;
		on_drop?(
			itemStack: ItemStackObject | null,
			dropper: ObjectRef,
			position: Vec3
		): ItemStackObject | void;
		on_pickup?(
			itemStack: ItemStackObject,
			picker: ObjectRef,
			pointedThing: PointedThing,
			timeFromLastPunch: number,
			...any: any
		): ItemStackObject | void;
		on_use?(
			itemStack: ItemStackObject,
			user: ObjectRef,
			pointedThing: PointedThing
		): ItemStackObject | void;
		after_use?(
			itemStack: ItemStackObject,
			user: ObjectRef,
			nodeTable: NodeTable,
			digParams: { string: any }
		): ItemStackObject | void;
	}

	/** @noSelf **/ interface TileDefinition {
		name: string;
		backface_culling?: boolean;
		animation?: TileAnimationDefinition;
	}

	/** @noSelf **/ interface NodeDefinition extends ItemDefinition {
		//? Crafter custom.
		redstone_activation?: (pos: Vec3) => void;
		redstone_deactivation?: (pos: Vec3) => void;
		canSilkTouch?: boolean;
		silkTouchSpecialDrop?: string;

		// -- <all fields allowed in item definitions>
		description?: string;
		drawtype?: Drawtype;
		visual_scale?: number;
		tiles?: (string | TileDefinition)[];
		inventory_image?: string;
		wield_image?: string;
		node_placement_prediction?: string;
		on_place?(
			itemStack: ItemStackObject,
			placer: ObjectRef,
			pointedThing: PointedThing
		): ItemStackObject | void;
		overlay_tiles?: string[];
		special_tiles?: string[] | TileDefinition[];
		wield_scale?: Vec3;
		color?: DynamicColorSpec;
		light_source?: number;
		use_texture_alpha?: TextureAlpha;
		palette?: string;
		post_effect_color?: DynamicColorSpec;
		post_effect_color_shaded?: boolean;
		paramtype?: ParamType1;
		//! Note: this is deprecated.
		// alpha?: number;
		paramtype2?: ParamType2;
		place_param2?: number;
		is_ground_content?: boolean;
		sunlight_propagates?: boolean;
		walkable?: boolean;
		groups?: Dictionary<string, number>;
		pointable?: boolean;
		diggable?: boolean;
		climbable?: boolean;
		move_resistance?: number;
		buildable_to?: boolean;
		floodable?: boolean;
		liquidtype?: LiquidType;
		liquid_alternative_flowing?: string;
		liquid_alternative_source?: string;
		liquid_viscosity?: number;
		liquid_renewable?: boolean;
		liquid_move_physics?: boolean;
		leveled?: number;
		leveled_max?: number;
		liquid_range?: number;
		drowning?: number;
		damage_per_second?: number;
		node_box?: NodeBox;
		connects_to?: string[];
		connect_sides?: NodeBoxConnections;
		mesh?: string;
		selection_box?: NodeBox;
		collision_box?: NodeBox;
		legacy_facedir_simple?: boolean;
		legacy_wallmounted?: boolean;
		waving?: number;
		sounds?: NodeSoundSpec;
		drop?: NodeDropSpec | string;
		on_construct?(position: Vec3): void;
		on_destruct?(position: Vec3): void;
		after_destruct?(position: Vec3, oldNode: MapNode): void;
		on_flood?(position: Vec3, oldNode: NodeTable, newNode: NodeTable): void;
		preserve_metadata?(
			position: Vec3,
			oldNode: NodeTable,
			oldMeta: NodeTable,
			drops: ItemStackObject[]
		): void;
		after_place_node?(
			position: Vec3,
			placer: ObjectRef,
			itemStack: ItemStackObject,
			pointedThing: PointedThing
		): void;
		after_dig_node?(
			position: Vec3,
			oldNode: NodeTable,
			oldMeta: string,
			digger: ObjectRef
		): void;
		can_dig?(position: Vec3, canDig: ObjectRef): boolean;
		on_punch?(
			position: Vec3,
			node: NodeTable,
			puncher: ObjectRef,
			pointedThing: PointedThing
		): void;
		on_rightclick?(
			position: Vec3,
			node: NodeTable,
			clicker: ObjectRef,
			itemStack: ItemStackObject,
			pointedThing: PointedThing
		): void;
		on_dig?(position: Vec3, node: NodeTable, digger: ObjectRef): void;
		on_timer?(position: Vec3, elapsed: number): void;
		on_receive_fields?(
			position: Vec3,
			formName: string,
			fields: Dictionary<string, any>,
			sender: ObjectRef
		): void;
		allow_metadata_inventory_move?(
			position: Vec3,
			fromList: string,
			fromIndex: number,
			toList: string,
			toIndex: number,
			count: number,
			player: ObjectRef
		): void;
		allow_metadata_inventory_put?(
			position: Vec3,
			listName: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		): number;
		allow_metadata_inventory_take?(
			position: Vec3,
			listName: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		): number;
		on_metadata_inventory_move?(
			position: Vec3,
			fromList: string,
			fromIndex: number,
			toList: string,
			toIndex: number,
			count: number,
			player: ObjectRef
		): void;
		on_metadata_inventory_put?(
			position: Vec3,
			listName: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		): void;
		on_metadata_inventory_take?(
			position: Vec3,
			listName: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		): void;
		on_blast?(position: Vec3, intensity: number): void;
		mod_origin?: string;
	}

	/** @noSelf **/ interface ABMDefinition {
		label: string;
		nodenames: string[];
		neighbors?: string[];
		interval: number;
		chance: number;
		min_y?: number;
		max_y?: number;
		catch_up?: boolean;
		action(
			pos: Vec3,
			node: NodeTable,
			activeObjectCount: number,
			activeObjectCountWider: number
		): void;
	}

	/** @noSelf **/ interface LBMDefinition {
		label: string;
		name: string;
		nodenames: string[];
		run_at_every_load: boolean;
		action(pos: Vec3, node: NodeTable, delta: number): void;
	}

	/** @noSelf **/ interface SchematicReadOptionYSlice {
		write_yslice_prob: SchematicReadOptionYSliceOption;
	}

	/** @noSelf **/ interface SchematicData {
		name: string;
		prob?: number;
		param1?: number;
		param2?: number;
		force_place?: boolean;
	}

	/** @noSelf **/ interface SchematicProbability {
		pos: Vec3;
		prob: number;
	}

	/** @noSelf **/ interface SchematicSliceProbability {
		ypos: number;
		prob: number;
	}

	/** @noSelf **/ interface SchematicDefinition {
		size: Vec3;
		data: SchematicData[];
		yslice_prob?: number[][];
	}

	/** @noSelf **/ interface HTTPrequestDefinition {
		url: string;
		timeout: number;
		method?: HTTPRequestMethod;
		data?: string | { string: string };
		user_agent?: string;
		extra_headers?: string[];
		multipart?: boolean;
		post_data?: string | { string: string };
	}

	/** @noSelf **/ interface HTTPRequestResult {
		completed: boolean;
		succeeded: boolean;
		timeout: boolean;
		code: number;
		data: string;
	}

	/** @noSelf **/ interface NoiseParams {
		offset?: number;
		scale?: number;
		spread?: Vec3;
		seed?: number;
		octaves?: number;
		// These two have the same effect.
		persistence?: number;
		persist?: number;
		lacunarity?: number;
		flags?: NoiseFlags;
	}

	/** @noSelf **/ interface OreDefinition {
		ore_type: OreType;
		ore: string;
		ore_param2?: number;
		wherein: string | string[];
		clust_scarcity?: number;
		clust_num_ores?: number;
		clust_size?: number;
		y_min: number;
		y_max: number;
		flags?: OreFlags;
		noise_threshold?: number;
		noise_params?: NoiseParams;
		biomes?: string[];
		column_height_min?: number;
		column_height_max?: number;
		column_midpoint_factor?: number;
		np_puff_top?: NoiseParams;
		np_puff_bottom?: NoiseParams;
		random_factor?: number;
		np_stratum_thickness?: NoiseParams;
		stratum_thickness?: number;
	}

	/** @noSelf **/ interface BiomeDefinition {
		name: string;
		node_dust?: string;
		node_top?: string;
		depth_top?: number;
		node_filler?: string;
		depth_filler?: number;
		node_stone?: string;
		node_water_top?: string;
		depth_water_top?: number;
		node_water?: string;
		node_river_water?: string;
		node_riverbed?: string;
		depth_riverbed?: number;
		node_cave_liquid?: string;
		node_dungeon?: string;
		node_dungeon_alt?: string;
		node_dungeon_stair?: string;
		y_max?: number;
		y_min?: number;
		max_pos?: Vec3;
		min_pos?: Vec3;
		vertical_blend?: number;
		heat_point?: number;
		humidity_point?: number;
	}

	/** @noSelf **/ interface DecorationDefinition {
		name: string;
		deco_type?: DecorationType;
		place_on?: string | string[];
		sidelen?: number;
		fill_ratio?: number;
		noise_params?: NoiseParams;
		biomes?: string[];
		y_min?: number;
		y_max?: number;
		spawn_by?: string;
		check_offset?: number;
		num_spawn_by?: number;
		flags?: DecorationFlags | { DecorationFlags: boolean } | string;
		decoration?: string | string[];
		height?: number;
		height_max?: number;
		param2?: number;
		param2_max?: number;
		place_offset_y?: number;
		schematic?: string | SchematicDefinition | number;
		replacements?: { string: string };
		rotation?: string;
	}

	/** @noSelf **/ interface CraftRecipeDefinition {
		type?: CraftRecipeType;
		output?: string;
		recipe?: string[][] | string[] | string;
		replacements?: string[];
		additional_wear?: number;
		cooktime?: number;
		burntime?: number;
	}

	/** @noSelf **/ interface CraftResultObject {
		item: ItemStackObject;
		time: number;
		replacements: ItemStackObject[];
	}

	/** @noSelf **/ interface CraftRecipeCheckDefinition {
		method: CraftCheckType;
		width: number;
		items: ItemStackObject[];
	}

	// This is what a recipe definition gets turned into in the engine.
	/** @noSelf **/ interface CraftRecipeObject {
		method?: CraftCheckType;
		width: number;
		items?: string[];
		output?: string;
	}

	/** @noSelf **/ interface ChatCommandDefinition {
		params: string;
		description: string;
		privs: Dictionary<string, boolean>;
		func(
			name: string,
			param: string
		): LuaMultiReturn<[boolean, string]> | void;
	}

	/** @noSelf **/ interface PrivilegeDefinition {
		description: string;
		give_to_singleplayer: boolean;
		give_to_admin: boolean;
		on_grant(name: string, granterName: string): void;
		on_revoke(name: string, revokerName: string): void;
	}

	/** @noSelf **/ interface AuthenticationHandlerDefinition {
		get_auth(name: string): void;
		create_auth(name: string, password: string): void;
		delete_auth(name: string): void;
		set_password(name: string, password: string): void;
		set_privileges(name: string, privileges: Map<any, any>): void; // ! fixme: this needs to be checked.
		reload(): void;
		record_login(name: string): void;
		iterate(): void;
	}

	/** @noSelf **/ interface HPChangeReasonDefinition {
		type: HPChangeReasonType;
		node?: string;
		node_pos?: Vec3;
		object?: ObjectRef;
		from?: string;
	}

	/** @noSelf **/ interface ActionDefinition {
		from_list: string;
		to_list: string;
		from_index: number;
		to_index: number;
		count: number;
		listname: string;
		index: number;
		stack: ItemStackObject;
	}

	/** @noSelf **/ interface CheatDefinition {
		type: CheatType;
	}

	type EmergeAreaCallback = (
		blockPos: Vec3,
		action: any,
		callsRemaining: number,
		param: any
	) => void; // todo: figure out what core.EMERGE_CANCELLED EVEN IS!

	/** @noSelf **/ interface BiomeDataDefinition {
		biome: number;
		heat: number;
		humidity: number;
	}

	/** @noSelf **/ interface MapGenSettingsDefinition {
		mgname: string;
		seed: number;
		chunksize: number;
		water_level: number;
		flags: string;
	}

	/** @noSelf **/ interface MetaData {
		fields: { string: any };
		inventory: { string: [string | ItemStackObject] };
	}

	function ItemStack(
		stringOrObject: ItemStackObject | string
	): ItemStackObject;
	function VoxelManip(_pos1: Vec3, _pos2: Vec3): VoxelManipObject;
	function VoxelArea(_min: Vec3, _max: Vec3): VoxelAreaObject;
	function Raycast(
		_pos1: Vec3,
		_pos2: Vec3,
		_object: boolean,
		_liquids: boolean
	): RaycastObject;
	function SecureRandom(): SecureRandomObject;
	function Settings(_: string): LuantiSettingsObject;
	function PcgRandom(seed: number, sequence: number[]): PcgRandomObject;
	function PerlinNoise(params: NoiseParams): PerlinNoiseObject;
	function PerlinNoiseMap(
		params: NoiseParams,
		size: Vec3
	): PerlinNoiseMapObject;
	function PseudoRandom(seed: number): PseudoRandomObject;
	function AreaStore(_: AreaStoreType): AreaStoreObject;

	namespace vector {
		function zero(): Vec3;
		function copy(vec: Vec3): Vec3;
		function from_string(s: string, init: string): Vec3;
		function to_string(vec: Vec3): string;
		function direction(vec1: Vec3, vec2: Vec3): Vec3;
		function distance(vec1: Vec3, vec2: Vec3): number;
		function length(vec: Vec3): number;
		function normalize(vec: Vec3): Vec3;
		function floor(vec: Vec3): Vec3;
		function round(vec: Vec3): Vec3;
		function apply(vec: Vec3, fun: (input: number) => number): Vec3;
		function combine(
			vec1: Vec3,
			vec2: Vec3,
			fun: (...any: any) => void
		): Vec3; //! fixme: test this
		function equals(vec1: Vec3, vec2: Vec3): boolean;
		function sort(vec1: Vec3, vec2: Vec3): [Vec3, Vec3];
		function angle(vec1: Vec3, vec2: Vec3): number;
		function dot(vec1: Vec3, vec2: Vec3): number;
		function cross(vec1: Vec3, vec2: Vec3): number;
		function check(vec: Vec3): boolean;
		function in_area(vec: Vec3, min: Vec3, max: Vec3): boolean;

		function add(vec: Vec3, scalarOrVec: Vec3 | number): Vec3;
		function subtract(vec: Vec3, scalarOrVec: Vec3 | number): Vec3;
		function multiply(vec: Vec3, scalarOrVec: Vec3 | number): Vec3;
		function divide(vec: Vec3, scalarOrVec: Vec3 | number): Vec3;

		function rotate(vec: Vec3, radians: number): Vec3;
		function rotate_around_axis(
			vec: Vec3,
			vec2: Vec3,
			radians: number
		): Vec3;
		function dir_to_rotation(vec: Vec3, up: Vec3): Vec3;

		// This is created in the utility module because new is a reserved keyword in TS.
		function create3d(
			x?: number | { x: number; y: number; z: number },
			y?: number,
			z?: number
		): Vec3;
		// Everything else is a bolt on created in the utility module.
		function create2d(x?: number, y?: number): Vec2;
		function random(
			minX: number,
			maxX: number,
			minY: number,
			maxY: number,
			minZ: number,
			maxZ: number
		): Vec3;
		function distance2d(vec1: Vec3, vec2: Vec3): number;
	}

	/** @noSelf **/ interface VoxelAreaInitializer {
		MinEdge: Vec3;
		MaxEdge: Vec3;
	}

	/** @noSelf **/ interface DetachedInventoryCallbacks {
		allow_move(
			inv: InvRef,
			fromList: string,
			fromIndex: number,
			toList: string,
			toIndex: number,
			count: number,
			player: ObjectRef
		): number;
		allow_put(
			inv: InvRef,
			listName: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		): number;
		allow_take(
			inv: InvRef,
			listName: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		): number;
		on_move(
			inv: InvRef,
			fromList: string,
			fromIndex: number,
			toList: string,
			toIndex: number,
			count: number,
			player: ObjectRef
		): void;
		on_put(
			inv: InvRef,
			listName: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		): void;
		on_take(
			inv: InvRef,
			listName: string,
			index: number,
			stack: ItemStackObject,
			player: ObjectRef
		): void;
	}

	/** @noSelf **/ interface NametagAttributes {
		text?: string;
		color?: RGBA;
		bgcolor?: RGBA;
	}

	/** @noSelf **/ interface BoneOverrideProperty {
		vec: Vec3;
		interpolation?: number;
		/** If set to false, it's relative to the animated property. */
		absolute?: boolean;
	}

	/** @noSelf **/ interface BoneOverride {
		position?: BoneOverrideProperty;
		rotation?: BoneOverrideProperty;
		scale?: BoneOverrideProperty;
	}

	/** @noSelf **/ type Dictionary<K extends string | number | symbol, V> = {
		[id in K]?: V;
	};

	/** @noSelf **/ interface PlayerControlObject
		extends Dictionary<string, boolean | number> {
		up: boolean;
		down: boolean;
		left: boolean;
		right: boolean;
		jump: boolean;
		aux1: boolean;
		sneak: boolean;
		dig: boolean;
		place: boolean;
		LMB: boolean;
		RMB: boolean;
		zoom: boolean;
		movement_x: number;
		movement_y: number;
	}

	/** @noSelf **/ interface PhysicsOverride {
		speed?: number;
		jump?: number;
		gravity?: number;
		speed_climb?: number;
		speed_crouch?: number;
		liquid_fluidity?: number;
		liquid_fluidity_smooth?: number;
		liquid_sink?: number;
		acceleration_default?: number;
		acceleration_air?: number;
		sneak?: boolean;
		sneak_glitch?: boolean;
		new_move?: boolean;
	}

	/** @noSelf **/ interface SkyParametersColor {
		day_sky: DynamicColorSpec;
		day_horizon: DynamicColorSpec;
		dawn_sky: DynamicColorSpec;
		dawn_horizon: DynamicColorSpec;
		nigh_sky: DynamicColorSpec;
		night_horizon: DynamicColorSpec;
		indoors: DynamicColorSpec;
		fog_sun_tint: DynamicColorSpec;
		fog_moon_tint: DynamicColorSpec;
		fog_tint_type: SkyParametersFogTintType;
	}

	/** @noSelf **/ interface SkyParametersFog {
		fog_distance: number;
		fog_start: number;
	}

	/** @noSelf **/ interface SkyParameters {
		base_color: DynamicColorSpec;
		body_orbit_tilt: number;
		type: SkyParametersType;
		textures: string[];
		clouds: boolean;
		sky_color: SkyParametersColor;
		fog: SkyParametersFog;
	}

	/** @noSelf **/ interface SunParameters {
		visible: boolean;
		texture: string;
		tonemap: string;
		sunrise: string;
		sunrise_visible: boolean;
		scale: number;
	}

	/** @noSelf **/ interface MoonParameters {
		visible: boolean;
		texture: string;
		tonemap: string;
		scale: number;
	}

	/** @noSelf **/ interface StarParameters {
		visible: boolean;
		day_opacity: number;
		count: number;
		star_color: DynamicColorSpec;
		scale: number;
	}

	/** @noSelf **/ interface CloudParameters {
		density: number;
		color: DynamicColorSpec;
		ambient: DynamicColorSpec;
		height: number;
		thickness: number;
		speed: Vec2;
	}

	/** @noSelf **/ interface LightShadowsSpec {
		intensity: number;
	}

	/** @noSelf **/ interface LightExposureSpec {
		luminance_min: number;
		luminance_max: number;
		exposure_correction: number;
		speed_dark_bright: number;
		speed_bright_dark: number;
		center_weight_power: number;
	}

	/** @noSelf **/ interface LightingDefinition {
		saturation?: number;
		shadows?: LightShadowsSpec;
		exposure?: LightExposureSpec;
	}

	type CollisionBox = Array<number>;

	/** @noSelf **/ interface ObjectProperties {
		hp_max?: number;
		breath_max?: number;
		zoom_fov?: number;
		eye_height?: number;
		physical?: boolean;
		wield_item?: string;
		collide_with_objects?: boolean;
		collisionbox?: CollisionBox;
		selectionbox?: number[];
		pointable?: boolean;
		visual?: EntityVisual;
		visual_size?: Vec3 | Vec2;
		mesh?: string;
		textures?: (string | TileDefinition)[] | TileDefinition;
		colors?: DynamicColorSpec[];
		use_texture_alpha?: boolean;
		spritediv?: Vec2;
		node?: NodeTable;
		initial_sprite_basepos?: Vec2;
		is_visible?: boolean;
		makes_footstep_sound?: boolean;
		automatic_rotate?: number;
		stepheight?: number;
		automatic_face_movement_dir?: number;
		automatic_face_movement_max_rotation_per_sec?: number;
		backface_culling?: boolean;
		glow?: number;
		nametag?: string;
		nametag_color?: ColorSpec;
		nametag_bgcolor?: ColorSpec;
		infotext?: string;
		static_save?: boolean;
		damage_texture_modifier?: string;
		shaded?: boolean;
		show_on_minimap?: boolean;
	}

	/** @noSelf **/ interface MinimapModes {
		type: MinimapType;
		label: string;
		size: number;
		texture: string;
		scale: number;
	}

	/** @noSelf **/ interface HudFlags {
		hotbar?: boolean;
		healthbar?: boolean;
		crosshair?: boolean;
		wielditem?: boolean;
		breathbar?: boolean;
		minimap?: boolean;
		minimap_radar?: boolean;
		basic_debug?: boolean;
	}

	/** @noSelf **/ interface HudDefinition {
		type: HudElementType;
		position?: Vec2;
		name?: string;
		scale?: Vec2;
		text?: string;
		text2?: string;
		number?: number;
		item?: number;
		direction?: number;
		alignment?: Vec2;
		offset?: Vec2;
		world_pos?: Vec3;
		size?: Vec2;
		z_index?: number;
		style?: number;
	}

	/** @noSelf **/ interface TileAnimationDefinition {
		type?: TileAnimationType;
		aspect_w?: number;
		aspect_h?: number;
		length?: number;
		frames_w?: number;
		frames_h?: number;
		frame_length?: number;
	}

	/** @noSelf **/ interface Rollback {
		actor: string;
		pos: Vec3;
		time: number;
		oldnode: string;
		newnode: string;
	}

	/** @noSelf **/ interface DynamicAddMediaOptions {
		filepath: string;
		to_player?: string;
		ephemeral?: boolean;
	}

	/** @noSelf **/ interface ParticleBounceDefinition {
		min: number;
		max: number;
		bias: number;
	}

	/** @noSelf **/ interface ParticleDefinition {
		pos: Vec3;
		velocity: Vec3;
		acceleration: Vec3;
		expirationtime: number;
		size: number;
		collisiondetection?: boolean;
		collision_removal?: boolean;
		object_collision?: boolean;
		vertical?: boolean;
		texture: string;
		playername?: string;
		animation?: TileAnimationDefinition;
		glow?: number;
		node?: NodeTable;
		node_tile?: NodeSoundSpec;
		drag?: Vec3;
		bounce?: ParticleBounceDefinition;
	}

	/** @noSelf **/ interface ParticleSpawnerTweenDefinition
		extends Array<number | ParticleSpawnerRangeDefinition> {
		// {number | ParticleSpawnerRangeDefinition}
		style: ParticleSpawnerTweenStyle;
		reps: number;
		start: number;
	}

	/** @noSelf **/ interface ParticleSpawnerRangeDefinition {
		min: Vec3;
		max: Vec3;
		bias: number;
		pos_tween: ParticleSpawnerTweenDefinition;
		x: number;
		y: number;
		z: number;
	}

	type ParticleSpawnerTextureScaleTween = Array<Vec2>;

	/** @noSelf **/ interface ParticleSpawnerTextureDefinition {
		name: string;
		alpha: number;
		alpha_tween: number[];
		scale: number | Vec2;
		scale_tween: ParticleSpawnerTextureScaleTween;
		blend: ParticleSpawnerTextureBlend;
		animation: TileAnimationDefinition;
	}

	/** @noSelf **/ interface TexturePoolComponentTweenDefinition
		extends Array<number> {
		style: ParticleSpawnerTweenStyle;
		reps: number;
	}

	/** @noSelf **/ interface TexturePoolComponentDefinition {
		name: string;
		fade: TexturePoolComponentFade;
		alpha: number;
		scale: number;
		animation: TileAnimationDefinition;
		alpha_tween: TexturePoolComponentTweenDefinition;
	}

	type ParticleSpawnerTexturePoolDefinition = Array<
		string | TexturePoolComponentDefinition
	>;

	/** @noSelf **/ interface ParticleSpawnerAttractionDefinition {
		kind: ParticleSpawnerAttractionType;
		strength: Vec2;
		origin: Vec3;
		direction: Vec3;
		origin_attached: ObjectRef;
		direction_attached: ObjectRef;
		die_on_contact: boolean;
	}

	/** @noSelf **/ interface ParticleSpawnerDefinition {
		collision_removal?: boolean;
		glow?: number;
		attached?: ObjectRef;
		object_collision?: boolean;
		// End 5.6.0 def.
		amount?: number;
		time?: number;
		maxpos?: Vec3;
		minpos?: Vec3;
		minvel?: Vec3;
		maxvel?: Vec3;
		minacc?: Vec3;
		maxacc?: Vec3;
		minexptime?: number;
		maxexptime?: number;
		minsize?: number;
		maxsize?: number;
		collisiondetection?: boolean;
		vertical?: boolean;
		node?: { name: string; param2?: number };
		pos?: number | ParticleSpawnerRangeDefinition;
		vel?: Vec3RangeBias;
		acc?: Vec3RangeBias;
		jitter?: Vec3RangeBias;
		drag?: Vec3RangeBias;
		bounce?: Vec3RangeBias;
		exptime?: Vec2;
		attract?: ParticleSpawnerAttractionDefinition;
		radius?: Vec3RangeBias;
		pos_tween?: ParticleSpawnerTweenDefinition;
		texture?: string | ParticleSpawnerTextureDefinition;
		texpool?: ParticleSpawnerTexturePoolDefinition;
	}

	/** @noSelf **/ interface AreaStoreArea {
		min: Vec3;
		max: Vec3;
		data: string;
	}

	/** @noSelf **/ interface AreaStoreCacheDefinition {
		enabled: boolean;
		block_radius: number;
		limit: number;
	}

	/** @noSelf **/ interface Vec3RangeBias {
		min: Vec3;
		max: Vec3;
		bias: Vec3;
	}

	/** @noSelf **/ interface RGBA {
		r: number;
		g: number;
		b: number;
		a: number;
	}

	/** @noSelf **/ interface DigParamsReturn {
		diggable: boolean;
		time: number;
		wear: number;
		groups: string[];
		tool_capabilities: ToolCapabilities;
	}

	/** @noSelf **/ interface HitParamsReturn {
		hp: number;
		wear: number;
		groups: string[];
		tool_capabilities: ToolCapabilities;
		time_from_last_punch: number;
	}

	function dump(object: any, name?: string, dumped?: any[]): string;

	function dump2(object: any, dumped?: any[]): string;

	// You can just bolt onto namespaces apparently!
	/** @noSelf **/ namespace math {
		function hypot(x: number, y: number): number;
		function sign(x: number, tolerance: number): number;
		function factorial(x: number): number;
		function round(x: number): number;
		// Clamp is a bolt on created in.
		function clamp(min: number, max: number, input: number): number;
		// So is this.
		function cosFromSin(sin: number, angle: number): number;
		// And this (required to D/Java style float to int truncation)
		function truncate(floating: number): number;
		function fma(x: number, y: number, z: number): number;
		function invsqrt(r: number): number;
		function safeAsin(r: number): number;
	}

	/** @noSelf **/ namespace string {
		function split(
			str: string,
			separator: string,
			includeEmpty: box,
			maxSplits: number,
			sepIsPattern: boolean
		): string;
		function trim(str: string): string;
	}
	/** @noSelf **/ namespace table {
		function copy(table: LuaTable): LuaTable;
		function indexof(list: LuaTable, val: any): number;
		function insert_all(table: LuaTable, otherTable: LuaTable): LuaTable;
		function key_value_swap(t: LuaTable): LuaTable;
		function shuffle(
			table: LuaTable,
			from: number,
			to: number,
			randomFunc: () => number
		): LuaTable;
	}

	/** @noSelf **/ interface HTTPApi {
		fetch(
			req: HTTPrequestDefinition,
			callback: (res: HTTPRequestResult) => void
		): void;
		fetch_async(req: HTTPrequestDefinition): number;
		fetch_async_get(handle: number): HTTPRequestResult;
	}
}

//? Classes. (Objects with implicit self [this]) ===============================================

declare global {
	interface ModChannel {
		// Ensure you set mod_channel to nil after that to free Lua resources.
		leave(): void;
		is_writeable(): boolean;
		// Message size is limited to 65535 characters by protocol.
		send_all(message: string): void;
	}

	interface MetaRef {
		set_tool_capabilities(toolCapabilities: ToolCapabilities): void;
		contains(key: string): boolean;
		get(key: string): string;
		set_string(key: string, value: string): void;
		get_string(key: string): string;
		set_int(key: string, value: number): void;
		get_int(key: string): number;
		set_float(key: string, value: number): void;
		get_float(key: string): number;
		get_keys(): string[];
		to_table(): MetaData | null;
		from_table(data: MetaData): boolean;
		equals(other: MetaRef): boolean;
		// fixme: USE INHERITANCE! <- inherit from what?
		// node
		get_inventory(): InvRef;
		mark_as_private(nameOrArray: string | string[]): void;
		// timer
		set(timeOut: number, elapsed: number): void;
		start(timeOut: number): void;
		stop(): void;
		get_timeout(): number;
		get_elapsed(): number;
		is_started(): boolean;
	}

	interface InvRef {
		is_empty(listName: string): boolean;
		get_size(listName: string): number;
		set_size(listName: string, size: number): boolean;
		get_width(listName: string): number;
		set_width(listName: string, size: number): void;
		get_stack(listName: string, i: number): ItemStackObject;
		set_stack(
			listName: string,
			i: number,
			stack: ItemStackObject | string
		): void;
		get_list(listName: string): ItemStackObject[];
		set_list(listName: string, list: ItemStackObject[]): void;
		get_lists(): Dictionary<string, ItemStackObject[]>;
		set_lists(lists: ItemStackObject[]): void;
		add_item(
			listName: string,
			stack: ItemStackObject | string
		): ItemStackObject;
		room_for_item(
			listName: string,
			stack: ItemStackObject | string
		): boolean;
		contains_item(
			listName: string,
			stack: ItemStackObject | string,
			matchMeta?: boolean
		): boolean;
		remove_item(
			listName: string,
			stack: ItemStackObject | string
		): ItemStackObject[];
		get_location(): InvRefLocation;
	}

	interface ItemStackObject {
		// name: string;
		// count: number
		// wear: number;
		// metadata: string;

		is_empty(): boolean;
		get_name(): string;
		set_name(name: string): boolean;
		get_count(): number;
		set_count(count: number): boolean;
		get_wear(): number;
		set_wear(wear: number): boolean;
		get_meta(): MetaRef;
		get_description(): string;
		get_short_description(): string;
		clear(): void;
		replace(item: ItemStackObject | string): void;
		to_string(): string;
		to_table(): any[];
		get_stack_max(): number;
		get_free_space(): number;
		is_known(): boolean;
		get_definition(): ItemDefinition;
		get_tool_capabilities(): ToolCapabilities;
		add_wear(wear: number): void;
		add_wear_by_uses(maxUses: number): void;
		add_item(item: ItemStackObject): ItemStackObject;
		item_fits(item: ItemStackObject): boolean;
		take_item(n?: number): ItemStackObject;
		peek_item(n: number): ItemStackObject;
		equals(other: ItemStackObject): boolean;
	}

	interface VoxelManipObject {
		read_from_map(pos1: Vec3, pos2: Vec3): [Vec3, Vec3];
		write_to_map(light: boolean): void;
		get_node_at(position: Vec3): MapNode;
		set_node_at(position: Vec3, node: MapNode): void;
		get_data(buffer?: number[]): number[];
		set_data(buffer?: number[]): number[];
		set_lighting(light: number, p1: Vec3, p2: Vec3): void;
		get_light_data(buffer: number[]): number[];
		set_light_data(lightData: number[]): void;
		get_param2_data(buffer: number[]): number[];
		set_param2_data(param2Data: number[]): void;
		calc_lighting(p1: Vec3, p2: Vec3, propagateShadows: boolean): void;
		update_liquids(): void;
		was_modified(): boolean;
		get_emerged_area(): [Vec3, Vec3];
	}

	interface VoxelAreaObject {
		ystride: number;
		zstride: number;
		new (init: VoxelAreaInitializer): VoxelAreaObject;
		getExtent(): Vec3;
		index(x: number, y: number, z: number): number;
		indexp(p: Vec3): number;
		position(i: number): Vec3;
		contains(x: number, y: number, z: number): boolean;
		containsp(p: Vec3): boolean;
		containsi(i: number): boolean;
		iter(
			minX: number,
			minY: number,
			minZ: number,
			maxX: number,
			maxY: number,
			maxZ: number
		): Iterator<number>;
		iterp(minp: Vec3, maxp: Vec3): Iterator<number>;
	}

	interface RaycastObject extends LuaIterable<PointedThing> {
		next(): PointedThing | null;
	}

	interface SecureRandomObject {
		next_bytes(count: number): string;
	}

	interface AreaStoreObject {
		get_area(
			id: number,
			includeCorners: boolean,
			includeData: boolean
		): Array<AreaStoreArea | boolean> | null;
		get_areas_for_pos(
			pos: Vec3,
			includeCorners: boolean,
			includeData: boolean
		): Array<AreaStoreArea | boolean> | null;
		get_areas_in_area(
			corner1: Vec3,
			corner2: Vec3,
			acceptOverlap: boolean,
			includeCorners: boolean,
			includeData: boolean
		): Array<AreaStoreArea | boolean> | null;
		insert_area(
			corner1: Vec3,
			corner2: Vec3,
			data: string,
			id: number
		): number;
		reserve(count: number): void;
		remove_area(id: number): boolean;
		set_cache_params(params: AreaStoreCacheDefinition): void;
		to_string(): string;
		to_file(fileName: string): void;
		from_string(str: string): [boolean, string] | null;
		from_file(fileName: string): [boolean, string] | null;
	}

	interface LuantiSettingsObject {
		get(key: string): any;
		get_bool(key: string, defaul?: boolean): boolean | null;
		get_np_group(key: string): NoiseParams;
		get_flags(key: string): { string: boolean };
		set(key: string, value: string): void;
		set_bool(key: string, value: boolean): void;
		set_np_group(key: string, value: NoiseParams): void;
		remove(key: string): boolean;
		get_names(): string[];
		has(key: string): boolean;
		write(): boolean;
		to_table(): Map<string, any>;
	}

	interface LuaEntity {
		__index?: LuaEntity;
		initial_properties?: ObjectProperties;
		name: string;
		object: ObjectRef;
		on_activate?(staticData: string, delta: number): void;
		on_deactivate?(removal: boolean): void;
		on_step?(delta: number, moveResult: MoveResult | null): void;
		on_punch?(
			puncher: ObjectRef,
			timeFromLastPunch: number,
			toolCapabilities: ToolCapabilities,
			dir: Vec3,
			damage: number
		): void;
		on_death?(killer: ObjectRef): void;
		on_rightclick?(clicker: ObjectRef): void;
		on_attach_child?(child: ObjectRef): void;
		on_detach_child?(child: ObjectRef): void;
		on_detach?(parent: ObjectRef): void;
		get_staticdata?(): string;
	}

	interface ObjectRef {
		is_valid(): boolean;
		get_pos(): Vec3;
		set_pos(position: Vec3): void;
		get_velocity(): Vec3;
		add_velocity(velocity: Vec3): void;
		move_to(newPos: Vec3, continuous?: boolean): void;
		punch(
			puncher: ObjectRef,
			timeFromLastPunch: number,
			toolCapabilities: ToolCapabilities,
			dir?: Vec3
		): void;
		right_click(clicker: ObjectRef): void;
		get_hp(): number;
		set_hp(hp: number, reason?: HPChangeReasonDefinition): void;
		get_inventory(): InvRef | null;
		get_wield_list(): string;
		get_wield_index(): number;
		get_wielded_item(): ItemStackObject;
		set_wielded_item(item: ItemStackObject): boolean;
		get_armor_groups(): { string: number };
		set_armor_groups(groups: Dictionary<string, number>): void;
		get_animation(): Array<Vec2 | number>;
		set_animation(
			frameRange: Vec2,
			frameSpeed: number,
			frameBlend: number,
			loop?: boolean
		): void;
		set_animation_frame_speed(speed: number): void;
		set_attach(
			parent: ObjectRef,
			bone: string,
			position: Vec3,
			rotation: Vec3,
			forcedVisible?: boolean
		): void;
		get_attach(): LuaMultiReturn<
			[ObjectRef?, string?, Vec3?, Vec3?, boolean?]
		>;
		get_children(): ObjectRef[];
		set_detach(): void;
		set_bone_override(bone: string, property: BoneOverride | null): void;
		get_bone_override(bone: string): BoneOverride;
		get_bone_overrides(): Dictionary<string, BoneOverride>;
		set_properties(objectPropertiesTable: ObjectProperties): void;
		get_properties(): ObjectProperties;
		is_player(): boolean;
		get_nametag_attributes(): NametagAttributes;
		set_nametag_attributes(attributes: NametagAttributes): void;
		remove(): void;
		set_velocity(velocity: Vec3): void;
		set_acceleration(acceleration: Vec3): void;
		get_acceleration(): Vec3;
		set_rotation(rotation: Vec3): void;
		get_rotation(): Vec3;
		set_yaw(yaw: number): void;
		get_yaw(): number;
		set_texture_mod(mod: string): void;
		get_texture_mod(): string;
		set_sprite(
			startFrame: Vec2,
			numberOfFrames: number,
			frameLength: number,
			selectXByCamera: boolean
		): void;
		name: string;
		// Returns the object's associated luaentity table, if there is one.
		// Otherwise returns nil (e.g. for players).
		get_luaentity(): LuaEntity | null;
		//! NOTE:
		//! From what I read in the api.md, it seems like these are just all no-ops for non-players.
		//! This can be broken out into a different interface that extends if this causes too many problems.
		//! IE: PlayerObjectRef extends ObjectRef.
		get_player_name(): string;
		get_look_dir(): Vec3;
		get_look_vertical(): number;
		get_look_horizontal(): number;
		set_look_vertical(radians: number): void;
		set_look_horizontal(radians: number): void;
		get_look_pitch(): number;
		get_look_yaw(): number;
		set_look_pitch(radians: number): void;
		set_look_yaw(radians: number): void;
		get_breath(): number;
		set_breath(value: number): void;
		set_fov(
			fov: number,
			isMultiplier: boolean,
			transitionTime: number
		): void;
		get_fov(): number;
		get_meta(): MetaRef;
		set_inventory_formspec(formSpec: string): void;
		get_inventory_formspec(): string;
		set_formspec_prepend(formSpec: string): void;
		get_formspec_prepend(): string;
		get_player_control(): PlayerControlObject;
		get_player_control_bits(): number;
		set_physics_override(override: PhysicsOverride): void;
		get_physics_override(): PhysicsOverride;
		// returns ID number on success
		hud_add(definition: HudDefinition): number | null;
		hud_remove(id: number): void;
		// stat supports the same keys as in the hud definition table except for "type" (or the deprecated "hud_elem_type").
		hud_change(id: number, stat: keyof HudDefinition, value: any): void;
		hud_get(id: number): HudDefinition;
		hud_set_flags(flags: HudFlags): void;
		hud_get_flags(): HudFlags;
		hud_set_hotbar_itemcount(count: number): void;
		hud_get_hotbar_itemcount(): number;
		hud_set_hotbar_image(textureName: string): void;
		hud_get_hotbar_image(): string;
		hud_set_hotbar_selected_image(textureName: string): void;
		hud_get_hotbar_selected_image(): string;
		set_minimap_modes(mode: MinimapModes, selectedMode: number): void;
		set_sky(parameters: SkyParameters): void;
		get_sky(asTable: true): SkyParameters;
		set_sun(parameters: SunParameters): void;
		get_sun(): SunParameters;
		set_moon(parameters: MoonParameters): void;
		get_moon(): MoonParameters;
		set_stars(parameters: StarParameters): void;
		get_stars(): StarParameters;
		set_clouds(parameters: CloudParameters): void;
		get_clouds(): CloudParameters;
		override_day_night_ratio(ratio: number | null): void;
		get_day_night_ratio(): number | null;
		set_local_animation(
			idle: Vec2,
			walk: Vec2,
			dig: Vec2,
			walkWhileDig: Vec2,
			frameSpeed: number
		): void;
		get_local_animation(): [Vec2, Vec2, Vec2, Vec2, number];
		set_eye_offset(
			firstPerson: Vec3,
			thirdPersonBack: Vec3,
			thirdPersonFront?: Vec3
		): void;
		get_eye_offset(): [Vec3, Vec3, Vec3];
		send_mapblock(blockPos: Vec3): boolean;
		set_lighting(definition: LightingDefinition): void;
		get_lighting(): LightingDefinition;
		respawn(): void;
	}

	interface PcgRandomObject {
		next(): number;
		next(min: number, max: number): number;
		rand_normal_dist(min: number, max: number, trials: number): number;
	}

	interface PerlinNoiseObject {
		get_2d(position: Vec2): number;
		get_3d(position: Vec3): number;
	}

	interface PerlinNoiseMapObject {
		get_2d_map(pos: Vec2): number[][];
		get_3d_map(pos: Vec3): number[][][];
		get_2d_map_flat(pos: Vec2, buffer: number[]): number[];
		get_3d_map_flat(pos: Vec3, buffer: number[]): number[];
		calc_2d_map(pos: Vec2): void;
		calc_3d_map(pos: Vec3): void;
		get_map_slice(
			sliceOffset: Vec3,
			sliceSize: Vec3,
			buffer: number[]
		): number[];
	}

	interface PseudoRandomObject {
		next(): number;
		next(min: number, max: number): number;
	}

	interface Job {
		cancel(): void;
	}

	interface Vec2 {
		x: number;
		y: number;
	}

	interface Vec3 extends Vec2 {
		__eq(other: Vec3): boolean;
		__unm(): Vec3;
		__add(other: Vec3): Vec3;
		__sub(other: Vec3): Vec3;
		__mul(other: Vec3): Vec3;
		__div(other: Vec3): Vec3;

		z: number;
	}

	interface NodeTimerObject {
		set(timeOut: number, elapsed: number): void;
		start(timeOut: number): void;
		stop(): void;
		get_timeout(): number;
		get_elapsed(): number;
		is_started(): boolean;
	}

	interface Translator {
		__call(...string: string[]): string;
	}
}

//! Enums below this. =========================================================================

/** @noSelf **/
declare global {
	enum PointedThingType {
		node,
		object,
	}

	enum InputKeys {
		up = "up",
		down = "down",
		left = "left",
		right = "right",
		jump = "jump",
		aux1 = "aux1",
		sneak = "sneak",
		dig = "dig",
		place = "place",
		LMB = "LMB",
		RMB = "RMB",
		zoom = "zoom",
	}

	enum SchematicRotation {
		zero,
		ninety,
		oneEighty,
		twoSeventy,
		random,
	}

	enum SchematicPlacementFlag {
		place_center_x,
		place_center_y,
		place_center_z,
	}

	enum SchematicFormat {
		mts,
		lua,
	}

	enum SchematicSerializationOption {
		lua_use_comments,
		lua_num_indent_spaces,
	}

	enum SchematicReadOptionYSliceOption {
		none,
		low,
		all,
	}

	enum HTTPRequestMethod {
		GET,
		POST,
		PUT,
		DELETE,
	}

	enum OreType {
		scatter,
		sheet,
		puff,
		blob,
		vein,
		stratum,
	}

	enum OreFlags {
		puff_cliffs,
		puff_additive_composition,
	}

	enum NoiseFlags {
		defaults,
		eased,
		absvalue,
	}

	enum DecorationType {
		simple,
		schematic,
	}

	enum DecorationFlags {
		liquid_surface,
		force_placement,
		all_floors,
		all_ceilings,
		place_center_x,
		place_center_y,
		place_center_z,
	}

	enum ParamType1 {
		light,
		none,
	}

	enum ParamType2 {
		flowingliquid,
		wallmounted,
		facedir,
		fourdir,
		leveled,
		degrotate,
		meshoptions,
		color,
		colorfacedir,
		color4dir,
		colorwallmounted,
		glasslikeliquidlevel,
		colordegrotate,
		"4dir",
		none,
	}

	enum Drawtype {
		normal,
		airlike,
		liquid,
		flowingliquid,
		glasslike,
		glasslike_framed,
		glasslike_framed_optional,
		allfaces,
		allfaces_optional,
		torchlike,
		signlike,
		plantlike,
		firelike,
		fencelike,
		raillike,
		nodebox,
		mesh,
		plantlike_rooted,
	}

	enum Nodeboxtype {
		regular,
		fixed,
		wallmounted,
		connected,
	}

	enum TextureAlpha {
		opaque,
		clip,
		blend,
	}

	enum LogLevel {
		none,
		error,
		warning,
		action,
		info,
		verbose,
	}

	enum CraftRecipeType {
		shapeless,
		toolrepair,
		cooking,
		fuel,
	}

	enum LiquidType {
		none,
		source,
		flowing,
	}

	enum NodeBoxConnections {
		top,
		bottom,
		front,
		left,
		back,
		right,
	}

	enum CraftCheckType {
		normal,
		cooking,
		fuel,
	}

	enum HPChangeReasonType {
		set_hp,
		punch,
		fall,
		node_damage,
		drown,
		respawn,
	}

	enum CheatType {
		moved_too_fast,
		interacted_too_far,
		interacted_with_self,
		interacted_while_dead,
		finished_unknown_dig,
		dug_unbreakable,
		dug_too_fast,
	}

	enum ClearObjectsOptions {
		full,
		quick,
	}

	enum GenNotifyFlags {
		dungeon,
		temple,
		cave_begin,
		cave_end,
		large_cave_begin,
		large_cave_end,
		decoration,
	}

	enum SearchAlgorithm {
		aStarNoprefetch,
		aStar,
		dijkstra,
	}

	enum SkyParametersType {
		regular,
		skybox,
		plain,
	}

	enum SkyParametersFogTintType {
		custom,
		default,
	}

	enum MinimapType {
		off,
		surface,
		radar,
		texture,
	}

	enum HudElementType {
		image,
		text,
		statbar,
		inventory,
		waypoint,
		image_waypoint,
		compass,
		minimap,
	}

	enum HudReplaceBuiltinOption {
		breath,
		health,
	}

	enum ParseRelativeNumberArgument {
		number,
		relativeToPlus,
		relativeTo,
	}

	enum CompressionMethod {
		deflate,
		zstd,
	}

	enum RotateAndPlaceOrientationFlag {
		invert_wall,
		force_wall,
		force_ceiling,
		force_floor,
		force_facedir,
	}

	enum BlockStatusCondition {
		unknown,
		emerging,
		loaded,
		active,
	}

	enum TileAnimationType {
		vertical_frames,
		sheet_2d,
	}

	enum ParticleSpawnerTweenStyle {
		fwd,
		rev,
		pulse,
		flicker,
	}

	enum ParticleSpawnerTextureBlend {
		alpha,
		add,
		screen,
		sub,
	}

	enum ParticleSpawnerAttractionType {
		none,
		point,
		line,
		plane,
	}

	enum AreaStoreType {
		libSpatial,
	}

	enum TexturePoolComponentFade {
		in,
		out,
	}

	enum EntityVisual {
		cube,
		sprite,
		upright_sprite,
		mesh,
		wielditem,
		item,
	}

	enum ToolType {
		pickaxe,
		shovel,
		axe,
		hoe,
		sword,
		shears,
	}

	enum BlockType {
		break_instant,
		soil,
		wood,
		leaf,
		stone,
		metal,
		glass,
		wool,
		planks,
		tree,
		sand,
		lava_cooling,
		liquid,
		water,
		attached_node,
	}

	enum CraftingBlockType {
		soil,
		wood,
		leaf,
		stone,
		metal,
		glass,
		wool,
		planks,
		tree,
		sand,
	}

	enum DamageGroup {
		flesh,
		metal,
		bone,
	}
}
