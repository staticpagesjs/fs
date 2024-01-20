import assert from 'assert';
import {
	getType,
	isIterable,
	isAsyncIterable,
	isFilesystem,
} from '../esm/helpers.js';

import fs from 'node:fs';
import { createFilesystem } from './helpers/createFilesystem.cjs';

describe('Helpers Tests', () => {
	it('getType() test', async () => {
		const input =    [123,      false,     undefined,   null,   {},       [],      'a',      function(){}];
		const expected = ['number', 'boolean', 'undefined', 'null', 'object', 'array', 'string', 'function'];
		const output = input.map(x => getType(x));

		assert.deepStrictEqual(output, expected);
	});

	it('isIterable() test', async () => {
		const input =    [async function*(){}(), function*(){}(), false, undefined, null,  {},    [],   'a',   function(){}];
		const expected = [false,                 true,            false, false,     false, false, true, false, false];
		const output = input.map(x => isIterable(x));

		assert.deepStrictEqual(output, expected);
	});

	it('isAsyncIterable() test', async () => {
		const input =    [async function*(){}(), function*(){}(), false, undefined, null,  {},    [],    'a',   function(){}];
		const expected = [true,                  false,           false, false,     false, false, false, false, false];
		const output = input.map(x => isAsyncIterable(x));

		assert.deepStrictEqual(output, expected);
	});

	it('isFilesystem() test', async () => {
		const input =    [fs,   createFilesystem([]), undefined, null,  {},    123,   { mkdir(){} }];
		const expected = [true, true,             false,     false, false, false, false];
		const output = input.map(x => isFilesystem(x));

		assert.deepStrictEqual(output, expected);
	});
});
