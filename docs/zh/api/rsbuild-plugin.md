---
outline: deep
---

# @web-extend/rsbuild

`@web-extend/rsbuild` 是 Rsbuild 的一个插件。WebExtend 使用 Rsbuild 作为底层构建工具，该插件用于对扩展的入口文件进行构建。

## 使用

::: code-group

```js [rsbuild.config.js]
import { defineConfig } from '@rsbuild/core';
import { pluginWebExt } from 'rsbuild-plugin-web-ext';

export default defineConfig({
  plugins: [
    pluginWebExt({
      srcDir: "src", // default: "src"
      outDir: "dist", // default: "dist/[target]-[mode]"
      manifest: {...}, // default: {}
      target: "firefox-mv2", // default: "chrome-mv3"
    }),
  ],
});
```

:::

## 选项

### manifest

显示配置 `manifest`，默认为 `{}`。WebExtend 会结合 `manifest` 选项和入口文件，在构建时自动生成 `manifest.json`。

### target

设置目标浏览器，支持：

- `chrome-mv3` (默认)
- `firefox-mv3`
- `firefox-mv2`
- `safari-mv3`
- `edge-mv3`
- `opera-mv3`

### srcDir

设置源码目录，默认为项目跟路径下的 `src` 目录，如果 `./src` 目录不存在，则默认为项目根目录。

### outDir

设置构建产物目录，默认为 `dist/[target]-[mode]`，比如 `dist/chrome-mv3-dev`（开发环境）、`dist/chrome-mv3-prod`（生成环境）。
