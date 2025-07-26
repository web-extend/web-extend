---
outline: deep
---

# Introduction

## What is WebExtend? {#what}

WebExtend is a modern build tool designed to streamline web extension development. It provides a powerful yet simple development environment that lets you create cross-browser extensions using the latest web technologies. Whether you're building a simple utility or a complex browser extension, WebExtend offers the tools and workflows to make your development process efficient and enjoyable.

## Why WebExtend? {#why}

While there are several tools available for web extension development like Plasmo, WXT, and CRXJS, WebExtend stands out by addressing common pain points and offering unique advantages:

### Key Differentiators

- **Superior Hot Module Replacement (HMR)**: Full HMR support for all extension components including content_scripts, maintaining state during development
- **Developer-Friendly APIs**: Clean, intuitive APIs that reduce boilerplate and complexity
- **Optimized Performance**: Built on Rsbuild for exceptional build speeds and development experience
- **Zero Configuration**: Sensible defaults that work out of the box while maintaining flexibility for customization

### Pain Points Solved

Many existing tools suffer from limitations that WebExtend specifically addresses:

- ❌ No content_scripts HMR support, requiring page refreshes
- ❌ Complex or confusing APIs that increase learning curve
- ❌ Limited browser compatibility
- ❌ Slow build times and development experience

WebExtend solves these issues with a thoughtful, developer-first approach.

## Main Features {#main-features}

### 📝 File-based Entry Points {#file-based-entrypoints}

WebExtend uses a file-system based approach for managing extension entrypoints. Simply create files in the conventional directories, and WebExtend automatically configures your `manifest.json`. This reduces configuration overhead and makes your project structure more intuitive.

```
src/
  ├── popup/
  │   └── index.tsx      # Automatically registered as popup
  ├── options/
  │   └── index.tsx      # Automatically registered as options page
  └── contents/
      └── github.tsx     # Automatically injected into github.com
```

See [entry points](../essentials/entrypoints.md) for more details.

### ⚡️ Seamless Development Experience {#seamless-development-experience}

Experience a development environment that just works:

- True HMR for all components including content scripts
- Automatic browser opening and extension running
- Scaffold support with project templates and component generators

### 🧭 Multi-Browser Support {#multi-browser-support}

Write once, run everywhere. WebExtend handles browser-specific manifest configurations and polyfills automatically:

- Chrome/Chromium-based browsers
- Firefox
- Safari
- Edge

See [browser support](../essentials/browsers.md) for more details.

### 🛠️ ESM & TypeScript Support {#esm-typescript-support}

Modern JavaScript features work out of the box:

- Native ESM support
- First-class TypeScript support
- Path aliases

### ✈️ Framework Agnostic {#framework-agnostic}

Choose the tools that work best for your project:

- Use any modern framework (React, Vue, Svelte, etc.)
- Use any styling solution (CSS Modules, Tailwind, etc.)
- Easy integration with existing tools

See [using libraries](../essentials/using-libraries.md) for integration guides.

### 🚀 Lightning Fast Performance {#lightning-fast-performance}

Built on [Rsbuild](https://rsbuild.rs/), WebExtend delivers exceptional performance:

- Blazing fast dev server startup
- Quick rebuild times with intelligent caching
- Bundle size optimization

## Comparisons {#comparisons}

Here's how WebExtend stacks up against other popular web extension development tools:

| Feature                                  | WebExtend | Plasmo   | WXT     | CRXJS    |
| ---------------------------------------- | --------- | -------- | ------- | -------- |
| Bundler                                  | Rsbuild   | Parcel   | Vite    | Vite     |
| First-class TypeScript support           | ✅        | ✅       | ✅      | ✅       |
| File-based entry points                  | ✅        | ✅       | ✅      | ❌       |
| Live-reloading + HMR for extension pages | ✅        | 🟡 [^1]  | ✅      | ✅       |
| Live-reloading + HMR for content_scripts | ✅        | 🟡 [^2]  | 🟡 [^2] | ✅       |
| MV3 and MV2 support                      | ✅        | ✅       | ✅      | 🟡 [^3]  |
| Multi-browser support                    | ✅        | ✅       | ✅      | 🟡 [^4]  |
| Automatic extension running              | ✅        | ❌       | ✅      | ❌       |
| Build performance                        | Fast      | Moderate | Fast    | Fast     |
| Configuration complexity                 | Low       | Moderate | High    | Low      |
| Learning curve                           | Gentle    | Moderate | Steep   | Moderate |
| Community and ecosystem                  | Growing   | Large    | Medium  | Medium   |

[^1]: Only React HMR support available.

[^2]: Only basic live-reloading without state preservation.

[^3]: Limited to Manifest V3 only.

[^4]: Primarily focused on Chrome/Chromium browsers.

## Getting Help {#getting-help}

We're here to help you succeed with WebExtend:

- 📖 [Documentation](https://web-extend.github.io/web-extend/): Comprehensive guides and API references
- 🐛 [GitHub Issues](https://github.com/web-extend/web-extend/issues): Report bugs or request features
- 🌟 [Examples](https://github.com/web-extend/examples): Real-world examples and templates
- 💻 [GitHub Discussions](https://github.com/web-extend/web-extend/discussions): Community Q&A and discussions

## Pre-Requisite Knowledge {#pre-requisite-knowledge}

To make the most of WebExtend, familiarize yourself with basic web extension concepts and architecture.

Helpful resources:

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/get-started)
- [MDN Web Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## Ready to Start? {#ready-to-start}

Now that you understand what WebExtend offers, you're ready to build your first extension!

Getting started with WebExtend is straightforward:

```bash
npx web-extend@latest init
```

Head over to our [Quick Start](./quick-start.md) guide to begin your journey.

<br />
