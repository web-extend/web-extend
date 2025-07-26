---
outline: deep
---

# Project Structure

## Overview

WebExtend provides a standardized project structure that helps you organize your browser extension code efficiently. This guide explains the key directories and files in a WebExtend project.

A typical WebExtend project structure looks like this:

```
my-extension-app/
├── public/                # Static assets
│   └── _locales/          # Localization files
├── src/                   # Source code
│   ├── assets/            # Processed assets
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   └── icon-128.png
│   ├── background.js      # Background script
│   ├── content/           # Content script
│   │   └── index.js
│   ├── devtools.js        # DevTools page
│   ├── pages/
│   │   └── welcome/       # Page implementation
│   │       ├── index.js
│   │       └── style.css
│   ├── popup/             # Popup UI
│   │   ├── index.js
│   │   └── style.css
│   ├── options/           # Options page
│   │   └── index.js
│   ├── scripting/         # Scripting injection
│   │   └── index.js
│   └── sidepanel/         # Side panel
│       └── index.js
├── .env                   # Environment variables
├── .env.development       # Development env vars
├── .env.production        # Production env vars
├── .gitignore             # Git ignore rules
├── package.json           # Project metadata
├── bext.config.js         # WebExtend configuration
├── web-ext.config.js      # Web-ext configuration
├── rsbuild.config.ts      # Rsbuild configuration
└── tsconfig.json          # TypeScript configuration
```

## Top-level Directory

The following table describes the main files and directories at the root of your project:

| Name                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `public/`                | Static assets that will be copied directly to the dist folder    |
| `src/`                   | Source code directory containing your extension's implementation |
| `.env`                   | Environment variables loaded in all scenarios                    |
| `.env.local`             | Local environment overrides (should be added to `.gitignore`)    |
| `.env.development`       | Development-specific environment variables                       |
| `.env.production`        | Production-specific environment variables                        |
| `.env.development.local` | Local development environment overrides (add to `.gitignore`)    |
| `.env.production.local`  | Local production environment overrides (add to `.gitignore`)     |
| `.gitignore`             | Specifies which files Git should ignore                          |
| `package.json`           | Project metadata, dependencies and scripts                       |
| `rsbuild.config.ts`      | Rsbuild configuration file for build customization               |
| `bext.config.js`         | Configuration file for WebExtend                                 |
| `web-ext.config.js`      | Configuration file for web-ext                                   |
| `tsconfig.json`          | TypeScript configuration (if using TypeScript)                   |

## Entries Directory

Entries directory is used to organize entry files.

| Name                       | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `assets/`                  | Static assets that need processing (e.g., images, styles) |
| `background/`              | Background script implementation                          |
| `bookmarks/`               | Bookmarks page override implementation                    |
| `content/` or `contents/`  | Content scripts (single or multiple)                      |
| `devtools/`                | DevTools implementation                                   |
| `history/`                 | History page override implementation                      |
| `newtab/`                  | New tab page override implementation                      |
| `options/`                 | Options page implementation                               |
| `pages/`                   | HTML Pages                                                |
| `popup/`                   | Extension popup UI implementation                         |
| `sandbox/` or `sandboxes/` | Sandbox pages (single or multiple)                        |
| `scripting/`               | Scripting injection implementation                        |
| `sidepanel/`               | Side panel implementation                                 |

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

## Configuration Files

### .env

WebExtend uses a flexible environment configuration system:

```
.env                   # Base variables, always loaded
.env.local             # Local overrides (git-ignored)
.env.development       # Development-specific variables
.env.production        # Production-specific variables
.env.[mode].local      # Local mode-specific overrides (git-ignored)
```

Loading priority (highest to lowest):

1. `.env.[mode].local`
2. `.env.[mode]`
3. `.env.local`
4. `.env`

Example configuration:

```
# .env
API_ENDPOINT=https://api.example.com
DEBUG=false

# .env.development
API_ENDPOINT=https://dev-api.example.com
DEBUG=true
```

See [environment variables](../essentials/environment-variables.md) for more details.

### bext.config.js

WebExtend allows customization of various aspects of your project through the `bext.config.(ts|js|mjs)` file.

For example:

```ts [bext.config.js]
import { defineConfig } from 'bext';

export default defineConfig({
  entriesDir: './src', // Entries directory (default: "src")
  outDir: '.output', // Output directory (default: "dist")
  manifest: {}, // Custom manifest overrides (default: {})
  target: 'firefox-mv2', // Browser target (default: "chrome-mv3")
  webExt: {}, // Customize web-ext configurations
  rsbuild: {}, // Customize Rsbuild configurations
});
```

### web-ext.config.js

WebExtend uses [web-ext](https://github.com/mozilla/web-ext) as the browser runner. You can customize runner configurations through either:

- The `webExt` option in `bext.config.js` file
- A separate `web-ext.config.(ts|js|mjs)` file

When both configuration methods are provided, the `webExt` option in `bext.config.js` will take precedence, and `web-ext.config.js` will be ignored.

For example:

```javascript [web-ext.config.js]
import { defineWebExtConfig } from 'bext';

export default defineWebExtConfig({
  startUrl: ['https://example.com'],
});
```

### rsbuild.config.js

WebExtend uses [Rsbuild](https://rsbuild.rs/) as the bundler. You can customize Rsbuild configurations through either:

- The `rsbuild` option in `bext.config.js` file
- A separate `rsbuild.config.(ts|js|mjs)` file

When both configuration methods are provided, the `rsbuild` option in `bext.config.js` will take precedence, and `rsbuild.config.js` will be ignored.

For example:

```js [rsbuild.config.js]
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
});
```
