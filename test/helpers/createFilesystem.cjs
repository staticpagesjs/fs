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
		if (entry) cb(null, Buffer.from(entry[1]));
		else cb(new Error('No file ' + name));
	},
	writeFile(name, data, cb) {
		const entry = entries.find(([x]) => path.relative(name, x) === '');
		if (entry) {
			entry[1] = data;
		} else {
			entries.push([name, data]);
		}
		cb(null);
	},
});

module.exports = { createFilesystem };
