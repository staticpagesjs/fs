const path = require('node:path');

const createFilesystem = (entries) => ({
	stat(name, cb) {
		const entry = entries.find(([x]) => path.relative(name, x) === '');
		if (!entry) return cb(new Error('No file ' + name));
		const hasContent = !!entry[1];
		cb(null, {
			isFile() { return hasContent; },
			isDirectory() { return !hasContent; },
		});
	},
	readdir(name, opts, cb) {
		cb(null, entries
			.map(([x]) => path.relative(name, x))
			.filter(x => x !== '' && !x.startsWith('..'))
		);
	},
	mkdir(name, opts, cb) {
		entries.push([name]);
		cb(null);
	},
	readFile(name, cb) {
		const entry = entries.find(([x]) => path.relative(name, x) === '');
		if (entry) cb(null, new TextEncoder().encode(entry[1]));
		else cb(new Error('No file ' + name));
	},
	writeFile(name, data, cb) {
		const entry = entries.find(([x]) => path.relative(name, x) === '');
		const content = typeof data === 'string' ? data : new TextDecoder('utf-8').decode(data);
		if (entry) {
			entry[1] = content;
		} else {
			entries.push([name, content]);
		}
		cb(null);
	},
});

module.exports = { createFilesystem };
