---
outline: deep
---

# Extension APIs

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/i18n) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)

## Using browser

WebExtend provides a simple unified browser object for all browsers. It is the same as the `chrome` object in Chrome and the `browser` object in Firefox.

For example:

```ts
import { browser } from 'web-extend';

browser.runtime.sendMessage({ type: 'message' });
```

The type of `browser` is from [`@types/chrome`](https://www.npmjs.com/package/@types/chrome).

## Using webextension-polyfill

If you are planning to support multiple browsers and the `browser` object doesn't cover your needs, you can use [`webextension-polyfill`](https://www.npmjs.com/package/webextension-polyfill).

For example:

```ts
import browser from 'webextension-polyfill';

browser.runtime.sendMessage({ type: 'message' });
```
