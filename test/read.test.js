import assert from 'assert';
import { read } from '../index.js';

import { createFilesystem } from './helpers/createFilesystem.cjs';
import { json, yaml, md } from './helpers/stringify.cjs';
import { writeToArray } from './helpers/writeToArray.cjs';

describe('Reader Tests', () => {
	it('works with minimal configuration', async () => {
		const fsContent = [
			['pages/file1.json', json({url:'file1',content:'content1'})],
			['pages/file2.json', json({url:'file2',content:'content2'})]
		];
		const expected = [
			['public/file1.html', 'content1'],
			['public/file2.html', 'content2']
		];

		const iterable = read({
			fs: createFilesystem(fsContent),
		});

		const output = await writeToArray(iterable);

		assert.deepStrictEqual(output, expected);
	});

	it('can use pattern based filtering', async () => {
		const fsContent = [
			['pages/file1.json', json({url:'file1',content:'content1'})],
			['pages/file2.json', json({url:'file2',content:'content2'})],
			['pages/file3.json', json({url:'file3',content:'content3'})]
		];
		const expected = [
			['public/file1.html', 'content1'],
			['public/file3.html', 'content3']
		];

		const iterable = read({
			fs: createFilesystem(fsContent),
			pattern: '**/file@(1|3).*',
		});

		const output = await writeToArray(iterable);

		assert.deepStrictEqual(output, expected);
	});

	it('can use ignore pattern based filtering', async () => {
		const fsContent = [
			['pages/file1.json', json({url:'file1',content:'content1'})],
			['pages/file2.json', json({url:'file2',content:'content2'})],
			['pages/file3.json', json({url:'file3',content:'content3'})]
		];
		const expected = [
			['public/file2.html', 'content2']
		];

		const iterable = read({
			fs: createFilesystem(fsContent),
			ignore: '**/file@(1|3).*',
		});

		const output = await writeToArray(iterable);

		assert.deepStrictEqual(output, expected);
	});

	it('should inherit the value of the url property from the filename when the url property is not present', async () => {
		const fsContent = [
			['pages/file1.json', json({content:'content1'})],
			['pages/file2.json', json({content:'content2'})]
		];
		const expected = [
			['public/file1.html', 'content1'],
			['public/file2.html', 'content2']
		];

		const iterable = read({
			fs: createFilesystem(fsContent),
		});

		const output = await writeToArray(iterable);

		assert.deepStrictEqual(output, expected);
	});

	it('can parse yaml files', async () => {
		const fsContent = [
			['pages/file1.yaml', yaml({url:'file1',content:'content1'})],
			['pages/file2.yml',  yaml({url:'file2',content:'content2'})]
		];
		const expected = [
			['public/file1.html', 'content1'],
			['public/file2.html', 'content2']
		];

		const iterable = read({
			fs: createFilesystem(fsContent),
		});

		const output = await writeToArray(iterable);

		assert.deepStrictEqual(output, expected);
	});

	it('can parse markdown files', async () => {
		const fsContent = [
			['pages/file1.md',       md({url:'file1',content:'content1'})],
			['pages/file2.markdown', md({url:'file2',content:'content2'})]
		];
		const expected = [
			['public/file1.html', 'content1'],
			['public/file2.html', 'content2']
		];

		const iterable = read({
			fs: createFilesystem(fsContent),
		});

		const output = await writeToArray(iterable);

		assert.deepStrictEqual(output, expected);
	});

	it('can handle errors silently', async () => {
		const fsContent = [
			['pages/file1.json', json({url:'file1',content:'content1'})],
			['pages/file2.json', json({url:'file2',content:'content2'})]
		];

		const expected = 'Some error thrown.';

		let recieved = null;
		const reader = read({
			fs: createFilesystem(fsContent),
			parse() { throw new Error(expected); },
			onError(error) {
				recieved = error.message;
			}
		});

		await reader.next();

		assert.deepStrictEqual(recieved, expected);
	});

	it('should throw with default settings on parsing errors', async () => {
		await assert.rejects(async () => {
			const fsContent = [
				['pages/file1.json', json({url:'file1',content:'content1'})],
				['pages/file2.json', json({url:'file2',content:'content2'})]
			];

			const iterable = read({
				fs: createFilesystem(fsContent),
				parse() { throw new Error('Some error thrown.'); },
			});

			await iterable.next();

		}, { message: `Some error thrown.` });
	});

	it('should throw when "fs" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: 1,
			});

			await iterable.next();

		}, { message: `Expected Node FS compatible implementation at 'fs' property.` });
	});

	it('should throw when "cwd" recieves an empty string', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: createFilesystem([]),
				cwd: ''
			});

			await iterable.next();

		}, { message: `Expected non-empty string at 'cwd'.` });
	});

	it('should throw when "cwd" recieves a non string value', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: createFilesystem([]),
				cwd: 123
			});

			await iterable.next();

		}, { message: `Expected 'string', recieved 'number' at 'cwd' property.` });
	});

	it('should throw when "pattern" recieves a non string and non array value', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: createFilesystem([]),
				pattern: 123
			});

			await iterable.next();

		}, { message: `Expected 'string' or 'string[]', recieved 'number' at 'pattern' property.` });
	});

	it('should throw when "ignore" recieves a non string and non array value', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: createFilesystem([]),
				ignore: 123
			});

			await iterable.next();

		}, { message: `Expected 'string' or 'string[]', recieved 'number' at 'ignore' property.` });
	});

	it('should throw when "parse" recieves a non callable', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: createFilesystem([]),
				parse: 123
			});

			await iterable.next();

		}, { message: `Expected 'function', recieved 'number' at 'parse' property.` });
	});

	it('should throw when the default parser recieves a file without an extension', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: createFilesystem([
					['pages/myfile', 'abc']
				]),
			});

			await iterable.next();

		}, { message: `Could not parse document without an extension.` });
	});

	it('should throw when the default parser recieves an unknown file format', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: createFilesystem([
					['pages/myfile.abc', 'abc']
				]),
			});

			await iterable.next();

		}, { message: `Could not parse document with 'abc' extension.` });
	});

	it('should throw when "onError" recieves a non callable', async () => {
		await assert.rejects(async () => {
			const iterable = read({
				fs: createFilesystem([]),
				onError: 123
			});

			await iterable.next();

		}, { message: `Expected 'function', recieved 'number' at 'onError' property.` });
	});

	it('should handle when the "fs.readdir" throws', async () => {
		await assert.rejects(async () => {
			const mockFs = createFilesystem([]);
			mockFs.readdir = function(dir, opts, cb) { cb(new Error('Some error thrown.')); };

			const reader = read({
				fs: mockFs,
			});

			await reader.next();

		}, { message: `Some error thrown.` });
	});

	it('should handle when the "fs.stat" throws', async () => {
		await assert.rejects(async () => {
			const mockFs = createFilesystem([
				['pages/filename', 'content']
			]);
			mockFs.stat = function(file, cb) { cb(new Error('Some error thrown.')); };

			const reader = read({
				fs: mockFs,
			});

			await reader.next();

		}, { message: `Some error thrown.` });
	});

	it('should handle when the "fs.readFile" throws', async () => {
		await assert.rejects(async () => {
			const mockFs = createFilesystem([
				['pages/filename', 'content']
			]);
			mockFs.readFile = function(file, cb) { cb(new Error('Some error thrown.')); };

			const reader = read({
				fs: mockFs,
			});

			await reader.next();

		}, { message: `Some error thrown.` });
	});
});
