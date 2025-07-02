namespace utility {
	export class CrafterMeta {
		private meta: MetaRef | null = null;

		movePosition(pos: Vec3) {
			this.meta = core.get_meta(pos);
		}

		debugKeys() {
			for (const key of Object.keys(this)) {
				print(key.length);
			}
		}
	}

	export function getMeta<T>(pos: Vec3) {
		const meta = core.get_meta(pos);
	}
}
