---
outline: deep
---

# CRXJS

This chaptor introduces how to migrate a [CRXJS](https://crxjs.dev/vite-plugin) project to WebExtend. The main difference between WebExtend and CRXJS is WebExtend using Rsbuild as the bundler instead of Vite. Nevertheless, the migration process is simple and Rsbuild is really fast. Here is a migration example [from-crxjs](https://github.com/web-extend/examples/pull/7/files).

## Installing dependencies

Install the following dependencies.

::: code-group

```shell [npm]
npm add -D web-extend @rsbuild/core web-ext
```

```shell [pnpm]
pnpm add -D web-extend @rsbuild/core web-ext
```

```shell [yarn]
yarn add -D web-extend @rsbuild/core web-ext
```

:::

## Updating npm scripts

Next, update scripts with the following WebExtend's CLI commands in `package.json`.

::: code-group

```json [package.json]
{
  "scripts": {
    "dev": "web-extend dev --open",
    "build": "web-extend build",
    "preview": "web-extend preview",
    "zip": "web-extend zip"
  }
}
```

:::

## Migrate bundler

When migrating bundler from Vite to Rsbuild, the main changes are as follows.

1. Create `web-extend.config.ts` for manifest configuration.
2. Create `rsbuild.config.ts` for bundler configuration.
3. Migrate plugins, see [rsbuild-migrating-plugins](https://rsbuild.rs/guide/migration/vite#migrating-plugins).
4. Migrate configuration, see [rsbuild-configuration-migration](https://rsbuild.rs/guide/migration/vite#configuration-migration).

For example:

::: code-group

```ts [web-extend.config.ts]
import { defineConfig } from "web-extend";
import manifest from "./manifest.config";

export default defineConfig({
  manifest,
});
```

```ts [rsbuild.config.ts]
import { resolve } from "node:path";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  resolve: {
    alias: {
      "@": `${resolve(__dirname, "src")}`,
    },
  },
  plugins: [pluginReact()],
});
```

:::

## Updating mainfest

The `mainfest` file in CRXJS is also supported in WebExtend. For adaption, you need to modify all `*.html` entry points to `*.js` entry points.

Example.

::: code-group

```ts [manifest.config.ts]
import pkg from "./package.json"; // [!code --]

export default {
  manifest_version: 3, // no more need [!code --]
  name: pkg.name, // no more need [!code --]
  version: pkg.version, // no more need [!code --]
  action: {
    default_popup: "src/popup/index.html", // [!code --]
    default_popup: "src/popup/main.tsx", // [!code ++]
  },
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: ["https://*/*"],
    },
  ],
};
```

:::

Additionally, WebExend also supports [declarative entrypoints](../essentials/entrypoints.md), which parses entry files based on the file system and generates the corresponding fields for `manifest.json`, so you no longer need to define entrypoints manually.

## Validating results

Congratulations 🎉 ! You have done the basic migration. Now you can run `npm run dev` or `npm run build`. The extension's artifact directory is `dist/[target]-[mode]`.

If there is any omission or mistake, welcome to submit an issue or a PR from [the Github page](https://github.com/web-extend/web-extend) 🤝.
