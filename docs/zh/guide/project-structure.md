# 项目结构

## 顶层目录

项目根目录通常存放如下目录或文件。

| 名称                | 描述                                                 |
| ------------------- | ---------------------------------------------------- |
| `public`            | 公共的静态资源，这些资源会被直接拷贝到构建产物目录下 |
| `src`               | 源码目录                                             |
| `.web-extend`       | WebExtend 临时目录，存放构建信息                     |
| `.env`、`.env.*`    | 环境变量配置文件                                     |
| `.gitignore`        | 定义 git 忽略文件                                    |
| `package.json`      | 项目的依赖和脚本                                     |
| `rsbuild.config.js` | Rsbuild 配置文件                                     |
| `tsconfig.json`     | TypeScript 配置文件                                  |

## 源码目录

项目源码目录通常存放入口文件等代码。

| 名称                     | 描述                                                      |
| ------------------------ | --------------------------------------------------------- |
| `assets`                 | 静态资源目录，存放 icons 等文件，这些资源会被构建工具处理 |
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

[什么是入口](./extension-entrypoints.md)

## Manifest 映射

WebExtend 会基于文件系统自动构建和生成 `manifest.json` 中的配置项，对应的映射关系如下。

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
| `sandbox`                        | `src/sandbox.js` 或 `src/sandboxes/*.js`         |
| `chrome_url_overrides.newtab`    | `src/newtab.js` 或 `src/newtab/index.js`         |
| `chrome_url_overrides.bookmarks` | `src/bookmarks.js` 或 `src/bookmarks/index.js`   |
| `chrome_url_overrides.history`   | `src/history.js` 或 `src/history/index.js`       |
| `side_panel.default_path`        | `src/sidepanel.js` 或 `src/sidepanel/index.js`   |
| `_locales`                       | `public/_locales/*`                              |
| `web_accessible_resources`       | `public/*`                                       |

## 自定义配置

WebExtend 支持自定义项目中的源码目录、输出目录，和传递 `manifest.json` 中其他配置项。

::: code-group

```js [rsbuild.config.js]
import { defineConfig } from '@rsbuild/core';
import { pluginWebExt } from 'rsbuild-plugin-web-ext';

export default defineConfig({
  plugins: [
    pluginWebExt({
      srcDir: "src", // default: "src" // [!code highlight]
      outDir: "dist", // default: "dist/[target]-[mode]" // [!code highlight]
      manifest: {...}, // default: {} // [!code highlight]
      target: "firefox-mv2", // default: "chrome-mv3" // [!code highlight]
    }),
  ],
});
```

:::
