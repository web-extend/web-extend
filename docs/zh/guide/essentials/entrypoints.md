---
outline: [2, 3]
---

# 入口 {#entrypoints}

## 声明式入口

WebExtend 会基于文件系统自动解析入口文件，生成对应的 manifest 字段。因此，您无需再在 `manifest.json` 中手动维护这些入口定义。

在 WebExtend 中，入口文件位于源码目录下。入口可以是目录或文件中任意一种形式。

当入口为文件时，仅支持扩展名为 `.js|.jsx|.ts|.tsx` 的入口文件。构建工具会自动为每个入口注入一个 [HTML 模板](https://rsbuild.dev/guide/basic/html-template)，生成对应的 HTML 文件。

```
src/
├─ background.js -> entrypoint
├─ popup.js -> entrypoint
└─ content.js -> entrypoint
```

当入口为目录，并且为单入口时，该目录下的 `index.js` 文件将作为入口。

当入口为目录，并且为多入口时，该目录下的所有一级 `*.js` 或 `*/index.js` 文件将作为入口。目前仅有 `contents`、`sandboxes` 和 `panels` 目录支持多入口。

```
src/
├─ content/
|  ├─ lib.js
|  ├─ index.css
|  └─ index.js -> entrypoint
└─ contents/
   ├─ content-one.js -> entrypoint
   └─ content-two/
      ├─ index.css
      └─ index.js -> entrypoint
```

## 入口类型

### Background

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/background) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)

Background 入口对应了 `manifest.json` 中的 `background.service_worker` 或 `background.scripts` 字段。

自动生成入口。

```shell
npx web-extend g background
```

或者手动创建 `src/background.js` 文件，示例如下：

::: code-group

```js [src/background.js]
console.log("This is a background script.");
```

:::

参考 [with-background](https://github.com/web-extend/examples/tree/main/with-background)。

### Bookmarks

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)，Firefox 不支持 bookmarks。

Bookmarks 入口对应了 `manifest.json` 中的 `chrome_url_overrides.bookmarks` 字段。

自动生成入口。

```shell
npx web-extend g bookmarks
```

或者手动创建 `src/bookmarks.js` 或 `src/bookmarks/index.js` 文件。

### Content Scripts

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)

#### 添加单个入口 {#adding-a-single-content-script}

单个 `content` 入口对应 `manifest.json` 中的 `content_scripts[0].js` 字段。

自动生成入口。

```shell
npx web-extend g content
```

或者手动创建 `src/content.js` 或 `src/content/index.js` 文件。

#### 添加多个入口 {#adding-multiple-content-scripts}

多个 `content` 入口分别对应 `manifest.json` 中的 `content_scripts[index].js` 字段。

自动生成入口。

```shell
npx web-extend g contents/site-one
```

或者手动创建 `src/contents/*.js` 或 `src/contents/*/index.js` 文件。

#### 添加 CSS {#adding-css}

在 `content` 入口文件中直接引入 CSS 文件，对应 `manifest.json` 中的 `content_scripts[index].css` 字段。示例如下。

```css [src/content/index.css]
.web-extend-content-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: end;
  z-index: 1000;
}

.web-extend-content {
  color: #000;
  background-color: #fff;
  margin-right: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: center;
  padding: 12px;
}
```

```js [src/content/index.ts]
import "./index.css";

let root = document.getElementById("myContent");
if (!root) {
  root = document.createElement("div");
  root.id = "myContent";
  root.innerHTML = `<div class="web-extend-content-container">
    <div class="web-extend-content">
      <p>This is a content script.</p>
    </div>
  </div>`;
  document.body.appendChild(root);
}
```

为了避免样式与主站中的样式冲突，你还可以在 Shadow DOM 中应用样式。示例如下。

```ts [src/content/index.ts]
import inlineStyles from "./index.css?inline";

let host = document.getElementById("myContentHost");
if (!host) {
  host = document.createElement("div");
  host.id = "myContentHost";

  const shadow = host.attachShadow({ mode: "open" });

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(inlineStyles);
  shadow.adoptedStyleSheets = [sheet];

  const root = document.createElement("div");
  root.innerHTML = `<div class="web-extend-content-container">
    <div class="web-extend-content">
      <p>This is a content script.</p>
    </div>
  </div>`;
  shadow.appendChild(root);

  document.body.appendChild(host);
}
```

