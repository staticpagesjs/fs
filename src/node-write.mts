import type { WriteOptions as BaseWriteOptions } from './write.mjs';
import { write as baseWrite, isWriteOptions as baseIsWriteOptions } from './write.mjs';
import * as nodeFs from 'node:fs';

export type WriteOptions<T> = undefined | (
	Omit<BaseWriteOptions<T>, 'fs'>
	& {
		fs?: BaseWriteOptions<T>['fs'];
	});

export const isWriteOptions = (x: any): x is WriteOptions<any> => {
	if (!x) return true;
	return baseIsWriteOptions(x);
};

export function write<T>(options: WriteOptions<T> = {}) {
	return baseWrite({ fs: nodeFs as any, ...options });
}
