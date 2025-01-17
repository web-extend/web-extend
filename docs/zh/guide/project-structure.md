# 项目结构

## 顶层目录

顶层文件位于项目的根目录下。

| 目录                |                描述                |
| ------------------- | :--------------------------------: |
| `public`            |          公共静态资源目录          |
| `src`               |              源码目录              |
| `.web-extend`       | WebExtend 临时目录，存储构建信息等 |
| `package.json`      |          项目的依赖和脚本          |
| `rsbuild.config.js` |          Rsbuild 配置文件          |
| `tsconfig.json`     |        TypeScript 配置文件         |

## 源码目录

源码内容位于 src 目录下，用来存放扩展的入口文件和其他源码内容。

| 目录     |     描述     |
| -------- | :----------: |
| `assets` | 静态资源目录 |

## Manifest 配置

WebExtend 会按下以下格式自动解析配置项。

| Manifest Field             | File Path                                |
| -------------------------- | ---------------------------------------- |
| `name`                     | `displayName` or `name` in package.json  |
| `version`                  | `version` in package.json                |
| `description`              | `description` in package.json            |
| `author`                   | `author` in package.json                 |
| `homepage_url`             | `homepage` in package.json               |
| `icons`                    | `assets/icon-[size].png`                 |
| `action`                   | `popup.ts` or `popup/index.ts`           |
| `background`               | `background.ts` or `background/index.ts` |
| `content_scripts`          | `content.ts` or `contents/*.ts`          |
| `options_ui`               | `options.ts` or `options/index.ts`       |
| `devtools_page`            | `devtools.ts` or `devtools/index.ts`     |
| `sandbox`                  | `sandbox.ts` or `sandboxes/*.ts`         |
| `newtab`                   | `newtab.ts` or `newtab/index.ts`         |
| `bookmarks`                | `bookmarks.ts` or `bookmarks/index.ts`   |
| `history`                  | `history.ts` or `history/index.ts`       |
| `side_panel`               | `sidepanel.ts` or `sidepanel/index.ts`   |
| `_locales`                 | `public/_locales/*`                      |
| `web_accessible_resources` | `public/*`                               |

## 自定义配置

```js
// rsbuild.config.js
export default defineConfig({
  plugins: [
    pluginWebExt({
      srcDir: "src", // default: "src"
      outDir: "dist", // default: "dist/[target]-[mode]"

      manifest: {},
      target: "firefox-mv2", // default: "chrome-mv3"
    }),
  ],
});
```
