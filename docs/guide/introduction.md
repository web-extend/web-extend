---
outline: deep
---

# Introduction

## What is WebExtend {#what}

WebExtend is a build tool that helps you make web extensions using modern web technology.

## Why WebExtend {#why}

Since there have been some similar tools for web extension development today, such as Plasmo, WXT, CRXJS etc, why should you select WebExtend?

These tools might have some of these problems as follows.

- No support for content_scripts HMR. Each code change requires page refresh, causing states missing.
- Complex APIs.

## Main Features {#main-features}

- **Declarative Development.** Automatically parse entries based on the file system, reducing manifest.json configuration burden.
- **Seamless Development Experience.** Supports instant HMR for popup/options/**content_scripts**..., automatic browser opening and extension running
- **Browser Compatibility.** Automatically handles manifest.json configuration differences for easy multi-browser support.
- **ESM & TypeScript Support.** ESM and TypeScript work out of the box, no extra configuration needed.
- **Framework Agnostic.** Freedom to use any frontend framework or library, such as React、Vue、Svelte etc.
- **Lightning Fast Performance.** Powered by Rsbuild for extremely fast development and building.
- **Scaffold Support**. Helps you create a project and generate entry files automatically.

## Pre-Requisite Knowledge {#pre-requisite-knowledge}

Before getting start, you should know basic knowledge about web extension development, please refers to:

- [Chrome Docs](https://developer.chrome.com/docs/extensions/get-started)
- [MDN Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
