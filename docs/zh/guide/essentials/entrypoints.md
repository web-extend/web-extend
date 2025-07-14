---
outline: [2, 3]
---

# 入口 {#entrypoints}

::: tip 什么是入口？
入口是浏览器扩展的核心构建块。它们定义构成扩展的不同组件，如 background、popup 或 content_scripts。WebExtend 通过基于文件的约定系统可以轻松管理这些入口点。
:::

## 声明式入口

WebExtend 会基于文件系统自动解析入口文件，生成对应的 manifest 字段。因此，您无需再在 `manifest.json` 中手动维护这些入口定义。

::: tip 为什么使用声明式入口？
声明式入口点减少了样板代码，使扩展更易于维护。你可以专注于编写实际的扩展代码，而不是管理复杂的清单配置。
:::

在 WebExtend 中，入口文件位于源码目录下。入口可以是目录或文件中任意一种形式。

当入口为文件时，仅支持扩展名为 `.js|.jsx|.ts|.tsx` 的入口文件。构建工具会自动为每个入口注入一个 [HTML 模板](https://rsbuild.rs/guide/basic/html-template)，生成对应的 HTML 文件。

```
src/
├─ background.js -> entry point
├─ popup.js -> entry point
└─ content.js -> entry point
```

当入口为目录，并且为单入口时，该目录下的 `index.js` 文件将作为入口。

当入口为目录，并且为多入口时，该目录下的所有一级 `*.js` 或 `*/index.js` 文件将作为入口。目前仅有 `contents`、`sandboxes` 和 `panels` 目录支持多入口。

```
src/
├─ content/
|  ├─ lib.js
|  ├─ index.css
|  └─ index.js -> entry point
└─ contents/
   ├─ content-one.js -> entry point
   └─ content-two/
      ├─ index.css
      └─ index.js -> entry point
```

::: warning 注意
确保遵循正确的文件命名约定。例如，`background.ts` 可以被识别，但 `my-background.ts` 则无法被识别。
:::

## 入口类型

### Background

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/background) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)

Background 脚本运行在浏览器扩展的后台上下文中。Background 入口对应了 `manifest.json` 中的 `background.service_worker` 或 `background.scripts` 字段。

| Entry Path                  | Output Path     |
| --------------------------- | --------------- |
| `background.(js\|ts)`       | `background.js` |
| `background/index.(js\|ts)` | `background.js` |

自动生成入口：

```shell
npx we g background
```

使用示例：

```js [src/background.js]
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
```

参考 [with-background](https://github.com/web-extend/examples/tree/main/with-background)。

### Bookmarks

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)，Firefox 不支持 bookmarks。

Bookmarks 入口对应了 `manifest.json` 中的 `chrome_url_overrides.bookmarks` 字段。

| Entry Path                           | Output Path      |
| ------------------------------------ | ---------------- |
| `bookmarks.(js\|jsx\|ts\|tsx)`       | `bookmarks.html` |
| `bookmarks/index.(js\|jsx\|ts\|tsx)` | `bookmarks.html` |

自动生成入口：

```shell
npx we g bookmarks
```

### Content Scripts

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)

Content Scripts 是在网页上下文中运行的 JavaScript 文件。他们可以读取和修改与你的扩展交互的网页的内容。

::: tip 最佳实践

1. 请谨慎使用内容脚本，并且仅在必要的页面上使用
2. 避免可能减慢页面加载速度的繁重作
3. 考虑使用 `run_at` 选项来控制脚本的运行时间
4. 尽可能使用 Shadow DOM 以避免样式冲突

:::

| Entry Path                                 | Output Path          |
| ------------------------------------------ | -------------------- |
| `content.(js\|jsx\|ts\|tsx)`               | `content.js`         |
| `content/index.(js\|jsx\|ts\|tsx)`         | `content.js`         |
| `contents/{name}.(js\|jsx\|ts\|tsx)`       | `contents/{name}.js` |
| `contents/{name}/index.(js\|jsx\|ts\|tsx)` | `contents/{name}.js` |

#### 添加内容脚本 {#adding-multiple-content-scripts}

`content` 入口对应 `manifest.json` 中的 `content_scripts[index].js` 字段。

