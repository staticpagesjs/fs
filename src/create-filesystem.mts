import { normalize, dirname, type Filesystem } from './helpers.mjs';

export type FileContent =
	| string
	| { encoding: 'text' | 'base64'; content: string; };

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
			if (p === '') {
				return callback(null, Object.keys(files));
			} else {
				return callback(null, Object.keys(files)
					.filter(name => name.startsWith(p + '/'))
					.map(name => name.substring(p.length + 1))
				);
			}
		} else {
			return callback(null, Object.keys(files)
				.filter(name => dirname(name) === p)
				.map(name => name.substring(p.length + 1))
			);
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
		let buf: Uint8Array;
		if (typeof content === 'string') {
			buf = utf8ToUint8Array(content);
		} else if (content.encoding === 'text') {
			buf = utf8ToUint8Array(content.content);
		} else if (content.encoding === 'base64') {
			buf = base64ToUint8Array(content.content);
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
			files[p] = {
				encoding: 'base64',
				content: Uint8ArrayToBase64(data),
			};
		}
		callback(null);
	}

	return { stat, readdir, mkdir, readFile, writeFile };
}

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { ignoreBOM: true });

function Uint8ArrayToBase64(from: Uint8Array) {
	return btoa(decoder.decode(from));
}

function utf8ToUint8Array(from: string) {
	return encoder.encode(from);
}

function base64ToUint8Array(from: string) {
	const binaryString = atob(from);
	const uint8Array = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		uint8Array[i] = binaryString.charCodeAt(i);
	}
	return uint8Array;
}
