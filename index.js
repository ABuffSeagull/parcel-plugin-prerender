const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mkdirp = require('mkdirp');
const cosmiconfig = require('cosmiconfig');
const Prerenderer = require('@prerenderer/prerenderer');
const Puppeteer = require('@prerenderer/renderer-puppeteer');
const htmlnano = require('htmlnano');
const prettyMs = require('pretty-ms');
const isRelativeUrl = require('is-relative-url');
const difference = require('lodash.difference');
const cheerio = require('cheerio');

module.exports = async bundler => {
  const { outDir, publicURL } = bundler.options;

  let routes = ['/']; // the default route
  let rendererConfig = {};
  let crawl = false;
  const found = await cosmiconfig('prerender').search();
  if (found) {
    const { config } = found;
    if (Array.isArray(config)) {
      routes = config;
    } else {
      if (config.rendererConfig) ({ rendererConfig } = config);
      if (config.routes) ({ routes } = config);
      if (config.crawl) ({ crawl } = config);
    }
  }

  const writeHtml = async route => {
    try {
      const outputDir = path.join(outDir, route.route);
      const file = path.normalize(`${outputDir}/index.html`);
      mkdirp.sync(outputDir);
      const { html } = await htmlnano.process(route.html.trim());
      fs.writeFileSync(file, html);
      const end = Date.now();
    } catch (err) {
      console.error(err);
    }
  };

  const prerenderer = new Prerenderer({
    staticDir: outDir,
    renderer: new Puppeteer(rendererConfig),
  });

  const prerenderRoutes = async routesToPrerender => {
    const results = await prerenderer.renderRoutes(routesToPrerender);
    // write html files
    await Promise.all(results.map(writeHtml));

    if (crawl) {
      const moreRoutes = results
        .reduce((acc, { html, originalRoute }) => {
          $ = cheerio.load(html);

          return [
            ...acc,
            ...$('a')
              .map((_, el) => {
                const href = $(el).attr('href');
                const pathname = isRelativeUrl(href)
                  ? url.resolve(originalRoute, href)
                  : href;

                return pathname;
              })
              .get(),
          ];
        }, [])
        .filter(route => route.startsWith(publicURL));

      const newRoutes = difference(moreRoutes, routes);
      routes = [...routes, ...newRoutes];
      if (newRoutes.length) {
        await prerenderRoutes(newRoutes);
      }
    }
  };

  bundler.on('buildEnd', async () => {
    if (process.env.NODE_ENV !== 'production') return;
    console.log('');
    const spinner = ora(chalk.grey('Prerendering')).start();

    try {
      await prerenderer.initialize();
      const start = Date.now();
      await prerenderRoutes(routes);
      const end = Date.now();

      spinner.stopAndPersist({
        symbol: '✨ ',
        text: chalk.green(`Prerendered in ${prettyMs(end - start)}.`),
      });

      prerenderer.destroy();
    } catch (err) {
      prerenderer.destroy();
      console.error(err);
    }
  });
};
