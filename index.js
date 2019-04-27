const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const cosmiconfig = require('cosmiconfig');
const Prerenderer = require('@prerenderer/prerenderer');
const Puppeteer = require('@prerenderer/renderer-puppeteer');
const htmlnano = require('htmlnano');
const prettyMs = require('pretty-ms');

module.exports = bundler => {
  bundler.on('buildEnd', async () => {
    if (process.env.NODE_ENV !== 'production') return;
    console.log('');
    const spinner = ora(chalk.grey('Prerendering')).start();
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
    try {
      await prerenderer.initialize();
      const start = Date.now();
      const renderedRoutes = await prerenderer.renderRoutes(routes);
      await Promise.all(
        renderedRoutes.map(async route => {
          const outputDir = path.join(outDir, route.route);
          const file = path.resolve(outputDir, 'index.html');
          mkdirp.sync(outputDir);
          const { html } = await htmlnano.process(route.html.trim());
          fs.writeFileSync(file, html);
        })
      );
      const end = Date.now();
      spinner.stopAndPersist({
        symbol: '✨ ',
        text: chalk.green(`Prerendered in ${prettyMs(end - start)}.`),
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    } finally {
      prerenderer.destroy();
    }
  });
};
