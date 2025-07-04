namespace book {
	// This is the gui for un-inked books.
	function open_book_gui(itemstack: ItemStackObject, user: ObjectRef): void {
		const name: string = user.get_player_name();
		core.sound_play("book_open", { object: user });
		const meta: MetaRef = itemstack.get_meta();
		let book_text: string = meta.get_string("book.book_text");
		if (book_text == "") {
			book_text = "Text here";
		}
		let book_title: string = meta.get_string("book.book_title");
		if (book_title == "") {
			book_title = "Title here";
		}
		let book_writing_formspec: string =
			"size[9,8.75]" +
			"background[-0.19,-0.25;9.41,9.49;gui_hb_bg.png]" +
			"style[book.book_text,book.book_title;textcolor=black;border=false;noclip=false]" +
			"textarea[0.3,0;9,0.5;book.book_title;;" +
			book_title +
			"]" +
			"textarea[0.3,0.3;9,9;book.book_text;;" +
			book_text +
			"]" +
			"button[-0.2,8.3;1,1;book.book_write;write]" +
			"button[8.25,8.3;1,1;book.book_ink;ink  ]";
		core.show_formspec(name, "book.book_gui", book_writing_formspec);
	}

	// This is the gui for permenantly written books.
	function open_book_inked_gui(
		itemstack: ItemStackObject,
		user: ObjectRef
	): void {
		const name: string = user.get_player_name();
		core.sound_play("book_open", { object: user });
		const meta: MetaRef = itemstack.get_meta();
		const book_text: string = meta.get_string("book.book_text");
		const book_title: string = meta.get_string("book.book_title");
		let book_writing_formspec =
			"size[9,8.75]" +
			"background[-0.19,-0.25;9.41,9.49;gui_hb_bg.png]" +
			"style_type[textarea;textcolor=black;border=false;noclip=false]" +
			"textarea[0.3,0;9,0.5;;;" +
			book_title +
			"]" +
			"textarea[0.3,0.3;9,9;;;" +
			book_text +
			"]" +
			"button_exit[4,8.3;1,1;book.book_close;close]";
		core.show_formspec(name, "book.book_gui", book_writing_formspec);
	}

	// Handle the book gui.
	core.register_on_player_receive_fields(
		(
			player: ObjectRef,
			formname: string,
			fields: Dictionary<string, any>
		) => {
			if (formname != "book.book_gui") {
				return;
			}
			if (
				fields["book.book_write"] != null &&
				fields["book.book_text"] != null &&
				fields["book.book_text"] != null
			) {
				const itemstack: ItemStackObject =
					ItemStack("crafter_book:book");
				const meta: MetaRef = itemstack.get_meta();
				meta.set_string("book.book_text", fields["book.book_text"]);
				meta.set_string("book.book_title", fields["book.book_title"]);
				meta.set_string("description", fields["book.book_title"]);
				player.set_wielded_item(itemstack);
				core.close_formspec(player.get_player_name(), "book.book_gui");
				core.sound_play("book_write", { object: player });
			} else if (
				fields["book.book_ink"] != null &&
				fields["book.book_text"] != null &&
				fields["book.book_text"] != null
			) {
				const itemstack: ItemStackObject = ItemStack(
					"crafter_book:book_written"
				);
				const meta: MetaRef = itemstack.get_meta();
				meta.set_string("book.book_text", fields["book.book_text"]);
				meta.set_string("book.book_title", fields["book.book_title"]);
				meta.set_string("description", fields["book.book_title"]);
				player.set_wielded_item(itemstack);
				core.close_formspec(player.get_player_name(), "book.book_gui");
				core.sound_play("book_close", { object: player });
			} else if (fields["book.book_close"] != null) {
				core.sound_play("book_close", { object: player });
			}
		}
	);
	// This is the book item.
	core.register_craftitem("crafter_book:book", {
		description: "Book",
		groups: { book: 1, written: 0 },
		stack_max: 1,
		inventory_image: "book.png",
		on_place: (
			itemstack: ItemStackObject,
			user: ObjectRef,
			pointed_thing: PointedThing
		) => {
			if (
				pointed_thing.type != PointedThingType.node ||
				pointed_thing.under == null
			) {
				return;
			}

			const sneak: boolean = user.get_player_control().sneak;
			const noddef: NodeDefinition | undefined =
				core.registered_nodes[core.get_node(pointed_thing.under).name];
			if (!sneak && noddef?.on_rightclick) {
				core.item_place(itemstack, user, pointed_thing);
				return;
			}
			// todo: make books placable on the ground.
			// print("make books placable on the ground");
			open_book_gui(itemstack, user);
		},
		on_secondary_use: (
			itemstack: ItemStackObject,
			user: ObjectRef,
			pointed_thing: PointedThing
		) => {
			open_book_gui(itemstack, user);
		},
	});

	// Permenantly written books.
	core.register_craftitem("crafter_book:book_written", {
		description: "Book",
		groups: { book: 1, written: 1 },
		stack_max: 1,
		inventory_image: "book_written.png",
		on_place: (itemstack, user, pointed_thing) => {
			if (
				pointed_thing.type != PointedThingType.node ||
				pointed_thing.under == null
			) {
				return;
			}

			const sneak: boolean = user.get_player_control().sneak;
			const noddef: NodeDefinition | undefined =
				core.registered_nodes[core.get_node(pointed_thing.under).name];
			if (!sneak && noddef?.on_rightclick) {
				core.item_place(itemstack, user, pointed_thing);
				return;
			}
			// todo: make books placable on the ground.
			//print("make books placable on the ground")
			open_book_inked_gui(itemstack, user);
		},
		on_secondary_use: (
			itemstack: ItemStackObject,
			user: ObjectRef,
			pointed_thing: PointedThing
		) => {
			open_book_inked_gui(itemstack, user);
		},
	});

	core.register_craft({
		output: "crafter_book:book",
		recipe: [
			["crafter:wood", "crafter:wood", "crafter:wood"],
			["crafter:paper", "crafter:paper", "crafter:paper"],
			["crafter:wood", "crafter:wood", "crafter:wood"],
		],
	});
}
