---
outline: deep
---

# Browser Relevant

## Extension Target

WebExtend supports the following extension targets.

- `chrome-mv3` (default)
- `firefox-mv2` (recommended for Firefox)
- `firefox-mv3` (experimental, doesn't work in dev mode)
- `safari-mv3`
- `edge-mv3`
- `opera-mv3`

When the target is `chrome-mv3`, the built extension can be used in most Chromium-based browsers, such as Chrome, Edge, Brave, Opera, etc.

To use a specific target, you can set a `-t` or `--target` flag for `web-extend` subcommands. Example:

```shell
web-extend rsbuild:dev -t firefox-mv2
web-extend rsbuild:build -t firefox-mv2
web-extend preview -t firefox-mv2
web-extend zip -t firefox-mv2
```

Alternatively, you can set the target option in `pluginWebExtend()`.

::: code-group

```js [rsbuild.config.js]
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default defineConfig({
  plugins: [
    pluginWebExtend({
      target: "firefox-mv2",
    }),
  ],
});
```

:::

## Manifest Compatibility

WebExtend uses the file system to parse entry files and reflect them to items in `manifest.json` automatically, so you don't need to care about the campatibility of `manifest.json` between differnent browsers.

Additionally, you can define the manifest option as a function in `pluginWebExtend()` for custom manifest compatibility.

::: code-group

```js [rsbuild.config.js]
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

Manifest documents are as follows.

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

## Extension API Compatibility

One thing that's important to note is that WebExtend won't deal with the compatibility of Extension APIs for now, so you need to do it yourself.

Extension API documents are as follows.

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)

### For Chromium-based

You can use `chrome` API directly. If you use TypeScript, [`@types/chrome`](https://www.npmjs.com/package/@types/chrome) is recommended to be installed.

### For Firefox

It is recommended to install [webextension-polyfill](https://www.npmjs.com/package/webextension-polyfill). If you use TypeScript, [@types/webextension-polyfill](https://www.npmjs.com/package/@types/webextension-polyfill) is also recommended. An example is as follows.

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

## Browser Startup

When running the following commands, `web-extend` will open a browser with the extension automatically. If the target is `firefox-mv2` or `firefox-mv3`, Firefox will be opened, otherwise Chrome will be opened.

```shell
# developemnt
web-extend rsbuild:dev --open

# production
web-extend preview
```

The feature above is based on the `run` command of `web-ext`. To custom settings for the runner, you can create `web-ext.config.[m|c]js` in the root.

See [web-ext run](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run) for a full list of config. Here are some common custom settings.

### Open the specific URL

Open a tab at the specificed URL when the browser starts. Example:

::: code-group

```js [web-ext.config.js]
export default {
  run: {
    startUrl: "https://www.google.com",
  },
};
```

:::

### Open the specific browser

Provie a custom Chromium or Firefox executable path to open the specific browser. Example:

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

### Preserve profile changes

`web-ext` creates a new temporary profile each time the browser starts. You can provide a profile path to keep profile changes. Example:

::: code-group

```js [web-ext.config.js]
export default {
  run: {
    args: ["--user-data-dir=path/to/profile"],
  },
};
```

:::
