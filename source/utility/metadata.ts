namespace utility {
	/** Metadata wrapper for type safety.
	 *
	 * Can only have keys of type:
	 * - string
	 * - number
	 * - boolean
	 */
	export class CrafterMeta
		implements
			Dictionary<any, string | number | boolean | MetaRef | (() => any)>
	{
		[x: string]:
			| string
			| number
			| boolean
			| MetaRef
			| (() => any)
			| undefined;

		private meta: MetaRef;

		constructor(pos: Vec3) {
			this.meta = core.get_meta(pos);
		}

		read() {
			for (const key of Object.keys(this)) {
				if (key == "meta") {
					continue;
				}

				const t = typeof this[key];

				// Backups provided in case the API glitches out.
				if (t == "number") {
					this[key] = this.meta.get_float(key) || 0;
				} else if (t == "boolean") {
					this[key] = (this.meta.get_int(key) || 0) > 0;
				} else if (t == "string") {
					this[key] = this.meta.get_string(key) || "";
				}

				print(key, this[key]);
			}
		}

		write() {
			for (const key of Object.keys(this)) {
				if (key == "meta") {
					continue;
				}
				// print(key);
			}
		}
	}

	/**
	 * Get a type safe metadata reference at a position in the world.
	 * @param pos The position in the world where the metadata is.
	 * @param clazz The advanced metadata class to encapsulate the components.
	 * @returns An instance of the metadata clazz.
	 */
	export function getMeta<T extends CrafterMeta>(
		pos: Vec3,
		clazz: new (p: Vec3) => T
	): T {
		const data = new clazz(pos);
		data.read();
		return data;
	}

	utility.registerTSEntity;
}
