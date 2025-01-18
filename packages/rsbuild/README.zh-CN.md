# @web-extend/rsbuild-plugin

[English](./README.md) | 简体中文

一个用于开发和构建浏览器扩展的 Rsbuild 插件，让浏览器扩展开发变得简单高效。

<p>
  <a href="https://npmjs.com/package/@web-extend/rsbuild-plugin">
   <img src="https://img.shields.io/npm/v/@web-extend/rsbuild-plugin?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@web-extend/rsbuild-plugin?minimal=true"><img src="https://img.shields.io/npm/dm/@web-extend/rsbuild-plugin.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## 特性

- **[声明式开发](#declarative-development)** - 基于目录结构自动生成配置，无需复杂设置
- **无缝的开发体验** - 实时页面更新，支持 HMR 和 Live-Reloading
- **TypeScript 支持** - 开箱即用的类型支持，无需额外配置
- **[浏览器兼容](#browser-compatibility)** - 统一的 API 和 polyfills，轻松实现多浏览器支持
- **框架无关** - 可以自由使用任何前端框架和库
- **极速性能** - 基于 Rsbuild 实现极速开发和构建

## 快速开始

### 安装

```bash
npm add @web-extend/rsbuild-plugin -D
```

### 项目设置

1. 为你的浏览器扩展创建入口文件：（参考[声明式开发](#declarative-development)了解更多）

```
src/
├── popup.ts      # Extension popup
├── background.ts # Background service worker
└── content.ts    # Content script
```

2. 在 `rsbuild.config.ts` 中添加插件：

```ts
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default {
  plugins: [pluginWebExtend()],
};
```

3. 添加 npm 脚本：

```json
{
  "scripts": {
    "dev": "rsbuild dev",
    "build": "rsbuild build"
  }
}
```

### 开发

- 运行 `npm run dev` 启动开发服务
- 在浏览器扩展页面开启开发者模式，加载 `dist` 目录
- 运行 `npm run build` 构建生产版本

## 选项

### manifest

浏览器扩展的 manifest 配置。如果未指定配置项，将基于目录结构自动生成。

### srcDir

源码目录路径，默认为 `./src`，如果 `./src` 不存在，则默认为项目根目录。

### target

目标浏览器，支持：

- `chrome-mv3`（默认）
- `firefox-mv3`
- `firefox-mv2`
- `safari-mv3`

<h2 id="declarative-development">声明式开发</h2>

支持基于以下目录结构自动生成配置：

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

**注意**：入口文件位于 `srcDir` 目录下（默认为 `./src`），而 `public` 目录位于项目根目录。

<h2 id="browser-compatibility">浏览器兼容</h2>

默认构建目标为 Chrome MV3，可以通过 `target` 选项指定其他浏览器。

如需跨浏览器支持，推荐使用：

- [`webextension-polyfill`](https://www.npmjs.com/package/webextension-polyfill) - 统一的浏览器扩展 API
- [`@types/webextension-polyfill`](https://www.npmjs.com/package/@types/webextension-polyfill) - TypeScript 类型定义

## 示例

查看[示例项目](./examples/)了解更多使用方式。

## 许可证

[MIT](./LICENSE)
