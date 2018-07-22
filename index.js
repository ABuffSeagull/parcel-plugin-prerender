const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const Prerenderer = require('@prerenderer/prerenderer');
const Puppeteer = require('@prerenderer/renderer-puppeteer');

module.exports = bundler => {
  const { outDir } = bundler.options;
  const prerenderer = new Prerenderer({
    staticDir: outDir,
    renderer: new Puppeteer(),
  });
  bundler.on('buildEnd', async () => {
    if (process.env.NODE_ENV !== 'production') return;
    console.log(chalk.bold('\nRendering...'));
    try {
      await prerenderer.initialize()
      const start = new Date().getTime();
      const renderedRoutes = await prerenderer.renderRoutes(['/', '/test']);
      const end = new Date().getTime();
  		renderedRoutes.forEach(route => {
    		try {
					const outputDir = path.join(outDir, route.route);
					const file = path.normalize(`${outputDir}/index.html`);
					mkdirp.sync(outputDir);
					fs.writeFileSync(file, route.html.trim());
					const end = new Date().getTime();
    		} catch (err) {
      		console.error(err);
    		}
  		});
			console.log(`Finished rendering in ${end - start}ms.`);
  		prerenderer.destroy();
		} catch (err) {
  		prerenderer.destroy();
  		console.error(err);
		}
  });
}
