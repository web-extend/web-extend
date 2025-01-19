---
outline: deep
---

# @web-extend/rsbuild-plugin

[`@web-extend/rsbuild`](https://www.npmjs.com/package/@web-extend/rsbuild-plugin) 是 WebExtend 提供的一个 Rsbuild 插件，用于解析入口、构建扩展等。

## 使用 {#usage}

::: code-group

```js [rsbuild.config.js]
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default defineConfig({
  plugins: [pluginWebExtend()],
});
```

:::

## 选项 {#options}

### manifest

`manifest` 配置，默认为 `{}`。WebExtend 会合并 `manifest` 选项和入口文件信息（前者有更高的优先级），在构建时自动生成 `manifest.json`。

[manifest 映射](../guide/project-structure.md#manifest-mapping)

### target

目标浏览器，支持：

- `chrome-mv3` (默认)
- `firefox-mv3`
- `firefox-mv2`
- `safari-mv3`
- `edge-mv3`
- `opera-mv3`

### srcDir

源码目录，默认为项目跟路径下的 `./src` 目录，如果 `./src` 目录不存在，则默认为项目根目录。

### outDir

设置构建产物目录，默认为 `dist/[target]-[mode]`，比如 `dist/chrome-mv3-dev`（开发环境）、`dist/chrome-mv3-prod`（生产环境）。
