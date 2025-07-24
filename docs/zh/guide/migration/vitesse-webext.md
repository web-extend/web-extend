---
outline: deep
---

# vitesse-webext

[vitesse-webext](https://github.com/antfu-collective/vitesse-webext) 是一个非常棒的 WebExtension 项目模板。我们将其迁移到了 WebExtend。你可以使用它来创建一个新项目。

```shell
npx web-extend@latest init --template with-vitesse-webext
```

如果你想要迁移一个已有的 vitesse-webext 项目，请按照以下步骤进行。

## 安装依赖

安装 WebExtend 和 Rsbuild 的依赖，以及 Rsbuild 中处理 Vue 和 UnoCSS 的插件。

::: code-group

```shell [npm]
npm add -D @rsbuild/core web-extend
npm add -D @rsbuild/plugin-vue @unocss/postcss
```

```shell [pnpm]
pnpm add -D @rsbuild/core web-extend
pnpm add -D @rsbuild/plugin-vue @unocss/postcss
```

```shell [yarn]
yarn add -D @rsbuild/core web-extend
yarn add -D @rsbuild/plugin-vue @unocss/postcss
```

:::

更新项目中 `unocss`、 `unplugin-auto-import`、`unplugin-icons` 等依赖的版本，确保其可以在 Rsbuild 中集成。

::: code-group

```shell [npm]
npm add -D unocss@latest @unocss/reset@latest
npm add -D unplugin-auto-import@latest unplugin-icons@latest unplugin-vue-components@latest
```

```shell [pnpm]
pnpm add -D unocss@latest @unocss/reset@latest
pnpm add -D unplugin-auto-import@latest unplugin-icons@latest unplugin-vue-components@latest
```

```shell [yarn]
yarn add -D unocss@latest @unocss/reset@latest
yarn add -D unplugin-auto-import@latest unplugin-icons@latest unplugin-vue-components@latest
```

:::

## 更新 npm scripts

使用 `web-extend` 的 CLI 命令替换 `scripts` 中的 `dev`、`build`、 `pack`、 `start` 等命令。

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

## 迁移构建工具

WebExtend 底层使用 Rsbuild 作为构建工具，因此需要从 Vite 迁移至 Rsbuild。整个迁移过程比较简单，主要改动如下：

1. 创建 `web-extend.config.ts`，用于配置 WebExtend。
2. 创建 `rsbuild.config.ts`，用于配置 Rsbuild.
3. 添加插件：
   - [@rsbuild/plugin-vue](https://rsbuild.rs/plugins/list/plugin-vue)
   - [unplugin-vue-components/rspack](https://github.com/unplugin/unplugin-vue-components)
   - [unplugin-auto-import/rspack](https://github.com/unplugin/unplugin-auto-import)
   - [unplugin-icons/rspack](https://github.com/unplugin/unplugin-icons)
4. 迁移配置项：
   - `resolve.alias` -> `resolve.alias`
   - `define` -> `source.define`
   - 设置 `html.mountId: "app"`，Rsbuild 会为每个入口自动注入 HTML 文件，项目中 options、popup、sidepanel 等目录下的 HTML 文件不再被使用。
5. 支持 UnoCSS：
   - 创建 `postcss.config.mjs` ，并引入 `@unocss/postcss` 插件
   - 调整 `unocss.config.ts` 文件内容
   - 移除 JS 文件中的`import 'uno.css'`，改为在相应的 CSS 文件中添加 `@unocss;`

相关配置文件的完整内容如下：

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

如果您在项目中有其他自定义配置，请参考以下文档：

- [Rsbuild Vite](https://rsbuild.rs/guide/migration/vite)
- [UnoCSS](https://unocss.dev/integrations/postcss)

## 更新源码

WebExtend 会根据文件系统自动解析入口文件，因此无需在 `manifest.json` 中显示声明。源码内容的主要改动如下：

- 生成 icons：运行 `npx web-extend g icons --template ./extension/assets/icon-512.png` 命令在 `src/assets` 目录下生成需要的 icon 文件。
- 更改 popup、options、sidepanel：分别在对应的目录中移除 `index.html`，将 `main.ts` 重命名为 `index.ts`。
- 更改 content：将 `contentScripts` 目录重命名为 `content`。
- 更改 background: 该目录中的 `main.ts` 重命名为 `index.ts`，删除代码中的 `import.meta.hot` 相关内容。
- 移除 `manifest.ts` 中与入口路径相关的部分，只保留 `permissions`、`host_permissions` 等必要字段。

## 验证结果

恭喜 🎉 ！你已经完成了向 WebExtend 的迁移过程。现在可以使用 `npm run dev` 或 `npm run build` 命令来构建项目。WebExtend 中的产物构建目录为 `dist/[target]-[mode]`。

上述迁移过程如有纰漏之处，欢迎在 [Github 页面](https://github.com/web-extend/web-extend)提交 issue 或提交 PR 🤝。
