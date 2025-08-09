---
outline: [2, 3]
---

# Browser Support

Bext is designed to help you build cross-browser extensions with ease. This guide covers everything you need to know about browser compatibility, configuration, and development workflow.

## Browser Targets

Bext supports the following extension targets:

| Target        | Description         | Status                               |
| ------------- | ------------------- | ------------------------------------ |
| `chrome-mv3`  | Chrome Manifest V3  | Default, stable                      |
| `firefox-mv2` | Firefox Manifest V2 | Recommended for Firefox              |
| `firefox-mv3` | Firefox Manifest V3 | Experimental, dev mode not supported |
| `safari-mv3`  | Safari Manifest V3  | Experimental                         |
| `edge-mv3`    | Edge Manifest V3    | Stable                               |
| `opera-mv3`   | Opera Manifest V3   | Stable                               |

When using `chrome-mv3`, the built extension is compatible with most Chromium-based browsers, including:

- Google Chrome
- Microsoft Edge
- Brave
- Opera
- Other Chromium-based browsers

To specify a target browser, use the `--target` or `-t` flag with `bext` commands:

```shell
# Development mode
bext dev -t firefox-mv2

# Production build
bext build -t firefox-mv2

# Preview build
bext preview -t firefox-mv2

# Create zip package
bext zip -t firefox-mv2
```

### Environment Variables

Bext injects the `import.meta.env.WEB_EXTEND_TARGET` environment variable during build, which helps handle browser-specific code:

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

## Browser Compatibility

When developing cross-browser extensions, you'll encounter two main types of compatibility challenges:

1. Manifest configuration compatibility
2. Extension API compatibility

### Manifest Configuration

Bext automatically handles manifest compatibility by:

- Parsing entry files from the file system
- Reflecting them to `manifest.json` items
- Supporting custom manifest configuration

Example of custom manifest configuration:

```js [bext.config.ts]
import { defineConfig } from 'bext';

export default defineConfig({
  manifest: ({ target, mode }) => {
    return {
      // ...
    };
  },
});
```

Reference documentation:

- [Chrome Manifest](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Firefox Manifest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

### Extension API

Bext currently doesn't handle Extension API compatibility automatically. You'll need to manage this yourself using the following approaches:

#### For Chromium-based Browsers

Use the `chrome` API directly:

```ts
chrome.storage.local.set({ key: 'value' });
chrome.runtime.sendMessage({ type: 'message' });
```

Recommended packages: [@types/chrome](https://www.npmjs.com/package/@types/chrome)

#### For Firefox

Use the `webextension-polyfill` package:

```ts
import browser from 'webextension-polyfill';

// The API is similar to chrome.* but uses promises
browser.storage.local.set({ key: 'value' });
browser.runtime.sendMessage({ type: 'message' });
```

Recommended packages:

- [webextension-polyfill](https://www.npmjs.com/package/webextension-polyfill)
- [@types/webextension-polyfill](https://www.npmjs.com/package/@types/webextension-polyfill)

## Browser Startup

Bext automatically opens the appropriate browser when running development or preview commands:

```shell
# Development mode with auto-open
bext dev --open

# Preview production build
bext preview
```

The browser selection is based on the target:

- Firefox for `firefox-mv2` or `firefox-mv3`
- Chrome for all other targets

To customize settings for the runner, you can create a `web-ext.config.[m|c]js` file in the root directory. See [web-ext run](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run) for a full list of configurations.

### Recipes

#### Open the specific URL

Open a tab at the specificed URL when the browser starts. Example:

```js [web-ext.config.js]
import { defineWebExtConfig } from 'bext';

export default defineWebExtConfig({
  run: {
    startUrl: 'https://www.google.com',
  },
});
```

#### Open the specific browser

Provide a custom Chromium or Firefox executable path to open the specific browser.

```js [web-ext.config.js]
import { defineWebExtConfig } from 'bext';

export default defineWebExtConfig({
  run: {
    firefox: '/path/to/firefox',
    chromiumBinary: '/path/to/chrome',
  },
});
```

#### Preserve profile changes

`web-ext` creates a new temporary profile each time the browser starts. You can provide a profile path to keep profile changes. Example:

::: code-group

```js [Mac/Linux]
// web-ext.config.js
import { defineWebExtConfig } from 'bext';

export default defineWebExtConfig({
  run: {
    args: ['--user-data-dir=path/to/profile'],
  },
});
```

```js [Windows]
// web-ext.config.js
import { resolve } from 'node:path';
import { defineWebExtConfig } from 'bext';

export default defineWebExtConfig({
  run: {
    chromiumProfile: resolve('/path/to/profile'),
    keepProfileChanges: true,
  },
});
```

:::
