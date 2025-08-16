# @web-extend/rsbuild-plugin

[`@web-extend/rsbuild-plugin`](https://www.npmjs.com/package/@web-extend/rsbuild-plugin) is an Rsbuild plugin for developing and building browser extensions.

We recommend using the [`web-extend`](./web-extend.md) package. It has built-in this plugin and provides a better user experience.

If you want to use this plugin directly, please follow the instructions below.

## Usage

Install the plugin.

```bash
npm add @web-extend/rsbuild-plugin -D
```

Add the plugin to Rsbuild Config.

```ts [rsbuild.config.ts]
import { pluginWebExtend } from '@web-extend/rsbuild-plugin';

export default {
  plugins: [
    pluginWebExtend({
      /* options */
    }),
  ],
};
```

Development workflow:

- Run `npm run dev` to start the development server.
- Enable developer mode in browser extensions page and load the `dist` directory.
- Run `npm run build` to build for production.

## Options

It supports the following options, which are the same as the `web-extend` package.

- [`entriesDir`](./web-extend.md#entriesdir)
- [`outDir`](./web-extend.md#outdir)
- [`publicDir`](./web-extend.md#publicdir)
- [`manifest`](./web-extend.md#manifest)
- [`target`](./web-extend.md#target)
