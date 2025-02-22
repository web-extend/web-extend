---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "WebExtend"
  text: "The build tool for web extensions"
  tagline: "Making web extension development simple, modern and efficient."
  actions:
    - theme: brand
      text: Introduction
      link: /guide/introduction
    - theme: alt
      text: Quick Start
      link: /guide/quick-start
  image:
    src: /logo.svg
    alt: WebExtend

features:
  - icon: 📝
    title: Declarative Entrypoints
    details: Automatically parses entry files based on the file system, reducing manifest.json configuration burden
    link: /guide/entrypoints
  - icon: ⚡️
    title: Seamless Development Experience
    details: Supports instant HMR, automatic browser opening and extension running
  - icon: 🧭
    title: Multi-browser Support
    details: Automatically handles manifest.json configuration differences for easy multi-browser support
    link: /guide/browser
  - icon: 🛠️
    title: ESM & TypeScript Support
    details: ESM and TypeScript work out of the box, no extra configuration needed
  - icon: ✈️
    title: Framework Agnostic
    details: Freedom to use any frontend framework or library
  - icon: 🚀
    title: Lightning Fast Performance
    details: Powered by Rsbuild for extremely fast development and building
    link: https://rsbuild.dev/index
---
