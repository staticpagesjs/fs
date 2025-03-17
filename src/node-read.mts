import type { ReadOptions as BaseReadOptions } from './read.mjs';
import { read as baseRead, isReadOptions as baseIsReadOptions } from './read.mjs';
import * as nodeFs from 'node:fs';

export type ReadOptions<T> = undefined | (
	Omit<BaseReadOptions<T>, 'fs'>
	& {
		fs?: BaseReadOptions<T>['fs'];
	});

export const isReadOptions = (x: any): x is ReadOptions<any> => {
	if (!x) return true;
	return baseIsReadOptions(x);
};

export function read<T>(options: ReadOptions<T> = {}) {
	return baseRead({ fs: nodeFs as any, ...options });
}
