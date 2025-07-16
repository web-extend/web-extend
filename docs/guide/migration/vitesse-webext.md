---
outline: deep
---

# vitesse-webext

This chapter introduces how to migrate a [vitesse-webext](https://github.com/antfu-collective/vitesse-webext) project to WebExtend. Here is a migration example [from-vitesse-webext](https://github.com/web-extend/examples/pull/4/files).

## Installing dependencies

Install the following dependencies.

::: code-group

```shell [npm]
npm add -D web-extend @rsbuild/core
npm add -D @rsbuild/plugin-vue @unocss/postcss
```

```shell [pnpm]
pnpm add -D web-extend @rsbuild/core
pnpm add -D @rsbuild/plugin-vue @unocss/postcss
```

```shell [yarn]
yarn add -D web-extend @rsbuild/core
yarn add -D @rsbuild/plugin-vue @unocss/postcss
```

:::

Update the versions of the following dependencies, guaranteeing they can be integrated into Rsbuild.

::: code-group

```shell [npm]
npm add -D unocss@latest @unocss/reset@latest
npm add -D unplugin-auto-import@latest
npm add -D unplugin-icons@latest
```

```shell [pnpm]
pnpm add -D unocss@latest @unocss/reset@latest
pnpm add -D unplugin-auto-import@latest
pnpm add -D unplugin-icons@latest
```

```shell [yarn]
yarn add -D unocss@latest @unocss/reset@latest
yarn add -D unplugin-auto-import@latest
yarn add -D unplugin-icons@latest
```

:::

## Updating npm scripts

Next, add the `"type": "module"` field and update scripts with the following WebExtend's CLI commands in `package.json`.

::: details package.json

```json
{
  "type": "module", // [!code ++]
  "scripts": {
    "dev": "npm run clear && cross-env NODE_ENV=development run-p dev:*", // [!code --]
    "dev-firefox": "npm run clear && cross-env NODE_ENV=development EXTENSION=firefox run-p dev:*", // [!code --]
    "dev:prepare": "esno scripts/prepare.ts", // [!code --]
    "dev:background": "npm run build:background -- --mode development", // [!code --]
    "dev:web": "vite", // [!code --]
    "dev:js": "npm run build:js -- --mode development", // [!code --]
    "dev": "web-extend dev --open", // [!code ++]
    "dev:firefox": "web-extend dev --open --target firefox-mv2", // [!code ++]

    "build": "cross-env NODE_ENV=production run-s clear build:web build:prepare build:background build:js", // [!code --]
    "build:prepare": "esno scripts/prepare.ts", // [!code --]
    "build:background": "vite build --config vite.config.background.mts", // [!code --]
    "build:web": "vite build", // [!code --]
    "build:js": "vite build --config vite.config.content.mts", // [!code --]
    "build": "web-extend build", // [!code ++]
    "build:firefox": "web-extend build --target firefox-mv2", // [!code ++]

    "pack": "cross-env NODE_ENV=production run-p pack:*", // [!code --]
    "pack:zip": "rimraf extension.zip && jszip-cli add extension/* -o ./extension.zip", // [!code --]
    "pack:crx": "crx pack extension -o ./extension.crx", // [!code --]
    "pack:xpi": "cross-env WEB_EXT_ARTIFACTS_DIR=./ web-ext build --source-dir ./extension --filename extension.xpi --overwrite-dest", // [!code --]
    "zip": "web-extend zip", // [!code ++]
    "zip:firefox": "web-extend zip --target firefox-mv2", // [!code ++]

    "start:chromium": "web-ext run --source-dir ./extension --target=chromium", // [!code --]
    "start:firefox": "web-ext run --source-dir ./extension --target=firefox-desktop", // [!code --]
    "preview": "web-extend preview", // [!code ++]
    "preview:firefox": "web-extend preview --target firefox-mv2", // [!code ++]

    "clear": "rimraf --glob extension/dist extension/manifest.json extension.*" // [!code --]
  }
}
```

:::

## Migrate bundler

WebExtend uses Rsbuild under the hood, so you need to migrate the bundler from Vite to Rsbuild. Nevertheless, the migration process is easy, and the main changes are as follows.

1. Create `web-extend.config.ts` for manifest configuration.
2. Create `rsbuild.config.ts` for bundler configuration.
3. Add the following plugins.
   - [@rsbuild/plugin-vue](https://rsbuild.rs/plugins/list/plugin-vue)
   - [unplugin-vue-components/rspack](https://github.com/unplugin/unplugin-vue-components)
   - [unplugin-auto-import/rspack](https://github.com/unplugin/unplugin-auto-import)
   - [unplugin-icons/rspack](https://github.com/unplugin/unplugin-icons)
4. Migrate the following config.
   - `resolve.alias` -> `resolve.alias`
   - `define` -> `source.define`
   - set `html.mountId: "app"`. Rsbuild will inject an HTML file for each entry file, so the original HTML files in source are useless.
5. Support UnoCSS.
   - Create `postcss.config.mjs`, and import the `@unocss/postcss` plugin.
   - Adjust the content of `unocss.config.ts`.
   - Remove `import 'uno.css'` from JS files, and insert `@unocss;` into the corresponding CSS files.

The full list of all config are as follows.

::: details web-extend.config.ts

```ts
import { defineConfig } from "web-extend";
import manifest from "./src/manifest";

export default defineConfig({
  manifest,
});
```

:::

::: details rsbuild.config.ts

```ts
import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import Components from "unplugin-vue-components/rspack";
import AutoImport from "unplugin-auto-import/rspack";
import Icons from "unplugin-icons/rspack";
import IconsResolver from "unplugin-icons/resolver";
import { isDev, r } from "./scripts/utils";
import packageJson from "./package.json";
import manifest from "./src/manifest";

export default defineConfig({
  plugins: [pluginVue()],
  html: {
    mountId: "app",
  },
  resolve: {
    alias: {
      "~/": "./src/",
    },
  },
  source: {
    define: {
      __DEV__: isDev,
      __NAME__: JSON.stringify(packageJson.name),
    },
  },
  tools: {
    rspack: {
      plugins: [
        AutoImport({
          imports: [
            "vue",
            {
              "webextension-polyfill": [["=", "browser"]],
            },
          ],
          dts: r("src/auto-imports.d.ts"),
        }),

        Components({
          dirs: [r("src/components")],
          // generate `components.d.ts` for ts support with Volar
          dts: r("src/components.d.ts"),
          resolvers: [
            // auto import icons
            IconsResolver({
              prefix: "",
            }),
          ],
        }),

        Icons(),
      ],
    },
  },
});
```

:::

::: details postcss.config.mjs

```js
import UnoCSS from "@unocss/postcss";

export default {
  plugins: [UnoCSS()],
};
```

:::

::: details unocss.config.ts

```js
import { defineConfig } from "unocss/vite";
import { presetAttributify, presetIcons, presetWind3 } from "unocss";

export default defineConfig({
  content: {
    filesystem: [
      "src/**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}",
      "!src/**/*.d.ts",
    ],
  },
  presets: [presetWind3(), presetAttributify(), presetIcons()],
});
```

:::

To custom other config in the project, please refer to:

- [Rsbuild Vite](https://rsbuild.rs/guide/migration/vite)
- [UnoCSS](https://unocss.dev/integrations/postcss)

## Updating source code

WebExtend uses the file system to parse entry files and generates the corresponding fields for `manifest.json`. So you don't need to define them explicitly any more. The main changes are as follows.

- Generate icons: run `npx web-extend g icons --template ./extension/assets/icon-512.png` to generate icon files under the `src/assets` directory.
- Change popup, options and sidepanel: remove `index.html` and rename `main.ts` to `index.ts` respectively.
- Change content: rename the `contentScripts` directory to `content`.
- Change background: rename `main.ts` to `index.ts`, and remove `import.meta.hot` related content in code.
- Remove useless code about entries in `manifest.ts` and retain the `permissions`, `host_permissions`, etc, fields.

## Validating results

Congratulations 🎉 ! You have done the basic migration. Now you can run `npm run dev` or `npm run build`. The extension's artifact directory is `dist/[target]-[mode]`.

If there is any omission or mistake, welcome to submit an issue or a PR from [the Github page](https://github.com/web-extend/web-extend) 🤝.
