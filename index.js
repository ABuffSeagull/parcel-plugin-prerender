const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const cosmiconfig = require('cosmiconfig');
const Prerenderer = require('@prerenderer/prerenderer');
const Puppeteer = require('@prerenderer/renderer-puppeteer');
const htmlnano = require('htmlnano');

module.exports = bundler => {
  bundler.on('buildEnd', async () => {
    if (process.env.NODE_ENV !== 'production') return;
    let routes = ['/']; // the default route
    let rendererConfig = {};
    const found = await cosmiconfig('prerender').search();
    if (found) {
      const { config } = found;
      if (Array.isArray(config)) {
        routes = config;
      } else {
        if (config.rendererConfig) ({ rendererConfig } = config);
        if (config.routes) ({ routes } = config);
      }
    }
    const { outDir } = bundler.options;
    const prerenderer = new Prerenderer({
      staticDir: outDir,
      renderer: new Puppeteer(rendererConfig),
    });
    console.log('\nRendering...');
    try {
      await prerenderer.initialize();
      const start = Date.now();
      const renderedRoutes = await prerenderer.renderRoutes(routes);
      const end = Date.now();
      await Promise.all(renderedRoutes.map(async route => {
        try {
          const outputDir = path.join(outDir, route.route);
          const file = path.normalize(`${outputDir}/index.html`);
          mkdirp.sync(outputDir);
          const {html} = await htmlnano.process(route.html.trim());
          fs.writeFileSync(file, html);
          const end = Date.now();
        } catch (err) {
          console.error(err);
        }
      }));
      console.log(`Finished rendering in ${end - start}ms.`);
      prerenderer.destroy();
    } catch (err) {
      prerenderer.destroy();
      console.error(err);
    }
  });
};
