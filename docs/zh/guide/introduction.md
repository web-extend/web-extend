---
outline: deep
---

# 介绍 {#introdcution}

## 什么是 WebExtend {#what}

WebExtend 是一个帮助您使用现代 Web 技术构建浏览器扩展的工具。

## 为什么选 WebExtend {#why}

目前社区中已经有一些类似的构建工具，如 Plasmo、WXT、CRXJS 等。这些珠玉在前，为什么还要推出 WebExtend 呢？它们存在如下几个问题：

- 不支持 content_scripts HMR。每次变化需要重刷页面，导致组件状态丢失。
- 较为复杂的 API。
- 中文不友好，没有官方的中文文档。

## 优势 {#main-features}

- **声明式入口。** 基于文件系统自动解析入口，减少 manifest.json 的配置负担。
- **无缝的开发体验。** 支持即时 HMR、自动打开浏览器和运行扩展。
- **跨浏览器兼容性。** 自动处理 manifest.json 配置差异，轻松实现多浏览器支持。
- **TypeScript 支持。** TypeScript 开箱即用，无需额外配置。
- **框架无关。** 可以自由使用任何前端框架和库，如 React、Vue、Svelte 等。
- **极速性能。** 基于 Rsbuild 实现极速开发和构建。
- **脚手架支持。** 提供模板支持，方便快速创建项目、生成入口文件。

## 预备知识 {#pre-requisite-knowledge}

了解浏览器扩展开发的基础知识，可以参考以下资源。

- [Chrome Docs](https://developer.chrome.com/docs/extensions/get-started)
- [MDN Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
