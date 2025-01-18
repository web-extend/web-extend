---
outline: deep
---

# 入口

WebExtend 会基于以下入口文件自动解析构建、生成 `manifest.json` 中对应的配置项。

::: info 入口说明

除 icons 外，入口支持为目录或文件任意一种形式：

- 入口为文件：仅支持扩展名为 `.js|.jsx|.ts|.tsx` 的文件。构建工具会自动为每个入口注入 HTML 模板，生成对应的 html 文件。
- 入口为目录：
  - 如果是单入口，该目录下的 `index.js` 文件将作为入口。
  - 如果是多入口：该目录下的所有一级 `*.js` 或 `*/index.js` 文件将作为入口。目前仅有 `contents`、`sandbox` 和 `devtools/panels` 目录支持多入口。

:::

## Icons

在源码目录下创建 `assets/icon-{size}.png` 文件，对应 `manifest.json` 中的 `icons` 和 `action.default_icon` 字段。

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/icons)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons)

```
src/assets/
├─ icon-16.png
├─ icon-32.png
├─ icon-48.png
├─ icon-64.png
└─ icon-128.png
```

`web-extend` 工具支持基于一个高质量图片文件 `assets/icon.png` 作为模板，自动生成对应尺寸的 icon 文件。运行以下命令。

```shell
npx web-extend g icons

```

## Background

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/background)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)

`background` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g background

```

方式二：手动创建 `background.js` 文件，示例如下：

::: code-group

```js [background.js]
console.log("This is a background script.");
```

:::

## Popup

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/action)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action)

`popup` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g popup

```

方式二：手动创建 `popup.js` 或 `popup/index.js` 文件，可以使用 React/Vue 等前端框架，示例如下：

::: code-group

```tsx [popup/index.jsx]
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
```

:::

## Options

- [Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/options-page)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui)

`options` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g options

```

方式二：手动创建 `options.js` 或 `options/index.js` 文件，示例参考 `popup`。

## Content Scripts

- [Chrome Docs](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)

**添加单个入口**

单个 `content` 入口对应 `manifest.json` 中的 `content_scripts[0].js` 字段。入口支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g content
```

方式二：手动创建 `content.js` 或 `content/index.js` 文件。

**添加多个入口**

多个 `content` 入口分别对应 `manifest.json` 中的 `content_scripts[index].js` 字段。入口支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g contents/site-one

```

方式二：手动创建 `contents/*.js` 或 `contents/*/index.js` 文件。

**添加 CSS**

从 `content` 入口文件直接引入 CSS 文件，对应 `manifest.json` 中的 `content_scripts[index].css` 字段。

::: code-group

```js [content/index.js]
import "./index.css";
```

:::

**添加 content 配置**

在入口文件中，具名导出一个 `config` 对象，对应 `manifest.json` 中的 `content_scripts` 其他字段。如果使用 TypeScript，WebExtend 提供了一个 `ContentScriptConfig` 类型。示例如下。

::: code-group

```js [content.js]
export const config = {
  matches: ["https://www.google.com/*"],
};
```

```ts [content.ts]
import type { ContentScriptConfig } from "rsbuild-plugin-web-ext";

export const config: ContentScriptConfig = {
  matches: ["https://www.google.com/*"],
};
```

:::

## Sidepanel

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Sidebars)

`sidepanel` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g sidepanel

```

方式二：手动创建 `sidepanel.js` 或 `sidepanel/index.js` 文件，示例参考 `popup`。

## Devtools

- [Chrome Docs](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools)
- [Firefox Docs](https://wxt.dev/guide/essentials/entrypoints.html#devtools)

`devtool` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g devtools

```

方式二：手动创建 `devtools.js` 或 `devtools/index.js` 文件，在 `devtools` 入口的同级目录下创建 `panels/my-panels.js` 文件。示例如下：

::: code-group

```js [devtools/index.js]
chrome.devtools.panels.create("Font Picker", "", "font-picker.html");
```

```js [devtools/panels/font-picker/index.js]
import "./index.css";

const rootEl = document.querySelector("#root");
if (rootEl) {
  rootEl.innerHTML = `
  <div class="content">
    <h1>Vanilla WebExtend</h1>
    <p>This is a panel page.</p>
  </div>
  `;
}
```

:::

## Newtab

- [Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides)

`newtab` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g newtab

```

方式二：手动创建 `newtab.js` 或 `newtab/index.js` 文件。

## Bookmarks

- [Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
- Firefox 不支持 bookmarks。

`bookmarks` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g bookmarks

```

方式二：手动创建 `bookmarks.js` 或 `bookmarks/index.js` 文件。

## History

- [Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
- Firefox 不支持 history。

`history` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g history

```

方式二：手动创建 `history.js` 或 `history/index.js` 文件。

## Sandbox

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/sandbox)
- Firefox 不支持 sandbox。

`sandbox` 支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
# 单入口
npx web-extend g sandbox

# 多入口
npx web-extend g sandboxes/sandbox-one

```

方式二：手动创建 `sandbox.js` 或 `sandboxes/*.js` 文件。
