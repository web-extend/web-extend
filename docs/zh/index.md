---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "WebExtend"
  text: "浏览器扩展构建工具"
  tagline: "让浏览器扩展开发变得简单、现代和高效"
  actions:
    - theme: brand
      text: 介绍
      link: /zh/guide/introduction
    - theme: alt
      text: 快速上手
      link: /zh/guide/quick-start
  image:
    src: /logo.svg
    alt: WebExtend

features:
  - icon: 📝
    title: 声明式开发
    details: 基于文件系统自动解析入口，减少 manifest.json 的配置负担
    link: /zh/guide/extension-entrypoints
  - icon: ⚡️
    title: 无缝的开发体验
    details: 支持即时 HMR、自动打开浏览器和运行扩展
  - icon: 🧭
    title: 浏览器兼容性
    details: 自动处理 manifest.json 配置差异，轻松实现多浏览器支持
    link: /zh/guide/browser
  - icon: 🛠️
    title: ESM、TypeScript 支持
    details: ESM、TypeScript 开箱即用，无需额外配置
  - icon: ✈️
    title: 前端框架无关
    details: 可以自由使用任何前端框架和库
  - icon: 🚀
    title: 极速性能
    details: 基于 Rsbuild 实现极速开发和构建
    link: https://rsbuild.dev/index
---
