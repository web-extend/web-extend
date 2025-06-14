---
outline: deep
---

# 介绍 {#introdcution}

## 什么是 WebExtend {#what}

WebExtend 是一个旨在简化 Web 扩展开发的现代构建工具。它提供了一个强大、简单的开发环境，允许你使用最新的 Web 技术创建跨浏览器扩展。无论您是构建简单的实用程序还是复杂的浏览器扩展，WebExtend 都提供了帮助你的开发过程高效和愉快的工具和工作流程。

## 为什么选 WebExtend {#why}

虽然目前社区中已经有一些类似的构建工具，如 Plasmo、WXT、CRXJS 等，但 WebExtend 通过解决常见痛点并提供独特优势而脱颖而出：

### 主要优势

- **卓越的热模块替换 (HMR)**：为所有扩展组件（包括 content_scripts）提供完整的 HMR 支持，在开发过程中保持状态
- **开发者友好的 API**：简洁直观的 API，减少样板代码和复杂性
- **优化的性能**：基于 Rsbuild 构建，提供卓越的构建速度和开发体验
- **零配置**：开箱即用的合理默认值，同时保持自定义的灵活性

### 解决的常见痛点

许多现有工具存在以下限制，而 WebExtend 专门解决了这些问题：

- ❌ 不支持 content_scripts HMR，需要刷新页面
- ❌ 复杂或令人困惑的 API，增加学习曲线
- ❌ 有限的浏览器兼容性
- ❌ 构建时间慢，开发体验差

WebExtend 以深思熟虑、以开发者为中心的方式解决了这些问题。

## 主要特点 {#main-features}

### 声明式入口 {#declarative-entrypoints}

WebExtend 使用基于文件系统的方法来管理扩展入口点。只需在约定目录中创建文件，WebExtend 就会自动配置你的 `manifest.json`。这减少了配置开销，使项目结构更直观。

```
src/
  ├── popup/
  │   └── index.tsx      # 自动注册为 popup
  ├── options/
  │   └── index.tsx      # 自动注册为选项页面
  └── contents/
      └── github.tsx     # 自动注入到 github.com
```

查阅[入口点](../essentials/entrypoints.md)了解更多详情。

### 无缝的开发体验 {#seamless-development-experience}

体验一个开箱即用的开发环境：

- 🔥 为所有组件（包括 content scripts）提供真正的 HMR
- 🚀 自动打开浏览器和运行扩展
- ⚡️ 即时反馈循环，实现快速开发
- 🛠️ 提供项目模板和组件生成器的脚手架支持

### 多浏览器支持 {#multi-browser-support}

一次编写，到处运行。WebExtend 自动处理浏览器特定的 manifest 配置和 polyfills：

- ✅ Chrome/基于 Chromium 的浏览器
- ✅ Firefox
- ✅ Safari
- ✅ Edge

查阅[浏览器支持](../essentials/browsers.md)了解更多详情。

### ESM & TypeScript 支持 {#esm-typescript-support}

现代 JavaScript 特性开箱即用：

- 📦 原生 ESM 支持
- 🔷 一流的 TypeScript 支持
- 🎯 路径别名

### 框架无关 {#framework-agnostic}

选择最适合你项目的工具：

- 🔧 使用任何现代框架（React、Vue、Svelte 等）
- 🎨 使用任何样式解决方案（CSS Modules、Tailwind 等）
- 🔌 轻松集成现有工具

查阅[使用库](../essentials/using-libraries.md)获取集成指南。

### 极速性能 {#lightning-fast-performance}

基于 [Rsbuild](https://rsbuild.rs/) 构建，WebExtend 提供卓越的性能：

- ⚡️ 极快的开发服务器启动
- 📦 高效的打包，自动代码分割
- 🔄 智能缓存的快速重建
- 📊 包大小优化

## 比较 {#comparisons}

以下是 WebExtend 与其他流行的 Web 扩展开发工具的对比：

| 功能                             | WebExtend | Plasmo  | WXT     | CRXJS   |
| -------------------------------- | --------- | ------- | ------- | ------- |
| 打包器                           | Rsbuild   | Parcel  | Vite    | Vite    |
| 一流的 TypeScript 支持           | ✅        | ✅      | ✅      | ✅      |
| 基于文件的入口点                 | ✅        | ✅      | ✅      | ❌      |
| 扩展页面的实时重载 + HMR         | ✅        | 🟡 [^1] | ✅      | ✅      |
| content_scripts 的实时重载 + HMR | ✅        | 🟡 [^2] | 🟡 [^2] | ✅      |
| MV3 和 MV2 支持                  | ✅        | ✅      | ✅      | 🟡 [^3] |
| 多浏览器支持                     | ✅        | ✅      | ✅      | 🟡 [^4] |
| 自动运行扩展                     | ✅        | ❌      | ✅      | ❌      |
| 构建性能                         | ⚡️ 快速  | 中等    | 快速    | 快速    |
| 配置复杂度                       | 低        | 中等    | 高      | 低      |
| 学习曲线                         | 平缓      | 中等    | 陡峭    | 中等    |
| 社区和生态系统                   | 成长中    | 大      | 中等    | 中等    |

[^1]: 仅支持 React HMR。
[^2]: 仅支持基本实时重载，不保持状态。
[^3]: 仅支持 Manifest V3。
[^4]: 主要专注于 Chrome/Chromium 浏览器。

## 获取帮助 {#getting-help}

我们随时准备帮助你使用 WebExtend 取得成功：

- 📖 [文档](https://web-extend.github.io/web-extend/)：全面的指南和 API 参考
- 🐛 [GitHub Issues](https://github.com/web-extend/web-extend/issues)：报告错误或请求功能
- 🌟 [示例](https://github.com/web-extend/examples)：真实世界的示例和模板
- 💻 [GitHub Discussions](https://github.com/web-extend/web-extend/discussions)：社区问答和讨论

## 预备知识 {#pre-requisite-knowledge}

为了充分利用 WebExtend，请熟悉基本的 Web 扩展概念和架构。

有用的资源：

- [Chrome 扩展文档](https://developer.chrome.com/docs/extensions/get-started)
- [MDN Web 扩展](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## 准备开始？ {#ready-to-start}

现在你已经了解了 WebExtend 提供的功能，准备开始构建你的第一个扩展吧！

开始使用 WebExtend 非常简单：

```bash
npx web-extend@latest init
```

前往我们的[快速开始](./quick-start.md)指南开始你的旅程。

<br />
