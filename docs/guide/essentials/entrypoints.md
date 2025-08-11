---
outline: [2, 3]
---

# Entry Points

Entry points are the core building blocks of a browser extension. They define different components like background, popup, or content scripts that make up your extension.

## Configuring Entry Points

You can configure entry points through the `manifest` option. WebExtend will parse it to find the entry points used in the extension.

For example:

```ts [web-extend.config.ts]
import { defineConfig } from 'web-extend';

export default defineConfig({
  manifest: {
    background: {
      service_worker: './src/background.ts',
    },
    content_scripts: [
      {
        matches: ['https://www.google.com/*'],
        js: ['./src/content.ts'],
      },
    ],
    action: {
      default_popup: './src/popup.ts',
    },
  },
});
```

The `manifest` option also can be a function that returns a manifest object.

```ts [web-extend.config.ts]
import { defineConfig } from 'web-extend';

export default defineConfig({
  manifest: ({ target, mode }) => {
    return {
      // ...
    };
  },
});
```

## File-based Entry Points

Besides the `manifest` option, WebExtend also makes it easy to manage these entry points through a file-based convention system.

::: tip Why File-based Entry Points?
File-based entry points reduce boilerplate code and make your extension more maintainable. Instead of managing complex manifest configurations, you can focus on writing the actual extension code.
:::

All entry points are located in the `entriesDir` (default is `src`) directory. Each entry point can be a folder or a file.

- When the entry point is a file, only files ending with `.js|.jsx|.ts|.tsx` will be discovered. The build tool injects an HTML template for each entry point, if necessary, and generates the corresponding HTML file.

```
src/
├─ background.ts -> entry point
├─ popup.ts -> entry point
└─ content.ts -> entry point
```

- When the entry point is a folder, and that folder contains a single entry point, the `index.js` file within that folder will be discovered as the entry point.

- When the entry point is a folder, and that folder contains multiple entry points, all the direct `*.js` or `*/index.js` files within that folder will be discovered as entry points. Only files in `contents`, `pages`, `sandboxes` and `scripting` folders will be discovered as multiple entry points currently.

```
src/
├─ content/
|  ├─ lib.ts
|  ├─ index.css
|  └─ index.ts -> entry point
└─ contents/
   ├─ content-one.ts -> entry point
   └─ content-two/
      ├─ index.css
      └─ index.ts -> entry point
```

## Entry Generator

WebExtend comes with a generator to help you create entry points automatically.

```shell
npx web-extend g [entry...]

# Or use the short form
npx we g [entry...]
```

## Entry Types

### Background

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/background) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)

The background script runs in the extension's background context. The background entry point will be reflected to the `background.service_worker` or `background.scripts` field in `manifest.json`.

| Entry Path                  | Output Path     |
| --------------------------- | --------------- |
| `background.(js\|ts)`       | `background.js` |
| `background/index.(js\|ts)` | `background.js` |

Generate the entry automatically:

```shell
npx web-extend g background
```

Example usage:

```ts [src/background.ts]
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});
```

See [with-background](https://github.com/web-extend/examples/tree/main/with-background) for an example.

### Bookmarks

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages), Firefox doesn't support bookmarks.

The bookmarks entry will be reflected to the `chrome_url_overrides.bookmarks` field in `manifest.json`.

| Entry Path                           | Output Path      |
| ------------------------------------ | ---------------- |
| `bookmarks.(js\|jsx\|ts\|tsx)`       | `bookmarks.html` |
| `bookmarks/index.(js\|jsx\|ts\|tsx)` | `bookmarks.html` |

Generate the entry automatically.

```shell
npx web-extend g bookmarks
```

### Content Scripts

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)

Content scripts are JavaScript files that run in the context of web pages. They can read and modify the content of web pages that your extension interacts with.

::: tip Best Practices

1. Use content scripts sparingly and only on necessary pages
2. Avoid heavy operations that might slow down page load
3. Consider using the `run_at` option to control when your script runs
4. Use Shadow DOM when possible to avoid style conflicts

:::

| Entry Path                                 | Output Path          |
| ------------------------------------------ | -------------------- |
| `content.(js\|jsx\|ts\|tsx)`               | `content.js`         |
| `content/index.(js\|jsx\|ts\|tsx)`         | `content.js`         |
| `contents/{name}.(js\|jsx\|ts\|tsx)`       | `contents/{name}.js` |
| `contents/{name}/index.(js\|jsx\|ts\|tsx)` | `contents/{name}.js` |

#### Adding content scripts

Content entries will be reflected to the `content_scripts[index].js` field in `manifest.json` respectively.

Generate the entry automatically:

```shell
# for a single content script
npx web-extend g content

# for multiple content scripts
npx web-extend g contents/site-one contents/site-two
```

#### Adding CSS

