---
outline: deep
---

# vitesse-webext

本章介绍如何从 [vitesse-webext](https://github.com/antfu-collective/vitesse-webext) 迁移到 WebExtend。完整的迁移代码可以参考 [examples/vitesse-webext](https://github.com/web-extend/examples/pull/4/files)。

## 安装依赖

安装 WebExtend 的依赖。

```shell
npm add -D @rsbuild/core @web-extend/rsbuild-plugin web-extend
```

安装 Rsbuild 中处理 Vue 和 UnoCSS 的插件。

```shell
npm add -D @rsbuild/plugin-vue @unocss/postcss
```

更新项目中 `unocss`、 `unplugin-auto-import`、`unplugin-icons` 等依赖的版本，确保其可以在 Rsbuild 中集成。

```shell
npm add -D unocss@latest @unocss/reset@latest
npm add -D unplugin-auto-import@latest
npm add -D unplugin-icons@latest
```

## 更新 npm scripts

在 package.json 中添加 `"type": "module"` 字段，并使用 `web-extend` 的 CLI 命令替换 `scripts` 中含有的 `dev`、`build`、 `pack`、 `start` 等命令。

::: details package.json

```json [package.json]
{
  "type": "module", // [!code ++]
  "scripts": {
    "dev": "npm run clear && cross-env NODE_ENV=development run-p dev:*", // [!code --]
    "dev-firefox": "npm run clear && cross-env NODE_ENV=development EXTENSION=firefox run-p dev:*", // [!code --]
    "dev:prepare": "esno scripts/prepare.ts", // [!code --]
    "dev:background": "npm run build:background -- --mode development", // [!code --]
    "dev:web": "vite", // [!code --]
    "dev:js": "npm run build:js -- --mode development", // [!code --]
    "dev": "web-extend rsbuild:dev --open", // [!code ++]
    "dev:firefox": "web-extend rsbuild:dev --open --target firefox-mv2", // [!code ++]

    "build": "cross-env NODE_ENV=production run-s clear build:web build:prepare build:background build:js", // [!code --]
    "build:prepare": "esno scripts/prepare.ts", // [!code --]
    "build:background": "vite build --config vite.config.background.mts", // [!code --]
    "build:web": "vite build", // [!code --]
    "build:js": "vite build --config vite.config.content.mts", // [!code --]
    "build": "web-extend rsbuild:build", // [!code ++]
    "build:firefox": "web-extend rsbuild:build --target firefox-mv2", // [!code ++]

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

## 迁移构建工具

Webextend 底层使用 Rsbuild 作为构建工具，从 Vite 迁移到 Vite 非常简单，主要改动如下：

1. 在项目根目录下创建 `rsbuild.config.ts` 配置文件。
2. 添加插件：
   - `@web-extend/rsbuild-plugin`
   - `@rsbuild/plugin-vue`
   - `unplugin-vue-components/rspack`
   - `unplugin-auto-import/rspack`
   - `unplugin-icons/rspack`
3. 迁移配置项：
   - `resolve.alias` -> `resolve.alias`
   - `define` -> `source.define`
   - 添加 `html.mountId: "app"`，Rsbuild 会为每个入口自动注入 HTML 文件，项目中 options、popup、sidepanel 等目录下的 HTML 文件不再被使用。
4. 支持 UnoCSS：
   - 创建 `postcss.config.mjs` 文件，引入 UnoCSS 插件
   - 更改 `unocss.config.ts` 文件内容
   - 移除 js 入口文件中的`import 'uno.css'`，改为在 css 入口文件中添加 `@unocss;`

相关配置文件的完整内容如下：

::: details rsbuild.config.ts

```ts
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";
import { pluginVue } from "@rsbuild/plugin-vue";
import Components from "unplugin-vue-components/rspack";
import AutoImport from "unplugin-auto-import/rspack";
import Icons from "unplugin-icons/rspack";
import IconsResolver from "unplugin-icons/resolver";
import { isDev, r } from "./scripts/utils";
import packageJson from "./package.json";
import manifest from "./src/manifest";

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginWebExtend({
      manifest,
    }),
  ],
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

如果您在项目中有其他自定义配置，请参考：

- [Rsbuild Vite](https://rsbuild.dev/guide/migration/vite)
- [UnoCSS](https://unocss.dev/integrations/postcss)

## 更新源码

WebExtend 使用声明式入口，无需在 `manifest.json` 中显示声明。核心变更如下：

- 更改 icons：使用 `npx web-extend g icons --template ./extension/assets/icon-512.png` 生成 icon 文件。
- 更改 popup、options、sidepanel：分别在对应的目录中移除 `index.html` 文件， `main.ts` 重命名为 `index.ts`。
- 更改 contentScripts：该目录重命名为 `content`。
- 更改 background: 移除 `index.ts` 文件中的 `import.meta.hot` 相关内容。
- 移除 `manifest.ts` 中与入口路径相关的部分，只保留 `permissions`、`host_permissions` 等必要字段。
- 移除 `extension` 目录。WebExtend 中的产物构建目录为 `dist/[target]-[mode]`，该目录不在被使用。如果源码中有引用该目录，请使用新的产物目录。

## 验证结果

完成以上步骤后，您已经完成了从 vitesse-webext 向 WebExtend 的基本迁移，可以使用 `npm run dev` 或 `npm run build` 命令来尝试构建。

::: info 注意
WebExtend 中的产物构建目录为 `dist/[target]-[mode]`，而不是 `extension` 目录。
:::

上述迁移过程如有遗漏，欢迎指出。您可以直接在 Github 页面提交 issue 或提交 PR 🤝。
