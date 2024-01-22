const assert = require('assert');
const { read } = require('../index.cjs');

const { createFilesystem } = require('./helpers/createFilesystem.cjs');
const { json, yaml, md } = require('./helpers/stringify.cjs');
const { writeToArray } = require('./helpers/writeToArray.cjs');

// If tests ran successfully on the ES module version we
// does not start the same tests on the CJS version.
// Things to tests here:
//   - exports of this module
//   - imports of the dependencies
describe('CommonJS Tests', () => {
	it('CJS version is importable', async () => {
		const reader = read({
			fs: createFilesystem([])
		});

		assert.ok(Symbol.asyncIterator in reader);
	});

	it('can use the "picomatch" package', async () => {
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

		const output = [];
		for await (const item of iterable) {
			output.push([`public/${item.url}.html`, item.content]);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can use the "yaml" package', async () => {
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

		const output = [];
		for await (const item of iterable) {
			output.push([`public/${item.url}.html`, item.content]);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('can use the "gray-matter" package', async () => {
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
});
