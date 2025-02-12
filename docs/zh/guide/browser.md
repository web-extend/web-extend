---
outline: deep
---

# 浏览器兼容性 {#browser-compatibility}

## 浏览器目标 {#browser-target}

WebExtend 支持以下浏览器目标。

- `chrome-mv3` (默认)
- `firefox-mv2` (对于 Firefox，推荐使用 MV2 版本)
- `firefox-mv3` (实验性支持，不能用于 dev 环境中)
- `safari-mv3`
- `edge-mv3`
- `opera-mv3`

其中，构建目标为 `chrome-mv3` 时，对应的构建产物可以在 Chromium 系列的浏览器中使用（包括 Chrome、Edge、Opera 等）。

自定义浏览器目标的示例如下：

::: code-group

```js [rsbuild.config.js]
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default defineConfig({
  plugins: [
    pluginWebExtend({
      target: "firefox-mv2", // default: "chrome-mv3"
    }),
  ],
});
```

:::

## Manifest 兼容 {#manifest-compatibility}

WebExtend 会基于文件系统和构建目标，自动解析和生成 `manifest.json`，因此无需额外处理不同浏览器之间 Manifest 配置的差异性。

Manifest 文档：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

## Extension API 兼容 {#extension-aip-compatibility}

WebExtend 不会处理 Extension API，如果需要兼容多个浏览器，需要在源码中手动处理。

Extension API 文档：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)

### 适用于 Chromium 系列

可以直接使用 `chrome` API。如果使用 TypeScript，推荐安装 [`@types/chrome`](https://www.npmjs.com/package/@types/chrome)。

### 适用于 Firefox

如果需要支持或兼容 Firefox 浏览器，推荐使用 [webextension-polyfill](https://www.npmjs.com/package/webextension-polyfill)，它提供了统一的浏览器扩展 API，兼容 Firefox 和 Chrome 系列。如果使用 TypeScript，还需要安装 [@types/webextension-polyfill](https://www.npmjs.com/package/@types/webextension-polyfill)。示例如下。

::: code-group

```js [src/content.js]
import browser from "webextension-polyfill";

browser.storage.local
  .set({
    [window.location.hostname]: document.title,
  })
  .then(() => {
    browser.runtime.sendMessage(
      `Saved document title for ${window.location.hostname}`
    );
  });
```

:::

## 浏览器启动 {#browser-startup}

WebExtend 基于 [`web-ext`](https://github.com/mozilla/web-ext)，实现了自动打开浏览器并运行扩展的功能。运行以下命令。

```shell
# developemnt
npx web-extend rsbuild:dev --open

# production preview
npx web-extend preview
```

WebExtend 将自动根据浏览器目标和构建目录，自动运行扩展。如果目标为 `firefox-mv2` 或 `firefox-mv3`，会打开 Firefox 浏览器，否则会打开 Chrome 浏览器。
