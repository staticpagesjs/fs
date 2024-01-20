export const isIterable = <T>(x: unknown): x is Iterable<T> => !!x && typeof x === 'object' && Symbol.iterator in x && typeof x[Symbol.iterator] === 'function';
export const isAsyncIterable = <T>(x: unknown): x is AsyncIterable<T> => !!x && typeof x === 'object' && Symbol.asyncIterator in x && typeof x[Symbol.asyncIterator] === 'function';

export const getType = (x: unknown): string => typeof x === 'object' ? (x ? (Array.isArray(x) ? 'array' : 'object') : 'null') : typeof x;

export const isFilesystem = (x: unknown): x is Filesystem => !!x && typeof x === 'object' && 'stat' in x && 'mkdir' in x && 'readFile' in x && 'writeFile' in x;
export interface Filesystem {
	stat(
		path: string | URL,
		callback: (err: Error | null, stats: { isFile(): boolean; isDirectory(): boolean; }) => void
	): void;

	readdir(
		path: string | URL,
		options: {
			encoding: 'utf8';
			// with file types option supported since 20.1.0, using stat() for each entry for now
			withFileTypes: false;
			recursive: boolean;
		},
		callback: (err: Error | null, files: string[]) => void,
	): void;

	mkdir(
		path: string | URL,
		options: {
			recursive: true;
		},
		callback: (err: Error | null, path?: string) => void
	): void;

	readFile(
		path: string | URL,
		callback: (err: Error | null, data: Uint8Array) => void
	): void;

	writeFile(
		path: string | URL,
		data: string | Uint8Array,
		callback: (err: Error | null) => void
	): void;
}
