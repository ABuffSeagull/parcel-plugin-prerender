const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const cosmiconfig = require('cosmiconfig');
const Prerenderer = require('@prerenderer/prerenderer');
const Puppeteer = require('@prerenderer/renderer-puppeteer');

module.exports = bundler => {
  bundler.on('buildEnd', async () => {
    if (process.env.NODE_ENV !== 'production') return;
    const { outDir } = bundler.options;
    const prerenderer = new Prerenderer({
      staticDir: outDir,
      renderer: new Puppeteer(),
    });
    const explorer = cosmiconfig('prerender');
    const {
      config: { routes },
    } = (await explorer.search()) || { config: { routes: ['/'] } };
    console.log(chalk.bold('\nRendering...'));
    try {
      await prerenderer.initialize();
      const start = new Date().getTime();
      const renderedRoutes = await prerenderer.renderRoutes(routes);
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
};
