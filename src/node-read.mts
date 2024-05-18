import type { ReadOptions as BaseReadOptions } from './read.mjs';
import { read as baseRead, isReadOptions as baseIsReadOptions } from './read.mjs';
import * as nodeFs from 'node:fs';

export type ReadOptions<T> =
	(Partial<Pick<BaseReadOptions<T>, 'fs'>>
	& Omit<BaseReadOptions<T>, 'fs'>)
	| undefined;

export const isReadOptions = (x: any): x is ReadOptions<any> => {
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
