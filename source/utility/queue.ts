namespace utility {
	export class QueueFIFO<T> {
		private data: T[];

		constructor() {
			this.data = [];
		}

		/**
		 * Push some data to the end of the queue.
		 * @param data The data to add.
		 */
		push(data: T): void {
			this.data.push(data);
		}

		/**
		 * Pop some data off the front of the queue.
		 * @returns The data or nothing if empty.
		 */
		pop(): T | undefined {
			return this.data.shift();
		}

		/**
		 * Get the length of the queue.
		 * @returns The length of the queue.
		 */
		length(): number {
			return this.data.length;
		}
	}
}
