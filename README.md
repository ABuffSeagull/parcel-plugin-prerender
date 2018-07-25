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
in order to add more paths, add an array of strings corresponding to the paths you want rendered in a 
`prerender` key in your `package.json`, or a JSON or YAML `.prerenderrc` file, or export the key in a `prerender.config.js` file.

### Example

```json
{
  "prerender": ["/", "/about", "/login", "/deep/nested/route"]
}
```

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

## More options

More options are planned for passing through to the prerenderer.