自动生成入口：

```shell
# for a single content script
npx we g content

# for multiple content scripts
npx we g contents/site-one contents/site-two
```

#### 添加 CSS {#adding-css}

在 `content` 入口文件中直接引入 CSS 文件，对应 `manifest.json` 中的 `content_scripts[index].css` 字段。

::: warning CSS 范围
请小心内容脚本中的 CSS 选择器。它们可能与网页的现有样式冲突。考虑使用：

1. 具有唯一前缀的特定类名
2. 用于完全样式隔离的 Shadow DOM
3. 用于局部样式的 CSS Modules

:::

示例如下：

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

#### 使用 Shadow DOM

Shadow DOM 为 DOM 和样式提供了更好的封装。

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

#### 添加配置 {#adding-config}

在入口文件中具名导出一个 `config` 对象，对应 `manifest.json` 中 `content_scripts` 的其他字段。如果使用 TypeScript，WebExtend 提供了一个 `ContentScriptConfig` 类型。示例如下。

::: code-group

```js [src/content/index.js]
export const config = {
  matches: ["https://www.google.com/*"],
  run_at: "document_end",
  all_frames: false,
};
```

```ts [src/content/index.ts]
import type { ContentScriptConfig } from "web-extend";

export const config: ContentScriptConfig = {
  matches: ["https://www.google.com/*"],
  run_at: "document_end",
  all_frames: false,
};
```

:::

参考 [with-content](https://github.com/web-extend/examples/tree/main/with-content)、[with-multi-contents](https://github.com/web-extend/examples/tree/main/with-multi-contents)。

### Devtools

[Chrome Docs](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/devtools_page)

Devtools 允许你使用自定义功能扩展浏览器的开发者工具。这非常适合创建调试工具、性能分析器或专用检查器。

Devtools 入口对应了 `manifest.json` 中的 `devtools_page` 字段。

| Entry Path                          | Output Path     |
| ----------------------------------- | --------------- |
| `devtools.(js\|jsx\|ts\|tsx)`       | `devtools.html` |
| `devtools/index.(js\|jsx\|ts\|tsx)` | `devtools.html` |

自动生成入口：

```shell
npx we g devtools
```

使用示例:

```ts [src/devtools.ts]
// Create a panel when DevTools are opened
chrome.devtools.panels.create(
  "My Panel", // Panel display name
  "icon-16.png", // Panel icon
  "pages/panel.html", // Panel page
  (panel) => {
    // Panel created callback
    panel.onShown.addListener((window) => {
      console.log("Panel shown");
    });
    panel.onHidden.addListener(() => {
      console.log("Panel hidden");
    });
  }
);
```

参考 [with-devtools](https://github.com/web-extend/examples/tree/main/with-devtools)。

### History

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)，Firefox 不支持 history。

History 入口对应了 `manifest.json` 中的 `chrome_url_overrides.history` 字段。

| Entry Path                         | Output Path    |
| ---------------------------------- | -------------- |
| `history.(js\|jsx\|ts\|tsx)`       | `history.html` |
| `history/index.(js\|jsx\|ts\|tsx)` | `history.html` |

自动生成入口：

```shell
npx we g history
```

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

你还可以使用 WebExtend 的生成器来自动创建不同尺寸的图标。生成器会从 `src/assets` 目录中读取一个模板图标文件（名为 `icon.png`、`icon-1024.png`、`icon-512.png` 或 `icon-128.png`），并生成 16px、32px、48px 和 128px 的缩放版本。你也可以使用 `--size` 选项指定自定义尺寸：

```shell
# generate icons in default sizes
npx we g icons

# generate icons in custom sizes
npx we g icons --size 16 32 48 128
```

参考 [with-icons](https://github.com/web-extend/examples/tree/main/with-icons)。

### Newtab

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides)

Newtab 将替换浏览器的默认新标签页。 Newtab 入口对应了 `manifest.json` 中的 `chrome_url_overrides.newtab` 字段。

自动生成入口：

```shell
npx we g newtab
```

### Options

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/options-page) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui)

Options 为用户提供了自定义扩展的方法。 Options 入口对应了 `manifest.json` 中的 `options_ui.page` 字段。

