function json(d) {
	return JSON.stringify(d);
}

function yaml(d) {
	return Object.entries(d)
		.map(([k, v]) => `${k}: '${v.replace(/'/g, '\\\'')}'\n`)
		.join('\n');
}

function md({ content, ...rest }) {
	return `---\n${yaml(rest)}---\n${content}`;
}

module.exports = { json, yaml, md };
