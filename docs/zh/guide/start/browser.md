---
outline: deep
---

# 浏览器支持 {#browser-support}

## 扩展目标 {#extension-target}

WebExtend 支持以下浏览器扩展目标。

- `chrome-mv3` (默认)
- `firefox-mv2` (对于 Firefox，推荐使用 MV2 版本)
- `firefox-mv3` (实验性支持，不能用于 dev 环境中)
- `safari-mv3`
- `edge-mv3`
- `opera-mv3`

当构建目标为 `chrome-mv3` 时，对应的构建产物可以在 Chromium 系列的浏览器中使用（包括 Chrome、Edge、Brave、Opera 等）。

可以为 `web-extend` 的下列子命令传递 `--target` 或 `-t` 标志来指定目标。

```shell
web-extend rsbuild:dev -t firefox-mv2
web-extend rsbuild:build -t firefox-mv2
web-extend preview -t firefox-mv2
web-extend zip -t firefox-mv2
```

或者也可以在 `pluginWebExtend()` 中传递 `target` 指定目标。

::: code-group

```js [rsbuild.config.ts]
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

Webextend 会在代码构建时注入一个环境变量 `import.meta.env.WEB_EXTEND_TARGET`，这有助于处理不同浏览器之间的特异性。

::: code-group

```js [src/background.js]
const target = import.meta.env.WEB_EXTEND_TARGET || "";
if (target.includes("chrome")) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
}
```

:::

## Manifest 兼容 {#manifest-compatibility}

WebExtend 会基于文件系统和构建目标，自动解析和生成 `manifest.json`，因此无需额外处理不同浏览器之间 Manifest 配置的差异性。

此外，可以为`pluginWebExtend()` 中的 `manifest` 选项传递一个函数来自定义 manifest 兼容性。

::: code-group

```js [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default defineConfig({
  plugins: [
    pluginWebExtend({
      manifest: ({ target, mode }) => ({...})
    }),
  ],
});
```

:::

Manifest 文档：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

## Extension API 兼容 {#extension-aip-compatibility}

WebExtend 不会处理 Extension API，如果需要兼容多个浏览器，需要在源码中手动处理。

Extension API 文档：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)

### 适用于 Chromium

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

运行以下命令，WebExtend 将自动打开浏览器并运行扩展。如果目标为 `firefox-mv2` 或 `firefox-mv3`，会打开 Firefox 浏览器，否则会打开 Chrome 浏览器。

```shell
# developemnt
npx web-extend rsbuild:dev --open

# production
npx web-extend preview
```

上述能力基于 [`web-ext`](https://github.com/mozilla/web-ext) 的 `run` 命令实现。如果需要自定义运行器的配置，可以在根目录下创建一个 `web-ext.config.[m|c]js` 文件。

以下是一些常见的自定义设置，完整的配置项请查阅 [web-ext run](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run)。

### 打开特定链接

在浏览器启动时，打开一个指定的链接。示例如下：

::: code-group

```js [web-ext.config.js]
export default {
  run: {
    startUrl: "https://www.google.com",
  },
};
```

:::

### 打开特定浏览器

设置一个 Chromium 或 Firefox 的可执行路径，来打开一个指定的浏览器。示例如下：

::: code-group

```js [web-ext.config.js]
export default {
  run: {
    firefox: "/path/to/firefox",
    chromiumBinary: "/path/to/chrome",
  },
};
```

:::

### 保存浏览器配置

`web-ext` 会在每次启动浏览器时创建一个新的临时的用户资料，可以指定一个路径。当下次再次打开浏览器时，将会使用之前保存的用户配置信息。

::: code-group

```js [web-ext.config.js]
export default {
  run: {
    args: ["--user-data-dir=path/to/profile"],
  },
};
```

:::
