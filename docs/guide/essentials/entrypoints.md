---
outline: [2, 3]
---

# Entrypoints

## Declarative Entrypoints

WebExtend supports file-conventional entry points, meaning it parses entry points based on the file system and generates the corresponding manifest fields. So you no longer need to define these entry points manually in `manifest.json`.

In WebExtend, all entry points are located in the source directory. Every entry point can be a folder or a file.

When the entry is a file, only the file ends with `.js|.jsx|.ts|.tsx` will be discovered. The build tool injects an HTML template for each entry, if necessary, and generates the corresponding HTML file.

```
src/
├─ background.js -> entrypoint
├─ popup.js -> entrypoint
└─ content.js -> entrypoint
```

When the entry is a folder, and that folder contains a single entry, the `index.js` file within that folder will be discovered as the entry point.

When the entry is a folder, and that folder contains multiple entries, all the direct `*.js` or `*/index.js` files within that folder will be discovered as entry points. Only files in `contents`, `sandboxes` and `panels` folders will be discovered as multiple entries currently.

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

## Entrypoint Types

### Background

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/background) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)

The background entry will be reflected to the `background.service_worker` or `background.scripts` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g background
```

Alternatively, create the `src/background.js` file manually whose content is as follows:

::: code-group

```js [src/background.js]
console.log("This is a background script.");
```

:::

See [with-background](https://github.com/web-extend/examples/tree/main/with-background).

### Bookmarks

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages), Firefox doesn't support bookmarks.

The bookmarks entry will be reflected to the `chrome_url_overrides.bookmarks` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g bookmarks
```

Alternatively, create the `src/bookmarks.js` or `src/bookmarks/index.js` file manually.

### Content Scripts

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)

#### Adding a single content script

A single content entry will be reflected to the `content_scripts[0].js` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g content
```

Alternatively, create the `src/content.js` or`src/content/index.js` file manually.

#### Adding multiple content scripts

Multiple content entries will be reflected to the `content_scripts[index].js` field in `manifest.josn` respectively.

Generate the entry automatically.

```shell
npx web-extend g contents/site-one,contents/site-two
```

Alternatively, create the `src/contents/*.js` or `src/contents/*/index.js` file manually.

#### Adding CSS

Import CSS files directly in the `content` entry file, which will be reflected to the `content_scripts[index].css` field in `manifest.json`.

For example.

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

You can also apply CSS inside Shadow DOM, which is helpful to avoid style conflicts with the styles in the main site.

For example.

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

For advanced styling, you can utilize CSS Modules, CSS preprocessors, Tailwind CSS, or UnoCSS. See [using CSS libraries](./using-libraries.md#css-libraries).

#### Adding config

Export an obejct named `config` in the `content` entry, which will be reflected to other fields in `content_scripts[index]`, as follows.

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

See [with-content](https://github.com/web-extend/examples/tree/main/with-content), [with-multi-contents](https://github.com/web-extend/examples/tree/main/with-multi-contents).

### Devtools

[Chrome Docs](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/devtools_page)

The devtools entry will be reflected to the `devtools_page` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g devtools
```

Alternatively, create the `src/devtools.js` file manually.

#### Adding panels

The devtools page is composed of a single panel or multiple panels. There are two methods to create panels.

Generate the panel automatically.

```shell
# create a single panel
npx web-extend g panel

# create multiple panels
npx web-extend g panels/panel1,panels/panel2
```

Alternatively, create `src/panel/index.js` file for a single panel, or create `src/panels/panel1/index.js` for multiple panels.

Then you can use the panel in the detools entry, as follows.

::: code-group

```js [src/devtools.js]
// for a single panel
chrome.devtools.panels.create("My panel", "", "panel.html");

// for multiple panels
chrome.devtools.panels.create("My panel", "", "panels/panel1.html");
```

:::

See [with-devtools](https://github.com/web-extend/examples/tree/main/with-devtools).

### History

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages), Firefox doesn't support history.

The history entry will be reflected to the `chrome_url_overrides.history` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g history
```

Alternatively, create the `src/history.js` or `src/history/index.js` file manually.

### Icons

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/icons) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons)

Create the `assets/icon-{size}.png` files under the `src` directory as follows, which will be reflected to the `icons` and `action.default_icons` fields in `manifest.json`.

```
src/assets/
├─ icon-16.png
├─ icon-32.png
├─ icon-48.png
└─ icon-128.png
```

Alternatively, you can use `web-extend` to generate the corressponding sized icons files, which needs a high quality image `assets/icon.png` (>= 128 \* 128 px) as the template.

```shell
npx web-extend g icons
```

See [with-icons](https://github.com/web-extend/examples/tree/main/with-icons).

### Newtab

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides)

The newtab entry will be reflected to the `chrome_url_overrides.newtab` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g newtab
```

Alternatively, create the `src/newtab.js` or `src/newtab/index.js` file manually.

### Options

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/options-page) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui)

The options entry will be reflected to the `options_ui.page` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g options
```

Alternatively, create the `src/options.js` or `src/options/index.js` file manually.

See [with-options](https://github.com/web-extend/examples/tree/main/with-options).

### Popup

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/action) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action)

The popup entry will be reflected to the `action.default_popup` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g popup
```

Alternatively, create the `src/popup.js` or `src/popup/index.js` file manually whose content is as follows:

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

See [with-popup](https://github.com/web-extend/examples/tree/main/with-popup).

### Sandbox

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/sandbox), Firefox doesn't support sandbox.

The sandbox entry will be reflected to the `sandbox.pages` field in `manifest.json`.

Generate the entry automatically.

```shell
# create a single entry
npx web-extend g sandbox

# create multiple entries
npx web-extend g sandboxes/sandbox1,sandboxes/sandbox2

```

Alternatively, create the `src/sandbox.js` or `src/sandboxes/*.js` file manually.

To use the sandbox, you can embed it as an iframe inside an extension page or a content script.

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

See [with-sandbox](https://github.com/web-extend/examples/tree/main/with-sandbox), [with-multi-sandboxes](https://github.com/web-extend/examples/tree/main/with-multi-sandboxes).

### Sidepanel

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Sidebars)

The sidepanel entry will be reflected to the `side_panel.default_path` or `sidebar_action.default_panel` field in `manifest.json`.

Generate the entry automatically.

```shell
npx web-extend g sidepanel
```

Alternatively, create the `src/sidepanel.js` or `src/sidepanel/index.js` file manually.

See [with-sidepanel](https://github.com/web-extend/examples/tree/main/with-sidepanel).
