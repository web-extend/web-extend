---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "WebExtend"
  text: "The build tool for web extensions"
  tagline: "Making web extension development modern, simple and efficient."
  actions:
    - theme: brand
      text: Introduction
      link: /guide/start/introduction
    - theme: alt
      text: Quick Start
      link: /guide/start/quick-start
  image:
    src: /logo.svg
    alt: WebExtend

features:
  - icon: 📝
    title: Declarative Entry Points
    details: Automatically parses entry files based on the file system, reducing manifest.json configuration burden
    link: /guide/essentials/entrypoints
  - icon: ⚡️
    title: Seamless Development Experience
    details: Supports instant HMR, automatic browser opening and extension running
  - icon: 🧭
    title: Multi-Browser Support
    details: Automatically handles manifest.json configuration differences for easy multi-browser support
    link: /guide/essentials/browsers
  - icon: 🛠️
    title: ESM & TypeScript Support
    details: ESM and TypeScript work out of the box, no extra configuration needed
  - icon: ✈️
    title: Frontend Framework Agnostic
    details: Freedom to use any frontend framework or library
    link: /guide/essentials/using-libraries
  - icon: 🚀
    title: Lightning Fast Performance
    details: Powered by Rsbuild for extremely fast development and building
    link: https://rsbuild.dev/index
---
