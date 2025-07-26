---
outline: [2, 3]
---

# 浏览器支持 {#browsers}

WebExtend 旨在帮助你轻松构建跨浏览器扩展程序。本指南涵盖了你需要了解的有关浏览器兼容性、配置和开发工作流程的所有信息。

## 浏览器目标 {#extension-target}

WebExtend 支持以下浏览器扩展目标。

| Target        | Description         | Status                          |
| ------------- | ------------------- | ------------------------------- |
| `chrome-mv3`  | Chrome Manifest V3  | 默认、稳定                      |
| `firefox-mv2` | Firefox Manifest V2 | 对于 Firefox，推荐使用 MV2 版本 |
| `firefox-mv3` | Firefox Manifest V3 | 实验性支持，不能用于 dev 环境中 |
| `safari-mv3`  | Safari Manifest V3  | 实验性支持                      |
| `edge-mv3`    | Edge Manifest V3    | 稳定                            |
| `opera-mv3`   | Opera Manifest V3   | 稳定                            |

当构建目标为 `chrome-mv3` 时，对应的构建产物可以在 Chromium 系列的浏览器中使用（包括 Chrome、Edge、Brave、Opera 等）。

可以为 `web-extend` 的下列子命令传递 `--target` 或 `-t` 标志来指定目标。

```shell
web-extend dev -t firefox-mv2
web-extend build -t firefox-mv2
web-extend preview -t firefox-mv2
web-extend zip -t firefox-mv2
```

### 环境变量

Webextend 会在代码构建时注入一个环境变量 `import.meta.env.WEB_EXTEND_TARGET`，这有助于处理不同浏览器之间的特异性。

```js [src/background.js]
const target = import.meta.env.WEB_EXTEND_TARGET || '';

// Chrome-specific code
if (target.includes('chrome')) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
}

// Firefox-specific code
if (target.includes('firefox')) {
  browser.sidebarAction.setPanel({ url: 'sidepanel.html' }).catch((error) => console.error(error));
}
```

## 浏览器兼容性

在开发跨浏览器扩展时，可能会遇到两类兼容性问题：

1. `maifest.json` 配置项兼容
2. 扩展 API 兼容

### Manifest 配置 {#manifest}

WebExtend 会基于文件系统和构建目标，自动解析和生成 `manifest.json`，因此无需额外处理不同浏览器之间 Manifest 配置的差异性。

此外，可以自定义 manifest 兼容性，示例如下：

```ts [bext.config.ts]
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  manifest: ({ target, mode }) => {
    return {
      // ...
    };
  },
});
```

参考文档：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

### Extension API {#extension-api}

WebExtend 不会处理 Extension API，如果需要兼容多个浏览器，需要在源码中手动处理。

Extension API 文档：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)

#### 适用于 Chromium

可以直接使用 `chrome` API。

```ts
chrome.storage.local.set({ key: 'value' });
chrome.runtime.sendMessage({ type: 'message' });
```

推荐包： [@types/chrome](https://www.npmjs.com/package/@types/chrome)。

#### 适用于 Firefox

使用 `webextension-polyfill` 包：

```js
import browser from 'webextension-polyfill';

browser.storage.local.set({ key: 'value' });
browser.runtime.sendMessage({ type: 'message' });
```

推荐包：

- [webextension-polyfill](https://www.npmjs.com/package/webextension-polyfill)
- [@types/webextension-polyfill](https://www.npmjs.com/package/@types/webextension-polyfill)

## 浏览器运行 {#browser-startup}

运行以下命令，WebExtend 将自动打开浏览器并运行扩展。如果目标为 `firefox-mv2` 或 `firefox-mv3`，会打开 Firefox 浏览器，否则会打开 Chrome 浏览器。

```shell
# developemnt
npx web-extend dev --open

# production
npx web-extend preview
```

上述能力基于 [`web-ext`](https://github.com/mozilla/web-ext) 的 `run` 命令实现。如果需要自定义运行器的配置，可以在根目录下创建一个 `web-ext.config.[m|c]js` 文件。

### 典型案例

#### 打开特定链接

在浏览器启动时，打开一个指定的链接。示例如下：

```js [web-ext.config.js]
import { defineWebExtConfig } from 'web-extend';

export default defineWebExtConfig({
  run: {
    startUrl: 'https://www.google.com',
  },
});
```

#### 打开特定浏览器

设置一个 Chromium 或 Firefox 的可执行路径，来打开一个指定的浏览器。示例如下：

```js [web-ext.config.js]
import { defineWebExtConfig } from 'web-extend';

export default defineWebExtConfig({
  run: {
    firefox: '/path/to/firefox',
    chromiumBinary: '/path/to/chrome',
  },
});
```

#### 保存浏览器配置

`web-ext` 会在每次启动浏览器时创建一个新的临时的用户资料，可以指定一个路径。当下次再次打开浏览器时，将会使用之前保存的用户配置信息。

::: code-group

```js [Mac/Linux]
// web-ext.config.js
import { defineWebExtConfig } from 'web-extend';

export default defineWebExtConfig({
  run: {
    args: ['--user-data-dir=path/to/profile'],
  },
});
```

```js [Windows]
// web-ext.config.js
import { resolve } from 'node:path';
import { defineWebExtConfig } from 'web-extend';

export default defineWebExtConfig({
  run: {
    chromiumProfile: resolve('/path/to/profile'),
    keepProfileChanges: true,
  },
});
```
