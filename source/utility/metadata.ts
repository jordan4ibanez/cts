namespace utility {
	/** Metadata wrapper for type safety.
	 *
	 * Can only have keys of type:
	 * - string
	 * - int
	 * - float
	 */
	export class CrafterMeta {
		private meta: MetaRef;

		constructor(meta: MetaRef) {
			this.meta = meta;
		}

		read() {
			for (const key of Object.keys(this)) {
				print(key.length);
			}
		}

		write() {
			for (const key of Object.keys(this)) {
				print(key.length);
			}
		}
	}

	export function getMeta<T>(pos: Vec3) {
		const meta = core.get_meta(pos);
	}
}
