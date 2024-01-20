import type { ReadOptions as BaseReadOptions } from '../read.js';
import { read as baseRead, isReadOptions as baseIsReadOptions } from '../read.js';
import * as nodeFs from 'node:fs';

export type ReadOptions<T> =
	Partial<Pick<BaseReadOptions<T>, 'fs'>>
	& Omit<BaseReadOptions<T>, 'fs'>;

export const isReadOptions = <T>(x: unknown): x is ReadOptions<T> => {
	if (!x) return true;
	return baseIsReadOptions(x);
};

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
