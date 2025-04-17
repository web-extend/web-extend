---
outline: deep
---

# Quick Start

## Environment Preparation

[Node.js >= 16](https://nodejs.org/en/download), and the Node.js LTS version is recommended.

## Automatic Installation

It is recommended to use [`web-extend`](../../api/web-extend.md) for creating a project automatically. Just run the following command on the CLI:

```shell
npx web-extend@latest init
```

The `web-extend` tool provides the following templates, which all use TypeScript. If you want to use JavaScript, please modify the file extension names.

- Vanilla
- [React](https://react.dev/)
- [Vue](https://vuejs.org/)
- [Svelte](https://svelte.dev/)
- [Solid](https://www.solidjs.com/)

WebExtend is compatible with any frontend framework. For other frameworks, you might need manual installation.

## Manual Installtion

### Install dependencies

Create a project and install dependencies. WebExtend uses [Rsbuild](https://rsbuild.dev/) as the bundler. And the feature of running the extension automatically is based on [web-ext](https://github.com/mozilla/web-ext).

::: code-group

```shell [npm]
mkdir my-extension-app
cd my-extension-app

npm init -y
npm add -D web-extend @rsbuild/core @web-extend/rsbuild-plugin web-ext
```

```shell [pnpm]
mkdir my-extension-app
cd my-extension-app

npm init -y
pnpm add -D web-extend @rsbuild/core @web-extend/rsbuild-plugin web-ext
```

```shell [yarn]
mkdir my-extension-app
cd my-extension-app

npm init -y
yarn add -D web-extend @rsbuild/core @web-extend/rsbuild-plugin web-ext
```

:::

It is also recommended to install TypeScript、React/Vue、ESLint/Prettier/Biome etc, for enhancing the development experience (Optional).

### Add npm scripts

Add the `"type": "module"` field and the following scripts into `package.json`.

::: code-group

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "web-extend rsbuild:dev --open",
    "build": "web-extend rsbuild:build",
    "preview": "web-extend preview",
    "zip": "web-extend zip"
  }
}
```

:::

The meanings of the commands above are as follows:

- `dev`: use Rsbuild for developing the extension. `--open` is used to open a browser automatically for running it.
- `build`: use Rsbuild for building the extension for production.
- `preview`: preview the extension for production.
- `zip`: package the extension for production into a `.zip` file.

### Add Rsbuild config

Create the `rsbuild.config.ts` file and add the following content.

::: code-group

```js [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default defineConfig({
  plugins: [pluginWebExtend()],
});
```

:::

### Add entry points

Create the `src/popup.ts` file with the following content. WebExtend will parse [entrypoints](../essentials/entrypoints.md) automatically based on the file system. In this way, you no longer need to define entries in `manifest.json`.

::: code-group

```js [src/popup.ts]
const root = document.querySelector("#root");
if (root) {
  root.innerHTML = `
  <div class="content">
    <h1>Vanilla WebExtend</h1>
    <p>This is a popup page.</p>
  </div>
  `;
}
```

:::

Alternatively, you can use the `web-extend` tool to generate entry files. Run the following command.

```shell
npx web-extend generate popup
```

If you prefer to explicitly define entries, or want to add extra `manifest.json` fields, please pass the `manifest` option, which has higher priority.

::: code-group

```js [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default defineConfig({
  plugins: [pluginWebExtend({
    manifest: {...} // [!code ++]
  })],
});
```

:::

## Run & Build

Execute `npm run dev` for development, or `npm run build` for production.

If you prefer to run the extension manually, please remove the `--open` option in the `dev` command, enable the deveoplment mode in the browser, and then load the `dist/chrome-mv3-dev` or `dist/chrome-mv3-prod` artifact directory.

## Publishing

Execute `npm run zip` for packaging the extension, and then publish it on browser stores. More information about publish refers to:

- [Chrome Docs](https://developer.chrome.com/docs/webstore/publish/)
- [Firefox Docs](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [Safari Docs](https://developer.apple.com/documentation/safariservices/converting-a-web-extension-for-safari)
- [Microsoft Docs](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)