Import CSS files directly in the `content` entry file, which will be reflected to the `content_scripts[index].css` field in `manifest.json`.

::: warning CSS Scope
Be careful with CSS selectors in content scripts. They can conflict with the webpage's existing styles. Consider using:

1. Specific class names with a unique prefix
2. Shadow DOM for complete style isolation
3. CSS Modules for scoped styling

:::

For example:

```css [src/content/index.css]
.my-content-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: end;
  z-index: 1000;
}

.my-content {
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
import './index.css';

let root = document.getElementById('myContent');
if (!root) {
  root = document.createElement('div');
  root.id = 'myContent';
  root.innerHTML = `<div class="my-content-container">
    <div class="my-content">
      <p>This is a content script.</p>
    </div>
  </div>`;
  document.body.appendChild(root);
}
```

#### Using Shadow DOM

Shadow DOM provides better encapsulation for both DOM and styles. Here's how to use it:

```ts [src/content/index.ts]
import inlineStyles from './index.css?inline';

let host = document.getElementById('myContentHost');
if (!host) {
  host = document.createElement('div');
  host.id = 'myContentHost';

  const shadow = host.attachShadow({ mode: 'open' });

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(inlineStyles);
  shadow.adoptedStyleSheets = [sheet];

  const root = document.createElement('div');
  root.innerHTML = `<div class="my-content-container">
    <div class="my-content">
      <p>This is a content script.</p>
    </div>
  </div>`;
  shadow.appendChild(root);

  document.body.appendChild(host);
}
```

#### Adding Configuration

Export an object named `config` in the entry to configure how and where your content script runs. This will be reflected to other fields in `content_scripts[index]`.

Common configuration options include:

- `matches`: URL patterns where the script should run
- `exclude_matches`: URL patterns to exclude
- `run_at`: When to inject the script (`document_start`, `document_end`, or `document_idle`)
- `all_frames`: Whether to run in all frames

For example:

::: code-group

```js [src/content/index.js]
export const config = {
  matches: ['https://www.google.com/*'],
  run_at: 'document_end',
  all_frames: false,
};
```

```ts [src/content/index.ts]
import type { ContentScriptConfig } from 'web-extend';

export const config: ContentScriptConfig = {
  matches: ['https://www.google.com/*'],
  run_at: 'document_end',
  all_frames: false,
};
```

:::

