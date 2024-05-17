import { execSync } from 'node:child_process';
import { rmSync, readdirSync, mkdirSync, renameSync, writeFileSync, readFileSync, realpathSync, cpSync } from 'node:fs';
import { join, dirname, relative, normalize, extname } from 'node:path';
import * as semver from 'semver';

const DIST_DIR = 'package';
const TSC_TEMP_DIR = 'tsc_temp';

const tsc = (() => {
	const tscBin = normalize('./node_modules/.bin/tsc');
	return (format, opts = {}) => {
		opts.outDir = TSC_TEMP_DIR;
		opts.module = format === 'cjs' ? 'CommonJS' : 'ESNext';
		opts.moduleResolution = 'node10';
		try {
			rmSync(TSC_TEMP_DIR, { force: true, recursive: true });
			execSync(
				`${tscBin} ${Object.entries(opts).map(([k, v]) => `--${k} "${v}"`).join(' ')}`,
				{ stdio: 'inherit' }
			);
			const files = readdirSync(TSC_TEMP_DIR, { recursive: true, withFileTypes: true });
			for (const file of files) {
				if (!file.isFile()) continue;

				const source = join(file.path, file.name);
				const target = join(DIST_DIR, relative(TSC_TEMP_DIR, source)).slice(0, -3) + format.slice(0, 1) + source.slice(-2);
				mkdirSync(dirname(target), { recursive: true });

				if (format === 'cjs' && ['.mts', '.mjs'].includes(extname(source))) {
					writeFileSync(
						target,
						readFileSync(source, 'utf8')
							.replace(/(import|require)\((["']\.\.?\/.+?)\.mjs(["'])\)/g, `$1($2.${format}$3)`)
							.replace(/(import|export)\s+((?:\{[^}]*?\}|\w+|\*\s+as\s+\w+)\s+from\s+)?(["']\.\.?\/.+?)\.mjs(["']);?/g, `$1 $2$3.${format}$4;`)
					);
				} else {
					renameSync(source, target);
				}
			}
		} finally {
			rmSync(TSC_TEMP_DIR, { force: true, recursive: true });
		}
	};
})();


// Start clean
rmSync(DIST_DIR, { force: true, recursive: true });

// Generate CJS version
tsc('cjs');

// Generate ESM version
tsc('mjs');

// Copy common files
['LICENSE', 'README.md'].forEach(x => cpSync(x, DIST_DIR + '/' + x));

// Create package.json
if (realpathSync(DIST_DIR) !== process.cwd()) {
	const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
	delete packageJson.private;
	delete packageJson.scripts;
	delete packageJson.devDependencies;

	const ciTag = process.env.CI_TAG; // eg. "v1.0.0"
	if (ciTag) {
		const parsed = semver.coerce(ciTag);
		if (parsed) {
			packageJson.version = parsed.version;
		}
	}
	writeFileSync(DIST_DIR + '/package.json', JSON.stringify(packageJson, null, 2));
}
