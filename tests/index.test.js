const path = require('path');
const childProcess = require('child_process');
const { promisify } = require('util');
const exec = promisify(childProcess.exec);
const { promises: fs } = require('fs');

function runBuild(filename) {
  return exec(`npx parcel build ${filename} -o index.html`);
}

function pathJoin(...args) {
  return path.join(__dirname, ...args);
}

const baseRoute = 'Route: ';

beforeEach(async function() {
  try {
    await fs.unlink(pathJoin('.prerenderrc'));
  } catch (e) {}
});

it('should run with default route', async function() {
  await runBuild('basic.html');
  const htmlFile = await fs.readFile(pathJoin('dist', 'index.html'), 'utf-8');
  expect(htmlFile).toEqual(expect.stringContaining(baseRoute + '/'));
});

it('should run with multiple routes', async function() {
  const routes = ['/', '/foo', '/bar'];
  await fs.writeFile('.prerenderrc', JSON.stringify(routes));
  await runBuild('basic.html');
  for (const route of routes) {
    const htmlFile = await fs.readFile(
      pathJoin('dist', route, 'index.html'),
      'utf-8'
    );
    expect(htmlFile).toEqual(expect.stringContaining(baseRoute + route));
  }
});

it('should run with nested routes', async function() {
  const route = '/foo/bar/baz';
  await fs.writeFile('.prerenderrc', JSON.stringify([route]));
  await runBuild('basic.html');
  const htmlFile = await fs.readFile(
    pathJoin('dist', route, 'index.html'),
    'utf-8'
  );
  expect(htmlFile).toEqual(expect.stringContaining(baseRoute + route));
});

it('should run with an api call', async function() {
  const config = {
    rendererConfig: {
      renderAfterDocumentEvent: 'prerender-trigger',
    },
  };
  await fs.writeFile('.prerenderrc', JSON.stringify(config));
  await runBuild('api_test.html');
  const htmlFile = await fs.readFile(pathJoin('dist', 'index.html'), 'utf-8');
  expect(htmlFile).toEqual(expect.stringContaining('Yours Truly'));
  expect(htmlFile).toEqual(expect.stringContaining('date of publication'));
  expect(htmlFile).toEqual(expect.stringContaining('Sample Slide Show'));
});
