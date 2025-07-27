---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Bext
  text: A framework for browser extensions
  tagline: Build browser extensions the modern way
  actions:
    - theme: brand
      text: Introduction
      link: /guide/start/introduction
    - theme: alt
      text: Quick Start
      link: /guide/start/quick-start
  image:
    src: /logo.svg
    alt: Logo

features:
  - icon: 📝
    title: File-based Entry Points
    details: Automatically parses entry points based on the file system, reducing manifest.json configuration burden
    link: /guide/essentials/entrypoints
  - icon: ⚡️
    title: Seamless Development Experience
    details: Supports instant HMR, automatic browser opening and extension running
    link: /guide/start/introduction#seamless-development-experience
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
    link: /guide/start/introduction#lightning-fast-performance
---
