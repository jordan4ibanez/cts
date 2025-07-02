namespace utility {
	/** Metadata wrapper for type safety.
	 *
	 * Can only have keys of type:
	 * - string
	 * - int
	 * - float
	 */
	export class CrafterMeta
		implements Dictionary<any, string | number | MetaRef | (() => any)>
	{
		[x: string]: string | number | MetaRef | (() => any) | undefined;

		private meta: MetaRef;

		constructor(pos: Vec3) {
			this.meta = core.get_meta(pos);
		}

		read() {
			for (const key of Object.keys(this)) {
				if (key == "meta") {
					continue;
				}
				print(key);
			}
		}

		write() {
			for (const key of Object.keys(this)) {
				if (key == "meta") {
					continue;
				}
				print(key);
			}
		}
	}
}
