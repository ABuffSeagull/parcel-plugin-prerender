# parcel-plugin-prerender

## About

Much like the [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin/blob/master/README.md)
for [Webpack](https://github.com/webpack/webpack), this plugin is to bring prerendering capabilities to
[Parcel](https://github.com/parcel-bundler/parcel). It is meant to be a drop-in solution for any site or single-page-app.

### Installation
```
npm install parcel-plugin-prerender -D
```

### Usage
By default, this plugin will render the `/` path.
As this plugin uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig),
in order to configure the plugin,
pass the configuration options in a `prerender` key in your `package.json`,
or a JSON or YAML `.prerenderrc` file, or export the config object in a `prerender.config.js` file.

### Example

If you just want to render multiple routes, you can pass a plain array in any of the above ways:
```json
// .prerenderrc
["/", "/about", "/login", "/deep/nested/route"]
```

Otherwise, you must pass it in a `routes` key, in order to configure the renderer, as follows.

### Render configuration

You can configure the renderer (browser) options by using the following example config:

```json
{
  "routes": ["/", "/about"],
  "rendererConfig": {
    "renderAfterDocumentEvent": "prerender-trigger"
  }
}
```

This is particularly useful if you'd like to pre-fetch some API data or async config
and make that part of your pre-rendered HTML.

In the example above, the `/` and `/about` pages will only be rendered when the custom DOM event `prerender-trigger` is dispatched.

You can do so in your code like the following:

```js
document.dispatchEvent(new Event('prerender-trigger'));
```

The custom configuration can also be useful for debugging. If the resulting html does not look like what you're expecting you could use the following configuration:

```json
{
  "routes": ["/", "/about"],
  "rendererConfig": {
    "headless": false
  }
}
```

To make the pre-render browser visible and you would be available to debug.

To see all the options available see this [documentation](https://github.com/Tribex/prerenderer#prerendererrenderer-puppeteer-options)

## What is Prerendering?

To quote [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin/blob/master/README.md):

> Recently, SSR (Server Side Rendering) has taken the JavaScript front-end world by storm. The fact that you can now render your sites and apps on the server before sending them to your clients is an absolutely *revolutionary* idea (and totally not what everyone was doing before JS client-side apps got popular in the first place...)
>
> However, the same criticisms that were valid for PHP, ASP, JSP, (and such) sites are valid for server-side rendering today. It's slow, breaks fairly easily, and is difficult to implement properly.
>
> Thing is, despite what everyone might be telling you, you probably don't *need* SSR. You can get almost all the advantages of it (without the disadvantages) by using **prerendering.** Prerendering is basically firing up a headless browser, loading your app's routes, and saving the results to a static HTML file. You can then serve it with whatever static-file-serving solution you were using previously. It *just works* with HTML5 navigation and the likes. No need to change your code or add server-side rendering workarounds.
>
> In the interest of transparency, there are some use-cases where prerendering might not be a great idea.
>
> - **Tons of routes** - If your site has hundreds or thousands of routes, prerendering will be really slow. Sure you only have to do it once per update, but it could take ages. Most people don't end up with thousands of static routes, but just in-case...
> - **Dynamic Content** - If your render routes that have content that's specific to the user viewing it or other dynamic sources, you should make sure you have placeholder components that can display until the dynamic content loads on the client-side. Otherwise it might be a tad weird.

## Available Renderers

Currently only `@prerenderer/renderer-puppeteer` is supported, although `@prerenderer/renderer-jsdom` 
will probably be supported in the future
