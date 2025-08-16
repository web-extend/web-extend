---
outline: deep
---

# Project Structure

## Overview

WebExtend provides a standardized project structure that helps you organize your browser extension code efficiently. This guide explains the key directories and files in a WebExtend project.

A typical WebExtend project structure looks like this:

```
.
├── public/                # Static assets
│   └── _locales/          # Localization files
├── src/                   # Source code
│   ├── assets/            # Processed assets
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   └── icon-128.png
│   ├── background.ts      # Background script
│   ├── content/           # Content script
│   │   └── index.ts
│   ├── devtools.ts        # DevTools page
│   ├── pages/
│   │   └── welcome/       # Page implementation
│   │       ├── index.ts
│   │       └── style.css
│   ├── popup/             # Popup UI
│   │   ├── index.ts
│   │   └── style.css
│   ├── options/           # Options page
│   │   └── index.ts
│   ├── scripting/         # Scripting injection
│   │   └── index.ts
│   └── sidepanel/         # Side panel
│       └── index.ts
├── .env                   # Environment variables
├── .env.development       # Development env vars
├── .env.production        # Production env vars
├── .gitignore             # Git ignore rules
├── package.json           # Project metadata
├── web-extend.config.ts   # WebExtend configuration
├── web-ext.config.ts      # Web-ext configuration
├── rsbuild.config.ts      # Rsbuild configuration
└── tsconfig.json          # TypeScript configuration
```

## Top-level Directory

The following table describes the main files and directories at the root of your project:

| Name                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `public/`                | Static assets that will be copied directly to the dist folder    |
| `src/`                   | Source code directory containing your extension's implementation |
| `.web-extend/`           | Temporary directory used by WebExtend for build artifacts        |
| `.env`                   | Environment variables loaded in all scenarios                    |
| `.env.local`             | Local environment overrides (should be added to `.gitignore`)    |
| `.env.development`       | Development-specific environment variables                       |
| `.env.production`        | Production-specific environment variables                        |
| `.env.development.local` | Local development environment overrides (add to `.gitignore`)    |
| `.env.production.local`  | Local production environment overrides (add to `.gitignore`)     |
| `.gitignore`             | Specifies which files Git should ignore                          |
| `package.json`           | Project metadata, dependencies and scripts                       |
| `rsbuild.config.ts`      | Rsbuild configuration file for build customization               |
| `web-extend.config.ts`   | Configuration file for WebExtend                                 |
| `web-ext.config.ts`      | Configuration file for web-ext                                   |
| `tsconfig.json`          | TypeScript configuration (if using TypeScript)                   |

### src Directory

Source directory is used to organize source files.

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

### web-extend.config.ts

WebExtend allows customization of various aspects of your project through the `web-extend.config.(ts|js|mjs)` file.

For example:

```ts [web-extend.config.ts]
import { defineConfig } from 'web-extend';

export default defineConfig({
  entriesDir: './src', // Entries directory (default: "src")
  outDir: '.output', // Output directory (default: "dist")
  manifest: {}, // Custom manifest overrides (default: {})
  target: 'firefox-mv2', // Browser target (default: "chrome-mv3")
  webExt: {}, // Customize web-ext configurations
  rsbuild: {}, // Customize Rsbuild configurations
});
```

### web-ext.config.ts

WebExtend uses [web-ext](https://github.com/mozilla/web-ext) as the browser runner. You can customize runner configurations through either:

- The `webExt` option in `web-extend.config.js` file
- A separate `web-ext.config.(ts|js|mjs)` file

When both configuration methods are provided, the `webExt` option in `web-extend.config.js` will take precedence, and `web-ext.config.js` will be ignored.

For example:

```ts [web-ext.config.ts]
import { defineWebExtConfig } from 'web-extend';

export default defineWebExtConfig({
  startUrl: ['https://example.com'],
});
```

### rsbuild.config.ts

WebExtend uses [Rsbuild](https://rsbuild.rs/) as the bundler. You can customize Rsbuild configurations through either:

- The `rsbuild` option in `web-extend.config.js` file
- A separate `rsbuild.config.(ts|js|mjs)` file

When both configuration methods are provided, the `rsbuild` option in `web-extend.config.js` will take precedence, and `rsbuild.config.js` will be ignored.

For example:

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
});
```
