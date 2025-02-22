---
outline: deep
---

# Introduction

## What is WebExtend? {#what}

WebExtend is a build tool that helps you make web extensions using modern web technology.

## Why WebExtend? {#why}

Since there have been some similar tools for web extension development today, such as Plasmo, WXT, CRXJS etc, why should you select WebExtend?

These tools might have some of these problems as follows.

- No support for content_scripts HMR. Each code change requires page refresh, causing states missing.
- Complex APIs.

## Main Features {#main-features}

### 📝 Declarative Entrypoints {#declarative-entrypoints}

WebExtend automatically parses entries based on the file system, reducing `manifest.json` configuration burden.

See [entrypoints](./entrypoints.md).

### ⚡️ Seamless Development Experience {#seamless-development-experience}

WebExtend supports instant HMR for popup/options/**content_scripts**..., automatic browser opening and extension running.

### 🧭 Multi-browser Support {#multi-browser-support}

WebExtend automatically handles `manifest.json` configuration differences for easy multi-browser support.

See [browser support](./browser.md).

### 🛠️ ESM & TypeScript Support {#esm-typescript-support}

ESM and TypeScript work out of the box, no extra configuration needed.

### ✈️ Framework Agnostic {#framework-agnostic}

Freedom to use any frontend framework or library, for example:

- React
- Vue
- Svelte
- CSS Modules
- Tailwind CSS
- UnoCSS
- Auto Import
- ...

### 🚀 Lightning Fast Performance {#lightning-fast-performance}

Powered by Rsbuild for extremely fast development and building.

See [Rsbuild](https://rsbuild.dev/).

### 💪 Scaffold Support {#scaffold-support}

WebExtend provides a CLI tool that helps you create a project quickly and generate entry files automatically.

See [web-extend](../../api/web-extend.md).

## Pre-Requisite Knowledge {#pre-requisite-knowledge}

Before getting start, you should know basic knowledge about web extension development.

- [Chrome Docs](https://developer.chrome.com/docs/extensions/get-started)
- [MDN Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
