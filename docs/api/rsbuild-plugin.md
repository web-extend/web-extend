---
outline: deep
---

# @web-extend/rsbuild-plugin

[`@web-extend/rsbuild-plugin`](https://www.npmjs.com/package/@web-extend/rsbuild-plugin) is an Rsbuild plugin used to parse entry files, and build the extension, etc.

## Usage

::: code-group

```js [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default defineConfig({
  plugins: [pluginWebExtend()],
});
```

:::

## Options

### manifest

Custom `manifest` configuration which defaults to `{}`. WebExtend will merge the `manifest` option and the fields parsed from entry files (the previous is prior), and generate `manifest.json` automatically.

### target

Custom browser target which suppports the following targets.

- `chrome-mv3` (default)
- `firefox-mv2` (recommended for Firefox)
- `firefox-mv3` (experimental, doesn't work in dev mode)
- `safari-mv3`
- `edge-mv3`
- `opera-mv3`

### srcDir

Custom source directory which defaults to the `./src` directory, falling back to the project root path if `./src` doesn't exists.

### outDir

Custom dist path which defaults to the `dist/[target]-[mode]` directory, such as `dist/chrome-mv3-dev` (in development mode) or`dist/chrome-mv3-prod` (in production mode).
