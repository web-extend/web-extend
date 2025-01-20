# Browser Compatibility

## Browser Target

WebExtend supports the following browser targets.

- `chrome-mv3` (default)
- `firefox-mv3`
- `firefox-mv2`
- `safari-mv3`
- `edge-mv3`
- `opera-mv3`

An example of custom browser target is as follows.

::: code-group

```js [rsbuild.config.js]
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

## Manifest Compatibility

WebExtend uses the file system to parse entry files and reflect them to items in `manifest.json` automatically, so you don't need to care about the campatibility of `manifest.json` between differnent browsers.

Manifest Documents:

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

## Extension API Compatibility

One thing that's important to note is that WebExtend won't deal with the compatibility of Extension API, so you should do it yourself if necessary.

Extension API Documents：

- [Chrome Docs](https://developer.chrome.com/docs/extensions/reference/api)
- [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)

**When the target is Chrome**

You can use `chrome` API directly. If you use TypeScript, [`@types/chrome`](https://www.npmjs.com/package/@types/chrome) is recommended to be installed.

**When the target is Firefox**

It is recommended to install [webextension-polyfill](https://www.npmjs.com/package/webextension-polyfill). If you use TypeScript, [@types/webextension-polyfill](https://www.npmjs.com/package/@types/webextension-polyfill) is also recommended to be installed. An example is as follows.

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

When running the follow commands, the extension will be loaded automatically. If the target is `firefox-mv2` or `firefox-mv3`, Firefox will be opened, otherwise Chrome will be opened.

```shell
# developemnt
npx web-extend rsbuild:dev --open

# production preview
npx web-extend preview
```
