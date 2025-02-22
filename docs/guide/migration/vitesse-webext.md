---
outline: deep
---

# vitesse-webext

## 优点

支持 content script HRM，并且速度更快。

## 变更项

### package.json 变化

- 增加 "type": "module"
- scripts 变化，包括 dev, build, zip
- 安装依赖项：web-extend 及 Rsbuild 相关依赖

### 构建工具变化：使用 Rsbuild 替代 Vite

增加 rsbuild.config.js 文件，替代 vite 配置文件

- 插件变化
- html mountId，使用 html 模板
- resolve.alias 同步：～
- define 定义：**DEV, **NAME\_\_
- 相关插件
  - 添加 web-extend 插件
  - Vue 插件
  - unplugin-auto-import
  - unplugin-vue-components
  - unplugin-icons
- 添加 env.d.ts（待修改）
- 其他更改参考 Rsbuild 配置。

支持自动导入

- 版本升级，使用 rspack 的版本
- AutoImport
- Components

支持 unocss:

- 使用 @unocss/postcss
- 更改 unocss 配置文件
- unocss 入口更改，使用 @unocss

### 源码变化

- icon 变化
- contentScripts -> content
- popup/options/sidepanel 的入口去掉 html，将 main 改为 index.ts
- 移除 manifest 中的入口。只保留必要的项。
- 构建的产物目录为 dist/chrome-mv3-prod，而不在是 extension。

任何问题，请提出来。

https://github.com/antfu-collective/vitesse-webext
https://rsbuild.dev/guide/migration/vite
