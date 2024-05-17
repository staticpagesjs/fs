import assert from 'assert';
import { write } from '../package/index.mjs';

import { createFilesystem } from './helpers/createFilesystem.cjs';

describe('Writer Tests', () => {
	it('writes with minimal configuration', async () => {
		const pages = [
			{ url: 'file1', content: 'content1' },
			{ url: 'file2', content: 'content2' }
		];
		const expected = [
			['public'],
			['public/file1.html', 'content1'],
			['public/file2.html', 'content2']
		];

		const fsContent = [];
		const writer = write({
			fs: createFilesystem(fsContent),
		});

		for (const page of pages) {
			await writer(page);
		}

		assert.deepStrictEqual(fsContent, expected);
	});

	it('should throw when url field is missing', async () => {
		await assert.rejects(async () => {
			const pages = [
				{ content: 'content1' },
				{ content: 'content2' }
			];

			const fsContent = [];
			const writer = write({
				fs: createFilesystem(fsContent),
			});

			for await (const page of pages) {
				await writer(page);
			}

		}, { message: `Missing 'url' field in the document.` });
	});

	it('should throw when content field is missing', async () => {
		await assert.rejects(async () => {
			const pages = [
				{ url: 'file1' },
				{ url: 'file2' }
			];

			const fsContent = [];
			const writer = write({
				fs: createFilesystem(fsContent),
			});

			for await (const page of pages) {
				await writer(page);
			}

		}, { message: `Missing 'content' field in the document.` });
	});

	it('can handle errors silently', async () => {
		const page = { url: 'file1', content: 'content1' };
		const expected = 'Some error thrown.';

		let output = null;
		const writer = write({
			fs: createFilesystem([]),
			render() { throw new Error('Some error thrown.'); },
			onError(error) { output = error.message; }
		});

		await writer(page);

		assert.deepStrictEqual(output, expected);
	});

	it('should throw on error with default configuration', async () => {
		await assert.rejects(async () => {
			const page = { url: 'file1', content: 'content1' };
			const expected = 'Some error thrown.';

			let output = null;
			const writer = write({
				fs: createFilesystem([]),
				render() { throw new Error('Some error thrown.'); },
			});

			await writer(page);

		}, { message: `Some error thrown.` });
	});

	it('should throw when "fs" recieves an an invalid type', async () => {
		await assert.rejects(async () => {
			write({
				fs: 1,
			});
		}, { message: `Expected Node FS compatible implementation at 'fs' property.` });
	});

	it('should throw when "cwd" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			write({
				fs: createFilesystem([]),
				cwd: 123
			});
		}, { message: `Expected 'string', recieved 'number' at 'cwd' property.` });
	});

	it('should throw when "cwd" recieves an empty string', async () => {
		await assert.rejects(async () => {
			write({
				fs: createFilesystem([]),
				cwd: ''
			});
		}, { message: `Expected non-empty string at 'cwd'.` });
	});

	it('should throw when "render" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			write({
				fs: createFilesystem([]),
				render: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'render' property.` });
	});

	it('should throw when "name" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			write({
				fs: createFilesystem([]),
				name: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'name' property.` });
	});

	it('should throw when "onError" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			write({
				fs: createFilesystem([]),
				onError: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'onError' property.` });
	});

	it('should handle mkdir errors', async () => {
		await assert.rejects(async () => {
			const page = { url: 'file1', content: 'content1' };

			const mockFs = createFilesystem([]);
			mockFs.mkdir = function (file, opts, cb) { cb(new Error('Some error thrown')); };

			const writer = write({
				fs: mockFs,
			});

			await writer(page);

		}, { message: `Some error thrown` });
	});

	it('should handle writeFile errors', async () => {
		await assert.rejects(async () => {
			const page = { url: 'file1', content: 'content1' };

			const mockFs = createFilesystem([]);
			mockFs.writeFile = function (file, data, cb) { cb(new Error('Some error thrown')); };

			const writer = write({
				fs: mockFs,
			});

			await writer(page);

		}, { message: `Some error thrown` });
	});
});
