import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { watch } from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let debounceChangesTimeout = null;
watch(['{scripts,src}/**/*'], { ignoreInitial: false })
	.addListener('all', () => {
		if (debounceChangesTimeout) clearTimeout(debounceChangesTimeout);
		debounceChangesTimeout = setTimeout(() => {
			try {
				execSync(`node ${__dirname}/build.mjs`, { stdio: 'inherit' });
			} catch (error) {
				console.error(error);
				console.error('Build failed.');
			}
		}, 250);
	});
