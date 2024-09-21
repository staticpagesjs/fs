import YAML from 'js-yaml';
import graymatter from 'gray-matter';

type PostProcessCallback = (doc: any, filename: string) => Promise<any> | any;

const autoUrl = (doc: any, filename: string) => {
	if (doc && typeof doc === 'object' && !('url' in doc)) {
		doc.url = filename.substring(0, filename.lastIndexOf('.')).replace(/\\/g, '/');
	}
};

export const defaultParser = (
	extensions: Record<string, (content: string | Uint8Array) => any> = {},
	postprocess: PostProcessCallback = autoUrl
) => async (
	content: string | Uint8Array,
	filename: string
) => {
	const dot = filename.lastIndexOf('.');
	if (dot < 1) {
		throw new Error(`Could not parse document without an extension.`);
	}
	const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
	let doc: any;
	if (extension in extensions) {
		doc = extensions[extension](content);
	} else {
		switch (extension) {
			case 'json':
				doc = JSON.parse(content.toString());
				break;

			case 'yaml':
			case 'yml':
				doc = YAML.load(content.toString());
				break;

			case 'md':
			case 'markdown':
				const { data, content: markdownContent } = graymatter(content.toString());
				doc = { ...data, content: markdownContent };
				break;

			default:
				throw new Error(`Could not parse document with '${extension}' extension.`);
		}
	}
	await postprocess(doc, filename);
	return doc;
};
