import type { Filesystem } from './helpers.mjs';
import { getType, isFilesystem } from './helpers.mjs';

export interface WriteOptions<T> {
	/**
	 * Filesystem implementation that handles reads and writes.
	 */
	fs: Filesystem;
	/**
	 * Current working directory.
	 */
	cwd?: string;
	/**
	 * Callback that retrieves the filename (URL) of a page.
	 * @defaults `(d) => d.url + '.html'`
	 */
	name?(data: T): string | Promise<string>;
	/**
	 * Callback that renders the document into a page.
	 * @defaults `(d) => d.content`
	 */
	render?(data: T): Uint8Array | string | Promise<Uint8Array | string>;
	/**
	 * Handler function called on error.
	 * @defaults `(err) => { throw err; }`
	 */
	onError?(error: unknown): void | Promise<void>;
}

export const isWriteOptions = (x: any): x is WriteOptions<any> => {
	if (!x || typeof x !== 'object') {
		return false;
	}
	const proto = Object.getPrototypeOf(x);
	if (proto !== Object.prototype && proto !== null) {
		return false;
	}
	return true;
};

const defaultNamer = <T,>(data: T) => {
	if (!!data && typeof data === 'object' && 'url' in data && typeof data.url === 'string') {
		return data.url.concat('.html');
	}
	throw new Error(`Missing 'url' field in the document.`);
};

const defaultRenderer = <T,>(data: T) => {
	if (!!data && typeof data === 'object' && 'content' in data) {
		return '' + data.content;
	}
	throw new Error(`Missing 'content' field in the document.`);
};

export function write<T>({
	fs,
	cwd = 'public',
	name = defaultNamer,
	render = defaultRenderer,
	onError = (error: unknown) => { throw error; },
}: WriteOptions<T>) {
	if (!isFilesystem(fs)) throw new TypeError(`Expected Node FS compatible implementation at 'fs' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof render !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(render)}' at 'render' property.`);
	if (typeof name !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(name)}' at 'name' property.`);
	if (typeof onError !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(onError)}' at 'onError' property.`);

	cwd = cwd.replace(/\\/g, '/');

	return async function (data: T) {
		try {
			const filepath = cwd + '/' + (await name(data)).replace(/\\/g, '/');
			const dirpath = filepath.substring(0, filepath.lastIndexOf('/'));
			await new Promise((resolve, reject) => {
				fs.stat(dirpath, (err, stats) => {
					if (err) {
						fs.mkdir(dirpath, { recursive: true }, (err) => {
							if (err) {
								reject(err);
							} else {
								resolve(undefined);
							}
						});
					} else {
						resolve(undefined);
					}
				})
			});

			const content = await render(data);

			await new Promise((resolve, reject) => {
				fs.writeFile(filepath, content, (err) => {
					if (err) reject(err);
					else resolve(undefined);
				})
			});
		} catch (error) {
			await onError(error);
		}
	};
}
