namespace utility {
	/** Metadata wrapper for type safety.
	 *
	 * Can only have keys of type:
	 * - string
	 * - number
	 * - boolean
	 */
	export class CrafterMeta {
		private meta: MetaRef;

		constructor(pos: Vec3) {
			this.meta = core.get_meta(pos);
		}

		read<T extends CrafterMeta>(): T {
			for (const [key, value] of Object.entries(this)) {
				if (key == "meta") {
					continue;
				}

				const t = typeof value;

				// Backups provided in case the API glitches out.
				if (t == "number") {
					(this as Dictionary<string, any>)[key] =
						this.meta.get_float(key) || 0;
				} else if (t == "boolean") {
					(this as Dictionary<string, any>)[key] =
						(this.meta.get_int(key) || 0) > 0;
				} else if (t == "string") {
					(this as Dictionary<string, any>)[key] =
						this.meta.get_string(key) || "";
				} else {
					throw new Error(
						`Type ${t} is not accessible in the minetest api`
					);
				}
			}

			return this as unknown as T;
		}

		write() {
			for (const [key, value] of Object.entries(this)) {
				if (key == "meta") {
					continue;
				}

				const t = typeof value;

				// Backups provided in case the API glitches out.
				if (t == "number") {
					(this as Dictionary<string, any>)[key] =
						this.meta.set_float(key, value);
				} else if (t == "boolean") {
					(this as Dictionary<string, any>)[key] = this.meta.set_int(
						key,
						value ? 1 : 0
					);
				} else if (t == "string") {
					(this as Dictionary<string, any>)[key] =
						this.meta.set_string(key, value);
				} else {
					throw new Error(
						`Type ${t} is not accessible in the minetest api`
					);
				}
			}
		}
	}

	/**
	 * Get a type safe metadata reference at a position in the world.
	 * @param pos The position in the world where the metadata is.
	 * @param clazz The advanced metadata class to encapsulate the components.
	 * @returns An instance of the metadata clazz.
	 */
	// export function getMeta<T extends CrafterMeta>(
	// 	pos: Vec3,
	// 	clazz: new (p: Vec3) => T
	// ): T {
	// 	const data = new clazz(pos);
	// 	data.read();
	// 	return data;
	// }
}
