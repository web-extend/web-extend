# 浏览器兼容性

## 构建目标

WebExtend 支持以下浏览器目标。默认的构建目标为 `chrome-mv3`，对应的构建产物可以在 chrome 系列中的浏览器中使用（包括 Chrome、Edge、Opera 等）。

- `chrome-mv3` (默认)
- `firefox-mv3`
- `firefox-mv2`
- `safari-mv3`
- `edge-mv3`
- `opera-mv3`

自定义浏览器目标的示例如下：

::: code-group

```js [rsbuild.config.js]
export default defineConfig({
  plugins: [
    pluginWebExt({
      target: "firefox-mv2", // default: "chrome-mv3"
    }),
  ],
});
```

:::

## Manifest 兼容

WebExtend 会基于文件系统和构建目标，自动解析和生成 `manifest.json`，因此无需额外处理不同浏览器之间 Manifest 配置的差异性。

Manifest 文档：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

## Extension API 兼容

WebExtend 不会处理 Extension API，如果需要兼容多个浏览器，需要在源码中手动处理。

Extension API 文档：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)

**目标为 Chrome 系列浏览器**

可以直接使用 `chrome` API。如果使用 TypeScript，推荐安装 [`@types/chrome`](https://www.npmjs.com/package/@types/chrome)。

**目标为 Firefox 浏览器**

如果需要支持或兼容 Firefox 浏览器，推荐使用 [webextension-polyfill](https://www.npmjs.com/package/webextension-polyfill)，提供了统一的浏览器扩展 API。如果使用 TypeScript，需推荐安装 [@types/webextension-polyfill](https://www.npmjs.com/package/@types/webextension-polyfill)。示例如下。

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

## 运行扩展

WebExtend 基于 [`web-ext`](https://github.com/mozilla/web-ext)，实现了自动打开浏览器并运行扩展的功能。运行以下命令。

```shell
# developemnt
npx web-extend rsbuild:dev --open

# production preview
npx web-extend preview
```

WebExtend 会自动根据构建目标和构建目录，自动运行扩展。如果目标为 `firefox-mv2` 或 `firefox-mv3`，会打开 Firefox 浏览器，否则会打开 Chrome 浏览器。
