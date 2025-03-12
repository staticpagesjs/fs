export const isIterable = (x: any): x is Iterable<any> => !!x && typeof x === 'object' && typeof x[Symbol.iterator] === 'function';
export const isAsyncIterable = (x: any): x is AsyncIterable<any> => !!x && typeof x === 'object' && typeof x[Symbol.asyncIterator] === 'function';

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

export function normalize(p: string | URL): string {
	const segments: string[] = [];
	for (const segment of (typeof p === 'string' ? p : p.pathname).split(/[\\\/]/)) {
		if (segment === '' || segment === '.') {
			// skip
		} else if (segment === '..') {
			segments.pop();
		} else {
			segments.push(segment);
		}
	}
	return segments.join('/');
}

export function dirname(path: string): string {
	return path.substring(0, path.lastIndexOf('/'));
}
