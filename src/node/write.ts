import type { WriteOptions as BaseWriteOptions } from '../write.js';
import { write as baseWrite, isWriteOptions as baseIsWriteOptions } from '../write.js';
import * as nodeFs from 'node:fs';

export type WriteOptions<T> =
	Partial<Pick<BaseWriteOptions<T>, 'fs'>>
	& Omit<BaseWriteOptions<T>, 'fs'>;

export const isWriteOptions = <T>(x: unknown): x is WriteOptions<T> => {
	if (!x) return true;
	return baseIsWriteOptions(x);
};

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
