# Static Pages / FS

This package provides utilities for reading and writing documents from an abstract filesystem.

Use `read()` to create an async iterable collection of documents, and `write()` to handle rendering and storing.

This project is structured as a toolkit split to many packages, published under the [@static-pages](https://www.npmjs.com/org/static-pages) namespace on NPM.
In most cases you should not use this core package directly, but the [@static-pages/starter](https://www.npmjs.com/package/@static-pages/starter) is a good point to begin with.

## Usage

```js
import staticPages from '@static-pages/core';
import { read, write } from '@static-pages/fs/node';

staticPages({
    from: read({
        cwd: 'pages',
        pattern: '**/*.md',
    }),
    controller(data) {
        data.now = new Date().toJSON();
        return data;
    },
    to: write({
        render({ title, content, now }) {
            return `<html><body><h1>${title}</h1><p>${content}</p><p>generated: ${now}</p></body></html>`;
        },
    })
})
.catch(error => {
    console.error('Error:', error);
    console.error(error.stack);
});
```

## Documentation

For detailed information, visit the [project page](https://staticpagesjs.github.io/).

### `read(options: ReadOptions<T>): AsyncIterable<T>`

```ts
interface ReadOptions<T> {
    // Filesystem implementation that handles reads and writes.
    fs: Filesystem;
    // Current working directory.
    cwd?: string;
    // File patterns to include.
    pattern?: string | string[];
    // File patterns to exclude.
    ignore?: string | string[];
    // Callback to parse raw contents into an object.
    // default: see About the default `parse` function
    parse?(content: Uint8Array | string, filename: string): T | Promise<T>;
    // Handler function called on error.
    // default: (err) => { throw err; }
    onError?(error: unknown): void | Promise<void>;
}
```

### `write(options: WriteOptions<T>): void`

```ts
interface WriteOptions<T> {
    // Filesystem implementation that handles reads and writes.
    fs: Filesystem;
    // Current working directory.
    cwd?: string;
    // Callback that retrieves the filename (URL) of a page.
    // default: (d) => d.url + '.html'
    name?(data: T): string | Promise<string>;
    // Callback that renders the document into a page.
    // default: (d) => d.content
    render?(data: T): Uint8Array | string | Promise<Uint8Array | string>;
    // Handler function called on error.
    // default: (err) => { throw err; }
    onError?(error: unknown): void | Promise<void>;
}
```

### `Filesystem` interface

You can provide a `Filesystem` implementation for both `read()` and `write()`
helpers. This interface is a minimal subset of the [NodeJS FS API](https://nodejs.org/api/fs.html)
so you can simply plug the `node:fs` package in.

```ts
interface Filesystem {
	stat(
		path: string | URL,
		callback: (err: Error | null, stats: { isFile(): boolean; isDirectory(): boolean; }) => void
	): void;

	readdir(
		path: string | URL,
		options: {
			encoding: 'utf8';
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
```

### About the default `parse` function

When using the default parser, a file type will be guessed by the file extension.
These could be `json`, `yaml`, `yml`, `md` or `markdown`.
- `json` will be parsed with `JSON.parse`
- `yaml` and `yml` will be parsed with the `yaml` package
- `md` and `markdown` will be parsed with the `gray-matter` package

When the document is missing an `url` property this function will assign the
filename without extension to it.

### Importing `@static-pages/fs/node`

The `@static-pages/fs/node` export provides the same functions as the
`@static-pages/fs` with the added benefit of setting the default value of the
`fs` property to the `node:fs` package.

This way it is easier to use these utility functions from a node script and also
easier to bundle them for browsers.

## Missing a feature?
Create an issue describing your needs!
If it fits the scope of the project I will implement it.
