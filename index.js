const fs = require('fs');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const cosmiconfig = require('cosmiconfig');
const Prerenderer = require('@prerenderer/prerenderer');
const Puppeteer = require('@prerenderer/renderer-puppeteer');
const htmlnano = require('htmlnano');
const prettyMs = require('pretty-ms');

module.exports = function prerender(bundler) {
  bundler.on('buildEnd', async () => {
    if (process.env.NODE_ENV !== 'production') return;
    console.log('');
    const spinner = ora(chalk.grey('Prerendering')).start();
    let routes = ['/']; // the default route
    let rendererConfig = {};
    let serverConfig = {};
    const found = await cosmiconfig('prerender').search();
    if (found) {
      const { config } = found;
      if (Array.isArray(config)) {
        routes = config;
      } else {
        if (config.rendererConfig) ({ rendererConfig } = config);
        if (config.serverConfig) ({ serverConfig } = config);
        if (config.routes) ({ routes } = config);
      }
    }
    const { outDir } = bundler.options;
    const prerenderer = new Prerenderer({
      staticDir: outDir,
      server: serverConfig,
      renderer: new Puppeteer(rendererConfig),
    });
    try {
      await prerenderer.initialize();
      const start = Date.now();
      const renderedRoutes = await prerenderer.renderRoutes(routes);
      await Promise.all(renderedRoutes.map(async route => {
        const outputDir = path.join(outDir, route.route);
        const file = path.resolve(outputDir, 'index.html');
        mkdirp.sync(outputDir);
        const { html } = await htmlnano.process(route.html.trim());
        // eslint-disable-next-line no-sync
        fs.writeFileSync(file, html);
      }));
      const end = Date.now();
      spinner.stopAndPersist({
        symbol: '✨ ',
        text: chalk.green(`Prerendered in ${prettyMs(end - start)}.`),
      });
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line unicorn/no-process-exit, no-process-exit
      process.exit(1);
    } finally {
      prerenderer.destroy();
    }
  });
};
