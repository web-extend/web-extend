---
outline: [2, 3]
---

# Manifest

[Chrome Docs](https://developer.chrome.com/docs/extensions/reference/manifest) | [Firefox Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

## Manifest Generation

There is no need to manually write `manifest.json` file, WebExtend will generate it automatically based on your project structure. The following table shows how your files map to manifest fields:

| Manifest Keys                    | Source Location                                  |
| -------------------------------- | ------------------------------------------------ |
| `manifest_version`               | Defaults to `3`                                  |
| `name`                           | `displayName` or `name` from package.json        |
| `version`                        | `version` from package.json                      |
| `description`                    | `description` from package.json                  |
| `author`                         | `author` from package.json                       |
| `homepage_url`                   | `homepage` from package.json                     |
| `icons`, `action.default_icon`   | `src/assets/icon-[size].png`                     |
| `action.default_popup`           | `src/popup/index.js` or `src/popup.js`           |
| `background.service_worker`      | `src/background/index.js` or `src/background.js` |
| `content_scripts`                | `src/content/index.js` or `src/contents/*.js`    |
| `options_ui.page`                | `src/options/index.js` or `src/options.js`       |
| `devtools_page`                  | `src/devtools/index.js` or `src/devtools.js`     |
| `sandbox.pages`                  | `src/sandbox/index.js` or `src/sandboxes/*.js`   |
| `chrome_url_overrides.newtab`    | `src/newtab/index.js` or `src/newtab.js`         |
| `chrome_url_overrides.bookmarks` | `src/bookmarks/index.js` or `src/bookmarks.js`   |
| `chrome_url_overrides.history`   | `src/history/index.js` or `src/history.js`       |
| `side_panel.default_path`        | `src/sidepanel/index.js` or `src/sidepanel.js`   |
| `_locales`                       | `public/_locales/*`                              |
| `web_accessible_resources`       | `public/*`                                       |

## Customizing Manifest

WebExtend also allows you to customize the manifest configuration through the `manifest` option.

For example:

```js [web-extend.config.ts]
import { defineConfig } from 'web-extend';

export default defineConfig({
  manifest: ({ target, mode }) => {
    return {
      // ...
    };
  },
});
```
