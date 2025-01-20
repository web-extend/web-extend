# Project Structure

## Top-level Folders

Top-level are used to organize the following folders or files.

| Name                     | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `public/`                | Static assets to be copyed to dist directly                                 |
| `src/`                   | Source folders                                                              |
| `.web-extend/`           | Temp folder for WebExtend                                                   |
| `.env`                   | Loaded by default in all scenarios.                                         |
| `.env.local`             | Local usage of the .env file, should be added to `.gitignore`               |
| `.env.development`       | Read when `process.env.NODE_ENV` is 'development'                           |
| `.env.production`        | Read when `process.env.NODE_ENV` is 'production'                            |
| `.env.development.local` | Local usage of the `.env.development` file, should be added to `.gitignore` |
| `.env.production.local`  | Local usage of the `.env.production` file, should be added to `.gitignore`  |
| `.gitignore`             | Git files and folders to ignore                                             |
| `package.json`           | Project dependencies and scripts                                            |
| `rsbuild.config.js`      | Configuration file for Rsbuild                                              |
| `tsconfig.json`          | Configuration file for TypeScript                                           |

## Source Folders

Source Foldes are used to organize [entries](./entrypoints.md), components, lib, etc folders or files.

| Name                     | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `assets/`                | Static assets to be processed by the build tool |
| `background`             | Background entry                                |
| `content` or `contents`  | Content entry                                   |
| `popup`                  | Popup entry                                     |
| `options`                | Options entry                                   |
| `sidepanel`              | Sidepanel entry                                 |
| `devtools`               | Devtools entry                                  |
| `sandbox` or `sandboxes` | Sandbox entry                                   |
| `newtab`                 | Newtab entry                                    |
| `bookmarks`              | Bookmarks entry                                 |
| `history`                | History entry                                   |

## Manifest Mapping

WebExtend parses entry files and generates `manifest.json` automatically based on the file system. The mapping relationship is as follows.

| Manifest Keys                    | The Reflection Path                              |
| -------------------------------- | ------------------------------------------------ |
| `manifest_version`               | The default is `3`                               |
| `name`                           | `displayName` or `name` in package.json          |
| `version`                        | `version` in package.json                        |
| `description`                    | `description` in package.json                    |
| `author`                         | `author` in package.json                         |
| `homepage_url`                   | `homepage` in package.json                       |
| `icons` 、`action.default_icon`  | `src/assets/icon-[size].png`                     |
| `action.default_popup`           | `src/popup.js` or `src/popup/index.js`           |
| `background.service_worker`      | `src/background.js` or `src/background/index.js` |
| `content_scripts`                | `src/content.js` or `src/contents/*.js`          |
| `options_ui.page`                | `src/options.js` or `src/options/index.js`       |
| `devtools_page`                  | `src/devtools.js` or `src/devtools/index.js`     |
| `sandbox`                        | `src/sandbox.js` or `src/sandboxes/*.js`         |
| `chrome_url_overrides.newtab`    | `src/newtab.js` or `src/newtab/index.js`         |
| `chrome_url_overrides.bookmarks` | `src/bookmarks.js` or `src/bookmarks/index.js`   |
| `chrome_url_overrides.history`   | `src/history.js` or `src/history/index.js`       |
| `side_panel.default_path`        | `src/sidepanel.js` or `src/sidepanel/index.js`   |
| `_locales`                       | `public/_locales/*`                              |
| `web_accessible_resources`       | `public/*`                                       |

## Custom Configuration

WebExtend also supports custom settings for the source folder, the dist folder, etc.

::: code-group

```js [rsbuild.config.js]
import { defineConfig } from '@rsbuild/core';
import { pluginWebExtend } from '@web-extend/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginWebExtend({
      srcDir: "src", // default: "src" // [!code highlight]
      outDir: "dist", // default: "dist/[target]-[mode]" // [!code highlight]
      manifest: {...}, // default: {} // [!code highlight]
      target: "firefox-mv2", // default: "chrome-mv3" // [!code highlight]
    }),
  ],
});
```

:::
