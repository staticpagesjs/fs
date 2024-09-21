import type { Filesystem } from './helpers.mjs';
import { getType, isIterable, isAsyncIterable, isFilesystem } from './helpers.mjs';
import picomatch from 'picomatch';
import { defaultParser } from './default-parser.mjs';

export interface ReadOptions<T> {
    /**
	 * Filesystem implementation that handles reads and writes.
	 */
    fs: Filesystem;
    /**
	 * Current working directory.
	 */
    cwd?: string;
    /**
	 * File patterns to include.
	 */
    pattern?: string | string[];
    /**
	 * File patterns to exclude.
	 */
    ignore?: string | string[];
    /**
	 * Callback to parse raw contents into an object.
	 * @defaults Parses `json`, `yaml` and frontmatter style `markdown` files.
	 */
    parse?(content: Uint8Array | string, filename: string): T | Promise<T>;
    /**
	 * Handler function called on error.
	 * @defaults `(err) => { throw err; }`
	 */
    onError?(error: unknown): void | Promise<void>;
}

export const isReadOptions = (x: any): x is ReadOptions<any> => {
	if (!x || typeof x !== 'object' || isIterable(x) || isAsyncIterable(x)) {
		return false;
	}
	const proto = Object.getPrototypeOf(x);
	if (proto !== Object.prototype && proto !== null) {
		return false;
	}
	return true;
};

export async function* read<T>({
	fs,
	cwd = 'pages',
	pattern,
	ignore,
	parse = defaultParser(),
	onError = (error: unknown) => { throw error; },
}: ReadOptions<T>) {
	if (!isFilesystem(fs)) throw new TypeError(`Expected Node FS compatible implementation at 'fs' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof pattern !== 'undefined' && typeof pattern !== 'string' && !Array.isArray(pattern)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(pattern)}' at 'pattern' property.`);
	if (typeof ignore !== 'undefined' && typeof ignore !== 'string' && !Array.isArray(ignore)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(ignore)}' at 'ignore' property.`);
	if (typeof parse !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(parse)}' at 'parse' property.`);
	if (typeof onError !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(onError)}' at 'onError' property.`);

	cwd = cwd.replace(/\\/g, '/');

	let filenames: string[] = await new Promise((resolve, reject) => {
		fs.readdir(cwd, { recursive: true, withFileTypes: false, encoding: 'utf8' }, (err, entries) => {
			if (err) return reject(err);
			let filtered: string[] = [];
			let processed = 0;
			for (const entry of entries) {
				fs.stat(cwd + '/' + entry, (err, stats) => {
					if (err) return reject(err);
					if (stats.isFile()) {
						filtered.push(entry);
					}
					if (++processed === entries.length) {
						return resolve(filtered);
					}
				});
			}
		});
	});

	if (typeof pattern !== 'undefined' || typeof ignore !== 'undefined') {
		const filteredFilenames = [];
		const isMatch = picomatch(pattern ?? '**/*', { ignore });
		for (const filename of filenames) {
			if (isMatch(filename)) {
				filteredFilenames.push(filename);
			}
		}
		filenames = filteredFilenames;
	}

	for (const filename of filenames) {
		try {
			const content: Uint8Array = await new Promise((resolve, reject) => {
				fs.readFile(cwd + '/' + filename, (err, data) => {
					if (err) reject(err);
					else resolve(data);
				});
			});
			yield await parse(content, filename);
		} catch (error) {
			await onError(error);
		}
	}
}
