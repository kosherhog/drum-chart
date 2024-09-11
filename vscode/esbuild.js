const esbuild = require("esbuild");
const fs = require('fs');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts',
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outdir: 'dist',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
		loader: {
			'.html' : 'text', 
		}
	});

	// Copy additional files
	const copyFile = (src, dest) => {
		if (!fs.existsSync('dist'))
		{
			fs.mkdirSync('dist');
		}
		fs.copyFileSync(src, dest);
	};
	
	copyFile('node_modules/jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js', 'dist/xhr-sync-worker.js');
	copyFile('node_modules/abcjs/dist/abcjs-basic-min.js', 'dist/abcjs-basic-min.js');
	copyFile('res/view.html','dist/view.html');

	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
