import assert from 'assert';
import {
	createFilesystem,
} from '../package/create-filesystem.mjs';
import {
	isFilesystem,
} from '../package/helpers.mjs';
import { read } from '../package/read.mjs';

describe('createFilesystem() Tests', () => {
	it('initialize test', async () => {
		const input =    { hello: '# Hello' };
		const expectedFiles = { '/hello': '# Hello' };
		const output = createFilesystem(input);

		assert.strictEqual(isFilesystem(output), true);
		assert.deepStrictEqual(input, expectedFiles);
	});

	it('read file test', async () => {
		const input =    { hello: '# Hello' };
		const expected = '# Hello';
		const fs = createFilesystem(input);

		await new Promise((resolve) => {
			fs.readFile('hello', (err, data) => {
				assert.strictEqual(data.toString('utf8'), expected);
				resolve();
			});
		});
	});

	it('write file test', async () => {
		const input =    { hello: '# Hello' };
		const expected = { '/hello': '# Hello', '/world': 'cont.' };
		const fs = createFilesystem(input);

		await new Promise((resolve) => {
			fs.writeFile('world', 'cont.', (err) => {
				assert.deepEqual(input, expected);
				resolve();
			});
		});
	});

	it('readdir test', async () => {
		const input =    {
			'/a/hello.md': '# Hello',
			'/a/world.md': '# World',
			'/a/b/foo.md': '# Foo',
			'/c/bar.md': '# Bar',
		};
		const expected = ['/a/hello.md', '/a/world.md'];
		const fs = createFilesystem(input);

		await new Promise((resolve) => {
			fs.readdir('a', { encoding: 'utf8', recursive: false, withFileTypes: false }, (err, files) => {
				assert.deepEqual(files, expected);
				resolve();
			});
		});
	});

	it('readdir recursive test', async () => {
		const input =    {
			'/a/hello.md': '# Hello',
			'/a/world.md': '# World',
			'/a/b/foo.md': '# Foo',
			'/c/bar.md': '# Bar',
		};
		const expected = ['/a/hello.md', '/a/world.md', '/a/b/foo.md'];
		const fs = createFilesystem(input);

		await new Promise((resolve) => {
			fs.readdir('a', { encoding: 'utf8', recursive: true, withFileTypes: false }, (err, files) => {
				assert.deepEqual(files, expected);
				resolve();
			});
		});
	});

	it('works with read() on empty fs object', async () => {
		const input = { };
		const fs = createFilesystem(input);

		const reader = read({ fs: fs });

		let ok = true;
		for await (const item of reader) {
			ok = false;
		}

		assert.strictEqual(ok, true);
	});

});
