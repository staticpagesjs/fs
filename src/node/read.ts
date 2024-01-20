import type { ReadOptions as BaseReadOptions } from '../read.js';
import { read as baseRead } from '../read.js';
import * as nodeFs from 'node:fs';

export type ReadOptions<T> =
	Partial<Pick<BaseReadOptions<T>, 'fs'>>
	& Omit<BaseReadOptions<T>, 'fs'>;

export { isReadOptions } from '../read.js';

export function read<T>(options: ReadOptions<T> = {}) {
	return baseRead(
		typeof options.fs !== 'undefined'
		? options as BaseReadOptions<T>
		: {
			...options,
			fs: nodeFs,
		}
	);
}
