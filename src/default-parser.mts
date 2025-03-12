import YAML from 'js-yaml';
import graymatter from 'gray-matter';

type PostProcessCallback = (doc: any, filename: string) => Promise<any> | any;

const autoUrl = (doc: any, filename: string) => {
	if (doc && typeof doc === 'object' && !('url' in doc)) {
		const dot = filename.lastIndexOf('.');
		doc.url = (dot < 0 ? filename : filename.substring(0, dot)).replace(/\\/g, '/');
	}
};

export const defaultParser = (
	extensions: Record<string, string | ((content: string | Uint8Array) => any)> = {},
	postprocess: PostProcessCallback = autoUrl
) => async (
	content: string | Uint8Array,
	filename: string
) => {
	const dot = filename.lastIndexOf('.');
	const extension = dot < 0 ? '' : filename.substring(dot + 1).toLowerCase();
	const parsers: typeof extensions = {
		...extensions,
		yml: 'yaml',
		markdown: 'md',
		json(content) { return JSON.parse(content.toString()); },
		yaml(content) { return YAML.load(content.toString()); },
		md(content) {
			const { data, content: markdownContent } = graymatter(content.toString());
			return { ...data, content: markdownContent };
		},
	};
	let parser: string | ((content: string | Uint8Array) => any) = extension;
	let c = 0;
	while (typeof parser === 'string' && 20 > c++) {
		if (parser in parsers) {
			parser = parsers[parser];
		} else if ('*' in parsers) {
			parser = parsers['*'];
		} else {
			throw new Error(`Could not parse document with '${extension}' extension.`);
		}
	}
	if (typeof parser === 'string') {
		throw new Error(`Could not parse document with '${extension}' extension.`);
	}
	const doc = parser(content);
	await postprocess(doc, filename);
	return doc;
};
