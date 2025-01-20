# 入口 {#entrypoints}

WebExtend 会基于文件系统自动解析入口文件，生成 `manifest.json` 中对应的配置项。

::: info 入口说明

入口文件位于源码目录下。除 icons 外，入口可以是目录或文件中任意一种形式：

- 入口为文件：仅支持扩展名为 `.js|.jsx|.ts|.tsx` 的入口文件。构建工具会自动为每个入口注入一个 [HTML 模板](https://rsbuild.dev/guide/basic/html-template)，生成对应的 `.html` 文件。
- 入口为目录：
  - 如果是单入口，该目录下的 `index.js` 文件将作为入口。
  - 如果是多入口：该目录下的所有一级 `*.js` 或 `*/index.js` 文件将作为入口。目前仅有 `contents`、`sandbox` 和 `devtools/panels` 目录支持多入口。

:::

## Icons

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/icons)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons)

在 src 目录下创建 `assets/icon-{size}.png` 文件，其对应 `manifest.json` 中的 `icons` 和 `action.default_icon` 字段。

```
src/assets/
├─ icon-16.png
├─ icon-32.png
├─ icon-48.png
├─ icon-64.png
└─ icon-128.png
```

`web-extend` 工具支持基于一个高质量图片文件 `assets/icon.png` 作为模板（建议图片尺寸不小于 128\*128px），自动生成对应尺寸的 icon 文件。运行以下命令。

```shell
npx web-extend g icons

```

## Background

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/background)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)

Background 入口对应了 `manifest.json` 中的 `background.service_worker` 或 `background.scripts` 字段，它支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g background

```

方式二：手动创建 `src/background.js` 文件，示例如下：

::: code-group

```js [src/background.js]
console.log("This is a background script.");
```

:::

## Popup

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/action)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action)

Popup 入口对应了 `manifest.json` 中的 `action.default_popup` 字段，其支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g popup

```

方式二：手动创建 `src/popup.js` 或 `src/popup/index.js` 文件，可以使用 React/Vue 等前端框架，示例如下：

::: code-group

```tsx [src/popup/index.jsx]
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

Options 入口对应了 `manifest.json` 中的 `options_ui.page` 字段，其支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g options

```

方式二：手动创建 `src/options.js` 或 `src/options/index.js` 文件。

## Content Scripts

- [Chrome Docs](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)

### 添加单个入口 {#adding-a-single-content-script}

单个 `content` 入口对应 `manifest.json` 中的 `content_scripts[0].js` 字段。入口支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g content
```

方式二：手动创建 `src/content.js` 或 `src/content/index.js` 文件。

### 添加多个入口 {#adding-multiple-content-scripts}

多个 `content` 入口分别对应 `manifest.json` 中的 `content_scripts[index].js` 字段。入口支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g contents/site-one

```

方式二：手动创建 `src/contents/*.js` 或 `src/contents/*/index.js` 文件。

### 添加 CSS {#adding-css}

在 `content` 入口文件中直接引入 CSS 文件，对应 `manifest.json` 中的 `content_scripts[index].css` 字段。

::: code-group

```js [src/content/index.js]
import "./index.css";
```

:::

### 添加 config {#adding-config}

在入口文件中具名导出一个 `config` 对象，对应 `manifest.json` 中 `content_scripts` 的其他字段。如果使用 TypeScript，WebExtend 提供了一个 `ContentScriptConfig` 类型。示例如下。

::: code-group

```js [src/content/index.js]
export const config = {
  matches: ["https://www.google.com/*"],
};
```

```ts [src/content/index.ts]
import type { ContentScriptConfig } from "@web-extend/rsbuild-plugin";

export const config: ContentScriptConfig = {
  matches: ["https://www.google.com/*"],
};
```

:::

## Sidepanel

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Sidebars)

Sidepanel 入口对应了 `manifest.json` 中的 `side_panel.default_path` 或 `sidebar_action.default_panel` 字段，其支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g sidepanel

```

方式二：手动创建 `src/sidepanel.js` 或 `src/sidepanel/index.js` 文件。

## Devtools

- [Chrome Docs](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools)
- [Firefox Docs](https://wxt.dev/guide/essentials/entrypoints.html#devtools)

Devtools 入口对应了 `manifest.json` 中的 `devtools_page` 字段，其支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g devtools

```

方式二：手动创建 `src/devtools.js` 或 `src/devtools/index.js` 文件，在 `devtools` 入口文件的同级目录下创建 `panels/my-panels.js` 文件。示例如下：

::: code-group

```js [src/devtools/index.js]
chrome.devtools.panels.create("Font Picker", "", "font-picker.html");
```

```js [src/devtools/panels/font-picker/index.js]
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

Newtab 入口对应了 `manifest.json` 中的 `chrome_url_overrides.newtab` 字段，其支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g newtab

```

方式二：手动创建 `src/newtab.js` 或 `src/newtab/index.js` 文件。

## Bookmarks

- [Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
- Firefox 不支持 bookmarks。

Bookmarks 入口对应了 `manifest.json` 中的 `chrome_url_overrides.bookmarks` 字段，其支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g bookmarks

```

方式二：手动创建 `src/bookmarks.js` 或 `src/bookmarks/index.js` 文件。

## History

- [Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
- Firefox 不支持 history。

History 入口对应了 `manifest.json` 中的 `chrome_url_overrides.history` 字段，其支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
npx web-extend g history

```

方式二：手动创建 `src/history.js` 或 `src/history/index.js` 文件。

## Sandbox

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/sandbox)
- Firefox 不支持 sandbox。

Sandbox 入口对应了 `manifest.json` 中的 `sandbox.pages` 字段，其支持两种添加方式。

方式一：自动生成入口，运行以下命令。

```shell
# 单入口
npx web-extend g sandbox

# 多入口
npx web-extend g sandboxes/sandbox-one

```

方式二：手动创建 `src/sandbox.js` 或 `src/sandboxes/*.js` 文件。
