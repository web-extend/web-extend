---
outline: deep
---

# 快速开始 {#quick-start}

## 环境准备 {#environment-preparation}

在开始之前，请确保你已安装以下必备条件：

- [Node.js >= 16](https://nodejs.org/en/download)（推荐使用 LTS 版本）

## 自动安装 {#automatic-installation}

最简单的方式是使用 `web-extend` CLI 工具。这将为你设置一个包含所有必要配置的完整项目结构。

```shell
npx web-extend@latest init
```

在初始化过程中，你需要：

1. 选择项目名称
2. 选择模板
3. 配置其他功能

### 可用模板 {#available-templates}

`web-extend` 工具提供以下模板，默认都使用 TypeScript：

- Vanilla
- [React](https://react.dev/)
- [Vue](https://vuejs.org/)
- [Preact](https://preactjs.com/)
- [Svelte](https://svelte.dev/)
- [Solid](https://www.solidjs.com/)

> 注意：虽然这些模板是开箱即用的，但 WebExtend 是框架无关的，可以与任何前端框架一起使用。对于其他框架，你可能需要遵循手动安装流程。

## 手动安装 {#manual-installation}

如果你更喜欢手动设置项目或使用其他框架，请按照以下步骤操作：

### 1. 安装依赖 {#install-dependencies}

创建新项目目录并初始化：

::: code-group

```shell [npm]
mkdir my-extension-app
cd my-extension-app

npm init -y
npm add -D web-extend @rsbuild/core web-ext
```

```shell [pnpm]
mkdir my-extension-app
cd my-extension-app

npm init -y
pnpm add -D web-extend @rsbuild/core web-ext
```

```shell [yarn]
mkdir my-extension-app
cd my-extension-app

npm init -y
yarn add -D web-extend @rsbuild/core web-ext
```

:::

为了获得更好的开发体验，建议安装以下可选依赖：

::: code-group

```shell [npm]
# TypeScript support
npm add -D typescript

# Code quality tools
npm add -D eslint prettier
```

```shell [pnpm]
# TypeScript support
pnpm add -D typescript

# Code quality tools
pnpm add -D eslint prettier
```

```shell [yarn]
# TypeScript support
yarn add -D typescript

# Code quality tools
yarn add -D eslint prettier
```

:::

### 2. 配置 Package.json {#configure-package-json}

在 `package.json` 中添加以下配置：

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

### 3. 创建入口点 {#create-entry-points}

在 `src` 目录中创建扩展的入口点。WebExtend 会根据文件系统结构自动检测入口点。

弹出窗口入口点示例：

```ts [src/popup.ts]
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

或者，使用 CLI 生成入口点：

```shell
npx web-extend g popup
```

## 开发工作流 {#development-workflow}

- 启动开发服务器：`npm run dev`
- 创建生产构建：`npm run build`
- 预览生产构建：`npm run preview`

如果你更喜欢手动运行扩展，请移除 `dev` 命令中的 `--open` 选项，在浏览器中启用开发者模式，然后加载 `dist/chrome-mv3-dev` 或 `dist/chrome-mv3-prod` 构建目录。

## 发布 {#publishing}

构建扩展后，你可以将其发布到浏览器商店：

1. 创建生产构建：`npm run build`
2. 打包扩展：`npm run zip`
3. 提交到浏览器商店：
   - [Chrome Web Store](https://developer.chrome.com/docs/webstore/publish/)
   - [Firefox Add-ons](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
   - [Safari Extensions](https://developer.apple.com/documentation/safariservices/converting-a-web-extension-for-safari)
   - [Microsoft Edge Add-ons](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)

<br />
