async function writeToArray(iterable) {
	const output = [];
	for await (const item of iterable) {
		output.push([`public/${item.url}.html`, item.content]);
	}
	return output;
}

module.exports = { writeToArray };
