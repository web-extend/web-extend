---
outline: deep
---

# CRXJS

本章介绍如何迁移一个 [CRXJS](https://crxjs.dev/vite-plugin) 项目到 WebExtend. 它们的主要区别在于 WebExtend 使用 Rsbuild 作为构建工具而不是 Vite。尽管如此，整个迁移过程非常简单，并且 Rsbuild 真的很快。完整的迁移示例参考 [from-crxjs](https://github.com/web-extend/examples/pull/7/files)。

## 安装依赖

::: code-group

```shell [npm]
npm add -D @rsbuild/core @web-extend/rsbuild-plugin web-extend web-ext
```

```shell [pnpm]
pnpm add -D @rsbuild/core @web-extend/rsbuild-plugin web-extend web-ext
```

```shell [yarn]
yarn add -D @rsbuild/core @web-extend/rsbuild-plugin web-extend web-ext
```

:::

## 更新 npm scripts

::: code-group

```json [package.json]
{
  "scripts": {
    "dev": "web-extend rsbuild:dev --open",
    "build": "web-extend rsbuild:build",
    "preview": "web-extend preview",
    "zip": "web-extend zip"
  }
}
```

:::

## 迁移构建工具

在迁移 Vite 到 Rsbuild 的过程中，主要的改动点如下。

1. 在根目录下创建 `rsbuild.config.ts`。
2. 迁移插件，参考 [rsbuild-migrating-plugins](https://rsbuild.dev/guide/migration/vite#migrating-plugins)。
3. 迁移配置项，参考 [rsbuild-configuration-migration](https://rsbuild.dev/guide/migration/vite#configuration-migration)。

示例如下。

::: code-group

```ts [rsbuild.config.ts]
import { resolve } from "node:path";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";
import manifest from "./manifest.config";

export default defineConfig({
  resolve: {
    alias: {
      "@": `${resolve(__dirname, "src")}`,
    },
  },
  plugins: [
    pluginReact(),
    pluginWebExtend({
      manifest,
    }),
  ],
});
```

:::

## 更新 mainfest

WebExtend 也支持 CRXJS 中的 `mainfest` 文件，不过需要将所有 `*.html` 入口点改为 `*.js` 入口点。

示例如下：

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

此外，WebExtend 也支持[声明式入口](../start/entrypoints.md)。如果使用这种方式，你将不再需要手动定义入口文件。

## 验证结果

恭喜 🎉 ！你已经完成了向 WebExtend 的迁移过程。现在可以使用 `npm run dev` 或 `npm run build` 命令来构建项目。WebExtend 中的产物构建目录为 `dist/[target]-[mode]`。

上述迁移过程如有纰漏之处，欢迎在 [Github 页面](https://github.com/web-extend/web-extend)提交 issue 或提交 PR 🤝。