自动生成入口：

```shell
npx we g options
```

参考 [with-options](https://github.com/web-extend/examples/tree/main/with-options).

### Pages

Pages 是未在 `manifest.json` 中列出的 HTML 文档，但可以通过扩展访问。它们在某些情况下很有用，例如在安装时用作新选项卡中显示的欢迎页面。

| Entry Path                              | Output Path         |
| --------------------------------------- | ------------------- |
| `pages/{name}.(js\|jsx\|ts\|tsx)`       | `pages/{name}.html` |
| `pages/{name}/index.(js\|jsx\|ts\|tsx)` | `pages/{name}.html` |

自动生成入口：

```shell
npx we g pages/welcome pages/panel
```

### Popup

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/action) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action)

Popup 是一个临时 UI，当用户单击扩展的图标时显示。Popup 入口对应了 `manifest.json` 中的 `action.default_popup` 字段。

| Entry Path                       | Output Path  |
| -------------------------------- | ------------ |
| `popup.(js\|jsx\|ts\|tsx)`       | `popup.html` |
| `popup/index.(js\|jsx\|ts\|tsx)` | `popup.html` |

自动生成入口：

```shell
npx we g popup
```

使用示例：

```tsx [src/popup/index.tsx]
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

参考 [with-popup](https://github.com/web-extend/examples/tree/main/with-popup)。

### Sandbox

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/sandbox)，Firefox 不支持 sandbox。

Sandbox 入口对应了 `manifest.json` 中的 `sandbox.pages` 字段。

| Entry Path                                  | Output Path             |
| ------------------------------------------- | ----------------------- |
| `sandbox.(js\|jsx\|ts\|tsx)`                | `sandbox.html`          |
| `sandbox/index.(js\|jsx\|ts\|tsx)`          | `sandbox.html`          |
| `sandboxes/{name}.(js\|jsx\|ts\|tsx)`       | `sandboxes/{name}.html` |
| `sandboxes/{name}/index.(js\|jsx\|ts\|tsx)` | `sandboxes/{name}.html` |

自动生成入口：

```shell
# 单入口
npx we g sandbox

# 多入口
npx we g sandboxes/sandbox1 sandboxes/sandbox2
```

可以在其他的扩展页面中，将 sandbox 作为 iframe 嵌入使用。

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

参考 [with-sandbox](https://github.com/web-extend/examples/tree/main/with-sandbox)、[with-multi-sandboxes](https://github.com/web-extend/examples/tree/main/with-multi-sandboxes)。

### Scripting

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/scripting) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting)

Scripting 允许你以编程方式将 JavaScript 和 CSS 注入网页。这与内容脚本不同，因为它在何时何地注入代码方面提供了更大的灵活性。

| Entry Path                                 | Output Path            |
| ------------------------------------------ | ---------------------- |
| `scripting/{name}.(js\|jsx\|ts\|tsx)`      | `scripting/{name}.js`  |
| `scripting/{name}.(css\|less\|sass\|scss)` | `scripting/{name}.css` |

使用示例:

```ts [src/background.ts]
chrome.tabs.onActivated.addListener((e) => {
  chrome.scripting.executeScript({
    target: { tabId: e.tabId },
    files: ["scripting/injected-script.js"],
  });

  chrome.scripting.insertCSS({
    target: { tabId: e.tabId },
    files: ["scripting/injected-style.css"],
  });
});
```

参考 [with-scripting](https://github.com/web-extend/examples/tree/main/with-scripting).

### Side panel

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Sidebars)

Sidepanel 入口对应了 `manifest.json` 中的 `side_panel.default_path` 或 `sidebar_action.default_panel` 字段。

| Entry Path                           | Output Path      |
| ------------------------------------ | ---------------- |
| `sidepanel.(js\|jsx\|ts\|tsx)`       | `sidepanel.html` |
| `sidepanel/index.(js\|jsx\|ts\|tsx)` | `sidepanel.html` |

自动生成入口：

```shell
npx we g sidepanel
```

参考 [with-sidepanel](https://github.com/web-extend/examples/tree/main/with-sidepanel)。
