---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "WebExtend"
  text: "浏览器扩展构建工具"
  tagline: "帮助您使用现代 Web 技术轻松构建浏览器扩展"
  actions:
    - theme: brand
      text: 介绍
      link: /zh/guide/introduction
    - theme: alt
      text: 快速上手
      link: /zh/guide/quick-start

features:
  - title: 声明式开发
    details: 基于文件系统自动解析扩展入口，减少 manifest.json 的配置负担
  - title: 无缝的开发体验
    details: 支持即时 HMR、自动打开浏览器和运行扩展
  - title: 浏览器兼容性
    details: 自动处理 manifest.json 配置差异，轻松实现多浏览器支持
  - title: TypeScript 支持
    details: TypeScript 开箱即用，无需额外配置
  - title: 前端框架无关
    details: 可以自由使用任何前端框架和库
  - title: 极速性能
    details: 基于 Rsbuild 实现极速开发和构建
---
