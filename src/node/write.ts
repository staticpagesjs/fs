import type { WriteOptions as BaseWriteOptions } from '../write.js';
import { write as baseWrite } from '../write.js';
import * as nodeFs from 'node:fs';

export type WriteOptions<T> =
	Partial<Pick<BaseWriteOptions<T>, 'fs'>>
	& Omit<BaseWriteOptions<T>, 'fs'>;

export { isWriteOptions } from '../write.js';

export function write<T>(options: WriteOptions<T> = {}) {
	return baseWrite(
		typeof options.fs !== 'undefined'
		? options as BaseWriteOptions<T>
		: {
			...options,
			fs: nodeFs,
		}
	);
}