See [with-content](https://github.com/web-extend/examples/tree/main/with-content) and [with-multi-contents](https://github.com/web-extend/examples/tree/main/with-multi-contents) for examples.

### Devtools

[Chrome Docs](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/devtools_page)

The devtools entry allows you to extend the browser's developer tools with custom functionality. This is perfect for creating debugging tools, performance analyzers, or specialized inspectors.

The devtools entry will be reflected to the `devtools_page` field in `manifest.json`.

| Entry Path                          | Output Path     |
| ----------------------------------- | --------------- |
| `devtools.(js\|jsx\|ts\|tsx)`       | `devtools.html` |
| `devtools/index.(js\|jsx\|ts\|tsx)` | `devtools.html` |

Generate the entry automatically:

```shell
npx web-extend g devtools
```

Example usage:

```ts [src/devtools.ts]
chrome.devtools.panels.create('My Panel', '', 'panel.html');
```

#### Adding panels

The devtools page is composed of a single panel or multiple panels.

Generate the panel entry automatically:

```shell
# create a single panel
npx web-extend g panel

# create multiple panels
npx web-extend g panels/panel1,panels/panel2
```

See [with-devtools](https://github.com/web-extend/examples/tree/main/with-devtools) for an example.

### History

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages), Firefox doesn't support history.

The history entry will be reflected to the `chrome_url_overrides.history` field in `manifest.json`.

| Entry Path                         | Output Path    |
| ---------------------------------- | -------------- |
| `history.(js\|jsx\|ts\|tsx)`       | `history.html` |
| `history/index.(js\|jsx\|ts\|tsx)` | `history.html` |

Generate the entry automatically:

```shell
npx web-extend g history
```

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

Alternatively, you can use WebExtend's generator to automatically create icons in different sizes. The generator will read a template icon file from the `src/assets` directory (named `icon.png`, `icon-1024.png`, `icon-512.png` or `icon-128.png`) and generate resized versions at 16px, 32px, 48px and 128px. You can also specify custom sizes using the `--size` option:

```shell
# generate icons in default sizes
npx web-extend g icons

# generate icons in custom sizes
npx web-extend g icons --size 16 32 48 128
```

See [with-icons](https://github.com/web-extend/examples/tree/main/with-icons) for an example.

### Newtab

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides)

The new tab page replaces the browser's default new tab page. The new tab entry point will be reflected to the `chrome_url_overrides.newtab` field in `manifest.json`.

| Entry Path                        | Output Path   |
| --------------------------------- | ------------- |
| `newtab.(js\|jsx\|ts\|tsx)`       | `newtab.html` |
| `newtab/index.(js\|jsx\|ts\|tsx)` | `newtab.html` |

Generate the entry automatically:

```shell
npx web-extend g newtab
```

### Options

[Chrome Docs](https://developer.chrome.com/docs/extensions/develop/ui/options-page) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui)

The options page provides a way for users to customize your extension. The options entry point will be reflected to the `options_ui.page` field in `manifest.json`.

| Entry Path                         | Output Path    |
| ---------------------------------- | -------------- |
| `options.(js\|jsx\|ts\|tsx)`       | `options.html` |
| `options/index.(js\|jsx\|ts\|tsx)` | `options.html` |

Generate the entry automatically:

```shell
npx web-extend g options
```

See [with-options](https://github.com/web-extend/examples/tree/main/with-options) for an example.

### Pages

Pages are HTML documents that are not listed in `manifest.json`, but can be accessed by your extension. They are useful in certain situations, such as serving as a welcome page shown in a new tab upon installation.

| Entry Path                              | Output Path         |
| --------------------------------------- | ------------------- |
| `pages/{name}.(js\|jsx\|ts\|tsx)`       | `pages/{name}.html` |
| `pages/{name}/index.(js\|jsx\|ts\|tsx)` | `pages/{name}.html` |

Generate the entry automatically:

```shell
npx web-extend g pages/welcome
```

### Popup

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/action) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action)

The popup is a temporary UI that appears when users click your extension's icon. The popup entry will be reflected to the `action.default_popup` field in `manifest.json`.

| Entry Path                       | Output Path  |
| -------------------------------- | ------------ |
| `popup.(js\|jsx\|ts\|tsx)`       | `popup.html` |
| `popup/index.(js\|jsx\|ts\|tsx)` | `popup.html` |

Generate the entry automatically:

```shell
npx web-extend g popup
```

Here's a basic popup example using React:

```tsx [src/popup/index.tsx]
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
```

See [with-popup](https://github.com/web-extend/examples/tree/main/with-popup) for an example.

### Sandbox

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest/sandbox), Firefox doesn't support sandbox.

The sandbox entry will be reflected to the `sandbox.pages` field in `manifest.json`.

| Entry Path                                  | Output Path             |
| ------------------------------------------- | ----------------------- |
| `sandbox.(js\|jsx\|ts\|tsx)`                | `sandbox.html`          |
| `sandbox/index.(js\|jsx\|ts\|tsx)`          | `sandbox.html`          |
| `sandboxes/{name}.(js\|jsx\|ts\|tsx)`       | `sandboxes/{name}.html` |
| `sandboxes/{name}/index.(js\|jsx\|ts\|tsx)` | `sandboxes/{name}.html` |

Generate the entry automatically.

```shell
# create a single entry
npx web-extend g sandbox

# create multiple entries
npx web-extend g sandboxes/sandbox1 sandboxes/sandbox2

```

To use the sandbox, you can embed it as an iframe inside an extension page or a content script.

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

See [with-sandbox](https://github.com/web-extend/examples/tree/main/with-sandbox) and [with-multi-sandboxes](https://github.com/web-extend/examples/tree/main/with-multi-sandboxes) for examples.

### Scripting

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/scripting) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting)

The scripting API allows you to inject JavaScript and CSS into web pages programmatically. This is different from content scripts as it provides more flexibility in when and where to inject the code.

| Entry Path                                 | Output Path            |
| ------------------------------------------ | ---------------------- |
| `scripting/{name}.(js\|jsx\|ts\|tsx)`      | `scripting/{name}.js`  |
| `scripting/{name}.(css\|less\|sass\|scss)` | `scripting/{name}.css` |

Example usage:

```ts [src/background.ts]
chrome.tabs.onActivated.addListener((e) => {
  chrome.scripting.executeScript({
    target: { tabId: e.tabId },
    files: ['scripting/injected-script.js'],
  });

  chrome.scripting.insertCSS({
    target: { tabId: e.tabId },
    files: ['scripting/injected-style.css'],
  });
});
```

See [with-scripting](https://github.com/web-extend/examples/tree/main/with-scripting) for an example.

### Side Panel

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Sidebars)

The side panel entry point will be reflected to the `side_panel.default_path` or `sidebar_action.default_panel` field in `manifest.json`.

| Entry Path                           | Output Path      |
| ------------------------------------ | ---------------- |
| `sidepanel.(js\|jsx\|ts\|tsx)`       | `sidepanel.html` |
| `sidepanel/index.(js\|jsx\|ts\|tsx)` | `sidepanel.html` |

Generate the entry automatically:

```shell
npx web-extend g sidepanel
```

See [with-sidepanel](https://github.com/web-extend/examples/tree/main/with-sidepanel) for an example.
