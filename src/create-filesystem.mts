import type { Filesystem } from './helpers.mjs';

export type FileContent =
	| string
	| { encoding: 'text' | 'base64'; content: string; };

function normalize(p: string | URL): string {
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
	return '/' + segments.join('/');
}

function dirname(path: string): string {
	return path.substring(0, path.lastIndexOf('/'));
}

export function createFilesystem(files: Record<string, FileContent>): Filesystem {
	for (const path of Object.keys(files)) {
		const normalized = normalize(path);
		if (path !== normalized) {
			files[normalized] = files[path];
			delete files[path];
		}
	}

	function stat(
		path: string | URL,
		callback: (err: Error | null, stats: { isFile(): boolean; isDirectory(): boolean; }) => void
	): void {
		const p = normalize(path);
		if (Object.prototype.hasOwnProperty.call(files, p)) {
			return callback(null, {
				isFile: () => true,
				isDirectory: () => false,
			});
		}
		return callback(null, {
			isFile: () => false,
			isDirectory: () => true,
		});
	}

	function readdir(
		path: string | URL,
		options: {
			encoding: 'utf8';
			withFileTypes: false;
			recursive: boolean;
		},
		callback: (err: Error | null, files: string[]) => void,
	): void {
		const p = normalize(path);
		if (options.recursive) {
			return callback(null, Object.keys(files).filter(name => name.startsWith(p + '/')));
		} else {
			return callback(null, Object.keys(files).filter(name => dirname(name) === p));
		}
	}

	function mkdir(
		path: string | URL,
		options: {
			recursive: true;
		},
		callback: (err: Error | null, path?: string) => void
	): void {
		callback(null, normalize(path));
	}

	function readFile(
		path: string | URL,
		callback: (err: Error | null, data: Uint8Array) => void
	) {
		const p = normalize(path);
		if (!Object.prototype.hasOwnProperty.call(files, p)) {
			return callback(new Error(`ENOENT: no such file, readFile '${p}'`), undefined as any);
		}
		const content = files[p];
		let buf: Buffer;
		if (typeof content === 'string') {
			buf = Buffer.from(content, 'utf8');
		} else if (content.encoding === 'text') {
			buf = Buffer.from(content.content, 'utf8');
		} else if (content.encoding === 'base64') {
			buf = Buffer.from(content.content, 'base64');
		} else {
			return callback(new Error(`Unknown encoding for file '${p}'`), undefined as any);
		}
		callback(null, buf);
	}

	function writeFile(
		path: string | URL,
		data: string | Uint8Array,
		callback: (err: Error | null) => void
	): void {
		const p = normalize(path);
		if (typeof data === 'string') {
			files[p] = data;
		} else {
			files[p] = { encoding: 'base64', content: Buffer.from(data).toString('base64') };
		}
		callback(null);
	}

	return { stat, readdir, mkdir, readFile, writeFile };
}
