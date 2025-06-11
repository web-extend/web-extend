---
outline: deep
---

# 目录结构 {#project-structure}

## 概览

WebExtend 提供了一个标准化的项目结构，可帮助你有效地组织浏览器扩展代码。本指南介绍了 WebExtend 项目中的关键目录和文件。

一个典型的 WebExtend 项目目录结构如下。

```
my-web-extension/
├── public/                # Static assets
│   └── _locales/          # Localization files
├── src/                   # Source code
│   ├── assets/            # Processed assets
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   └── icon-128.png
│   ├── background/        # Background script
│   │   └── index.js
│   ├── content/           # Content script
│   │   └── index.js
│   ├── devtools.js        # DevTools page
│   ├── pages/
│   │   ├── welcome/
│   │   │   ├── index.js
│   │   │   └── style.css
│   │   └── panel/         # Panel implementation
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
├── rsbuild.config.ts      # Build configuration
├── web-ext.config.js      # Web-ext configuration
└── tsconfig.json          # TypeScript configuration
```

## 顶层目录 {#top-level-folder}

项目的顶层目录用于组织公共静态资源、源码、项目配置等目录或文件。

| 名称                     | 描述                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `public/`                | 公共的静态资源，这些资源会被直接拷贝到构建产物目录下                                        |
| `src/`                   | 源码目录                                                                                    |
| `.web-extend/`           | WebExtend 临时目录，存放构建信息                                                            |
| `.env`                   | 公共环境变量文件                                                                            |
| `.env.local`             | 本地的公共环境变量文件，需要添加到 .gitignore 中                                            |
| `.env.development`       | 环境变量文件，在 process.env.NODE_ENV 为 'development' 时有效                               |
| `.env.production`        | 环境变量文件，在 process.env.NODE_ENV 为 'production' 时有效                                |
| `.env.development.local` | 本地环境变量文件，在 process.env.NODE_ENV 为 'development' 时有效，需要添加到 .gitignore 中 |
| `.env.production.local`  | 本地环境变量文件，在 process.env.NODE_ENV 为 'production' 时有效，需要添加到 .gitignore 中  |
| `.gitignore`             | Git 的忽略文件                                                                              |
| `package.json`           | 项目的依赖和脚本                                                                            |
| `rsbuild.config.ts`      | Rsbuild 配置文件                                                                            |
| `web-ext.config.js`      | web-ext 配置文件                                                                            |
| `tsconfig.json`          | TypeScript 配置文件                                                                         |

## 源码目录 {#source-folder}

项目的源码目录用于组织入口、组件、库等目录或文件。

| 名称                     | 描述                                                      |
| ------------------------ | --------------------------------------------------------- |
| `assets/`                | 静态资源目录，存放 icons 等文件，这些资源会被构建工具处理 |
| `background`             | background 入口                                           |
| `bookmarks`              | bookmarks 入口                                            |
| `content` 或 `contents`  | 单个或多个 content 入口                                   |
| `devtools`               | devtools 入口                                             |
| `history`                | history 入口                                              |
| `newtab`                 | newtab 入口                                               |
| `options`                | options 入口                                              |
| `pages/`                 | HTML 页面                                                 |
| `popup`                  | popup 入口                                                |
| `sidepanel`              | sidepanel 入口                                            |
| `sandbox` 或 `sandboxes` | 单个或多个 sandbox 入口                                   |
| `scripting/`             | Scripting 注入                                            |
| `sidepanel/`             | Side panel 入口                                           |

## Manifest 生成 {#manifest-mapping}

WebExtend 中无需手动维护 [`manifest.json`](https://developer.chrome.com/docs/extensions/reference/manifest) 文件，它会基于文件系统自动生成 `manifest.json` 中的配置项，对应的映射关系如下。

| Manifest 字段                    | 映射路径                                         |
| -------------------------------- | ------------------------------------------------ |
| `manifest_version`               | 默认为 `3`                                       |
| `name`                           | `package.json` 的 `displayName` 或 `name` 字段   |
| `version`                        | `package.json` 的 `version` 字段                 |
| `description`                    | `package.json` 的 `description` 字段             |
| `author`                         | `package.json` 的 `author` 字段                  |
| `homepage_url`                   | `package.json` 的 `homepage` 字段                |
| `icons` 、`action.default_icon`  | `src/assets/icon-[size].png`                     |
| `action.default_popup`           | `src/popup.js` 或 `src/popup/index.js`           |
| `background.service_worker`      | `src/background.js` 或 `src/background/index.js` |
| `content_scripts`                | `src/content.js` 或 `src/contents/*.js`          |
| `options_ui.page`                | `src/options.js` 或 `src/options/index.js`       |
| `devtools_page`                  | `src/devtools.js` 或 `src/devtools/index.js`     |
| `sandbox.pages`                  | `src/sandbox.js` 或 `src/sandboxes/*.js`         |
| `chrome_url_overrides.newtab`    | `src/newtab.js` 或 `src/newtab/index.js`         |
| `chrome_url_overrides.bookmarks` | `src/bookmarks.js` 或 `src/bookmarks/index.js`   |
| `chrome_url_overrides.history`   | `src/history.js` 或 `src/history/index.js`       |
| `side_panel.default_path`        | `src/sidepanel.js` 或 `src/sidepanel/index.js`   |
| `_locales`                       | `public/_locales/*`                              |
| `web_accessible_resources`       | `public/*`                                       |

## 配置文件

### 环境变量配置

WebExtend 使用灵活的环境配置系统：

```
.env                   # Base variables, always loaded
.env.local             # Local overrides (git-ignored)
.env.development       # Development-specific variables
.env.production        # Production-specific variables
.env.[mode].local      # Local mode-specific overrides (git-ignored)
```

优先级从高到低依次如下：

1. `.env.[mode].local`
2. `.env.[mode]`
3. `.env.local`
4. `.env`

配置示例

```env
# .env
API_ENDPOINT=https://api.example.com
DEBUG=false

# .env.development
API_ENDPOINT=https://dev-api.example.com
DEBUG=true
```

参考 [environment variables](../essentials/environment-variables.md)。

### 构建配置

WebExtend 支持自定义项目中的源码目录、输出目录等信息。

```js [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import { pluginWebExtend } from '@web-extend/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginWebExtend({
      srcDir: "src", // default: "src" [!code highlight]
      outDir: "dist", // default: "dist/[target]-[mode]" [!code highlight]
      manifest: {...}, // default: {}  [!code highlight]
      target: "firefox-mv2", // default: "chrome-mv3" [!code highlight]
    }),
  ],
});
```

参考 [@web-extend/rsbuild-plugin](../../api/rsbuild-plugin.md)。

### Web-ext 配置

`web-ext.config.js` 用于配置 web-ext 工具，示例如下：

```javascript [web-ext.config.js]
module.exports = {
  run: {
    startUrl: ["about:debugging#/runtime/this-firefox"],
    firefox: "firefoxdeveloperedition",
    browserConsole: true,
  },
};
```

参考 [browser startup](./browsers.md#browser-startup)。
