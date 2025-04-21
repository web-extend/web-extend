---
outline: deep
---

# 快速上手 {#quick-start}

## 准备环境 {#preparation}

[Node.js >= 16](https://nodejs.org/en/download)，推荐使用 Node LTS 版本。

## 自动安装 {#automatic-installation}

推荐使用 [`web-extend`](../../api/web-extend.md) 工具自动创建项目。在命令行界面运行命令：

```shell
npx web-extend@latest init
```

`web-extend` 内置了以下模板。这些模板都使用 TypeScript，如果需要使用 JavaScript，可以在生成项目后手动将 `.ts` 文件后缀名改为 `.js`。

- Vanilla
- [React](https://react.dev/)
- [Vue](https://vuejs.org/)
- [Svelte](https://svelte.dev/)
- [Solid](https://www.solidjs.com/)

WebExtend 兼容任何前端框架，如需在其他框架中使用，请参考手动安装的部分。

## 手动安装 {#manual-installation}

### 安装依赖项 {#install-dependencies}

创建项目并安装依赖项。WebExtend 使用 [Rsbuild](https://rsbuild.dev/) 作为底层构建工具，并使用 [web-ext](https://github.com/mozilla/web-ext) 实现在浏览器中自动运行插件。

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

推荐安装 TypeScript、React/Vue、ESLint/Prettier/Biome 等前端工具，提升开发体验（可选）。

### 添加 npm 脚本命令 {#add-npm-scripts}

修改 `package.json`，添加 `"type": "module"` 字段及如下命令：

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

上述命令的含义如下：

- `dev`: 使用 Rsbuild 在开发环境构建扩展，同时打开浏览器运行扩展。
- `build`: 使用 Rsbuild 构建生产版本的扩展。
- `preview`: 预览生产版本的扩展。需要先执行 `build` 命令。
- `zip`: 将生产版本的扩展压缩为一个 `.zip` 文件，以备发布。需要先执行 `build` 命令。

### 添加 Rsbuild 配置 {#add-rsbuild-configuration}

创建 `rsbuild.config.ts`，添加如下内容。

::: code-group

```js [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginWebExtend } from "@web-extend/rsbuild-plugin";

export default defineConfig({
  plugins: [pluginWebExtend()],
});
```

:::

### 添加入口 {#add-entry-files}

创建 src 源码目录，并创建 `popup.js` 文件，文件内容如下。WebExtend 将基于文件系统[自动解析入口](../essentials/entrypoints.md)。

::: code-group

```js [src/popup.js]
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

`web-extend` 工具提供了自动生成入口文件的功能，也可以使用它来添加入口文件，运行命令。

```shell
npx web-extend generate popup
```

如果您更偏向显式定义入口，或者想要添加额外的 manifest 字段，请传递 `manifest` 选项，它拥有更高的优先级。

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

## 运行和构建 {#run-and-build}

- 执行 `npm run dev` 命令，启动服务器，自动打开浏览器并运行扩展。
- 执行 `npm run build` 命令，构建生产版本的扩展。

如果需要手动加载扩展，请移除 `dev` 命令中的 `--open` 选项，在浏览器扩展页面开启开发者模式，加载 `dist/chrome-mv3-dev` 或 `dist/chrome-mv3-prod` 目录。

## 发布 {#publish}

执行 `npm run zip` 命令压缩生产版本的扩展，在浏览器的应用商店进行发布。

- [Chrome Docs](https://developer.chrome.com/docs/webstore/publish/)
- [Firefox Docs](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [Safari Docs](https://developer.apple.com/documentation/safariservices/converting-a-web-extension-for-safari)
- [Microsoft Docs](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)
