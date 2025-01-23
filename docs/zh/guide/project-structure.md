# 项目结构 {#project-structure}

## 顶层目录 {#top-level-folders}

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
| `rsbuild.config.js`      | Rsbuild 配置文件                                                                            |
| `tsconfig.json`          | TypeScript 配置文件                                                                         |

## 源码目录 {#source-folders}

项目的源码目录用于组织[入口](./entrypoints.md)、组件、库等目录或文件。

| 名称                     | 描述                                                      |
| ------------------------ | --------------------------------------------------------- |
| `assets/`                | 静态资源目录，存放 icons 等文件，这些资源会被构建工具处理 |
| `background`             | background 入口                                           |
| `content` 或 `contents`  | 单个或多个 content 入口                                   |
| `popup`                  | popup 入口                                                |
| `options`                | options 入口                                              |
| `sidepanel`              | sidepanel 入口                                            |
| `devtools`               | devtools 入口                                             |
| `sandbox` 或 `sandboxes` | 单个或多个 sandbox 入口                                   |
| `newtab`                 | newtab 入口                                               |
| `bookmarks`              | bookmarks 入口                                            |
| `history`                | history 入口                                              |

## Manifest 映射 {#manifest-mapping}

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

## 自定义配置

WebExtend 支持自定义项目中的源码目录、输出目录等信息。

::: code-group

```js [rsbuild.config.js]
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

:::
