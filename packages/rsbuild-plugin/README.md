# @web-extend/rsbuild-plugin

An Rsbuild plugin for developing and building browser extensions.

<p>
  <a href="https://npmjs.com/package/@web-extend/rsbuild-plugin">
   <img src="https://img.shields.io/npm/v/@web-extend/rsbuild-plugin?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@web-extend/rsbuild-plugin?minimal=true"><img src="https://img.shields.io/npm/dm/@web-extend/rsbuild-plugin.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## Quick Start

There are two ways to use this plugin.

1. Use the `@web-extend/rsbuild-plugin` package directly.
2. Use `bext` CLI, which is a wrapper of `@web-extend/rsbuild-plugin`.

We recommend using the `bext` CLI to initialize a new extension project. Because it provides a more user-friendly experience.

### Use `@web-extend/rsbuild-plugin` directly

Install the plugin.

```bash
npm add @web-extend/rsbuild-plugin -D
```

Add the plugin to your `rsbuild.config.ts`.

```ts
import { pluginWebExtend } from '@web-extend/rsbuild-plugin';

export default {
  plugins: [pluginWebExtend()],
};
```

Development workflow:

- Run `npm run dev` to start the development server.
- Enable developer mode in browser extensions page and load the `dist` directory.
- Run `npm run build` to build for production.

### Use `bext` CLI

Run the following command to initialize a new extension project.

```bash
npx bext@latest init
```

## Documentation

https://web-extend.github.io/web-extend

## License

[MIT](./LICENSE)