此外，还可以使用 CSS Modules、CSS 预处理器、Tailwind CSS 或 UnoCSS 来设置样式。查阅[使用 CSS 库](./using-libraries.md#css-libraries)。

#### 添加 config {#adding-config}

在入口文件中具名导出一个 `config` 对象，对应 `manifest.json` 中 `content_scripts` 的其他字段。如果使用 TypeScript，WebExtend 提供了一个 `ContentScriptConfig` 类型。示例如下。

::: code-group

```js [src/content/index.js]
export const config = {
  matches: ["https://www.google.com/*"],
};
```

```ts [src/content/index.ts]
import type { ContentScriptConfig } from "web-extend";

export const config: ContentScriptConfig = {
  matches: ["https://www.google.com/*"],
};
```

:::

参考 [with-content](https://github.com/web-extend/examples/tree/main/with-content)、[with-multi-contents](https://github.com/web-extend/examples/tree/main/with-multi-contents)。

### Devtools

[Chrome Docs](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/devtools_page)

Devtools 入口对应了 `manifest.json` 中的 `devtools_page` 字段。

自动生成入口。

```shell
npx web-extend g devtools
```

或者手动创建 `src/devtools.js` 和 `src/panels/my-panel.js` 文件。示例如下：

::: code-group

```js [src/devtools.js]
chrome.devtools.panels.create("My Panel", "", "panels/my-panel.js");
```

```js [src/panels/my-panel/index.js]
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

#### 添加 panel

Devtools 页面由一个或多个 panel 组成，可以使用以下两种方式创建 panel。

自动生成入口。

```shell
# create a single panel
npx web-extend g panel

# create multiple panels
npx web-extend g panels/panel1,panels/panel2
```

或者创建 `src/panel/index.js` 或 `src/panels/my-panel/index.js` 文件，分别用于单个 panel 和多个 panel。

然后在 devtools 入口中引入 panel，如下所示。

::: code-group

```js [src/devtools.js]
// for a single panel
chrome.devtools.panels.create("My panel", "", "panel.html");

// for multiple panels
chrome.devtools.panels.create("My panel", "", "panels/my-panel.html");
```

:::

参考 [with-devtools](https://github.com/web-extend/examples/tree/main/with-devtools)。

### History

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)，Firefox 不支持 history。

History 入口对应了 `manifest.json` 中的 `chrome_url_overrides.history` 字段，

自动生成入口。

```shell
npx web-extend g history
```

或者手动创建 `src/history.js` 或 `src/history/index.js` 文件。

### Icons

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/icons) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons)

在 src 目录下创建 `assets/icon-{size}.png` 文件，其对应 `manifest.json` 中的 `icons` 和 `action.default_icon` 字段。

```
src/assets/
├─ icon-16.png
├─ icon-32.png
├─ icon-48.png
└─ icon-128.png
```

`web-extend` 工具支持基于一个高质量图片文件 `assets/icon.png` 作为模板（建议图片尺寸不小于 128\*128px），自动生成对应尺寸的 icon 文件。运行以下命令。

```shell
npx web-extend g icons

```

参考 [with-icons](https://github.com/web-extend/examples/tree/main/with-icons)。

### Newtab

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides)

Newtab 入口对应了 `manifest.json` 中的 `chrome_url_overrides.newtab` 字段。

自动生成入口。

```shell
npx web-extend g newtab
```

或者手动创建 `src/newtab.js` 或 `src/newtab/index.js` 文件。

### Options

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/options-page) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui)

Options 入口对应了 `manifest.json` 中的 `options_ui.page` 字段。

自动生成入口。

```shell
npx web-extend g options
```

或者手动创建 `src/options.js` 或 `src/options/index.js` 文件。

### Popup

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/action) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action)

Popup 入口对应了 `manifest.json` 中的 `action.default_popup` 字段。

自动生成入口。

```shell
npx web-extend g popup
```

或者手动创建 `src/popup.js` 或 `src/popup/index.js` 文件，可以使用 React/Vue 等前端框架，示例如下：

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

参考 [with-popup](https://github.com/web-extend/examples/tree/main/with-popup)。

### Sandbox

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/sandbox)，Firefox 不支持 sandbox。

Sandbox 入口对应了 `manifest.json` 中的 `sandbox.pages` 字段。

自动生成入口。

```shell
# 单入口
npx web-extend g sandbox

# 多入口
npx web-extend g sandboxes/sandbox-one
```

或者手动创建 `src/sandbox.js` 或 `src/sandboxes/*.js` 文件。

然后可以在其他的扩展页面中，将 sandbox 作为 iframe 嵌入，示例如下。

::: code-group

```js [src/popup/index.js]
document.querySelector("#root").innerHTML = `
  <div class="content">
    <!-- embed a single sandbox -->
    <iframe id="sandboxFrame1" src="sandbox.html"></iframe>
    <!-- embed multiple sandboxes -->
    <iframe id="sandboxFrame1" src="sandboxes/sandbox1.html"></iframe>
  </div>
  `;
}
```

:::

参考 [with-sandbox](https://github.com/web-extend/examples/tree/main/with-sandbox)、[with-multi-sandboxes](https://github.com/web-extend/examples/tree/main/with-multi-sandboxes)。

### Sidepanel

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Sidebars)

Sidepanel 入口对应了 `manifest.json` 中的 `side_panel.default_path` 或 `sidebar_action.default_panel` 字段。

自动生成入口。

```shell
npx web-extend g sidepanel
```

或者手动创建 `src/sidepanel.js` 或 `src/sidepanel/index.js` 文件。

参考 [with-sidepanel](https://github.com/web-extend/examples/tree/main/with-sidepanel)。
