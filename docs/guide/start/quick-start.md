---
outline: deep
---

# Quick Start

## Environment Preparation

[Node.js >= 18](https://nodejs.org/en/download) (LTS version recommended) is required.

## Automatic Installation

The easiest way to get started is using the `web-extend` CLI tool. This will set up a complete project structure with all necessary configurations.

```shell
npx web-extend@latest init
```

During the initialization, you'll be prompted to:

1. Input a project name
2. Select a template
3. Select entrypoints
4. Select additional tools (optional)

The following is an example of the initialization process.

```shell
┌  🚀 Welcome to WebExtend!
│
◇  Project name
│  my-extension-app
│
◇  Select framework
│  Vanilla
│
◇  Select entrypoints
│  content, popup
│
◇  Select additional tools
│  ESLint for code linting, Prettier for code formatting
│
◇  Next steps ─────────────╮
│                          │
│  1. cd my-extension-app  │
│  2. git init (optional)  │
│  3. npm install          │
│  4. npm run dev          │
│                          │
├──────────────────────────╯
│
└  Done
```

### Templates

WebExtend provides the following templates, all using TypeScript by default.

- Vanilla
- [React](https://react.dev/)
- [Vue](https://vuejs.org/)
- [Preact](https://preactjs.com/)
- [Svelte](https://svelte.dev/)
- [Solid](https://www.solidjs.com/)

> Note: While these templates are provided out of the box, WebExtend is framework-agnostic and can work with any frontend framework. For other frameworks, you may need to follow the manual installation process.

You can also directly specify the project name and the template via additional arguments. For example, to create a React project:

```shell
npx web-extend@latest init my-extension-app --template react
```

### Examples

We also provide lots of examples to help you get started. You can find them in the [examples](https://github.com/web-extend/examples) repository and select a example as the template to start. For example, a React project with Tailwind CSS:

```shell
npx web-extend@latest init my-extension-app --template with-react-tailwindcss
```

## Manual Installation

If you prefer to set up your project manually or use a different framework, follow these steps.

### 1. Install Dependencies

Create a new project directory and initialize it:

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

For a better development experience, consider installing these optional dependencies:

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

### 2. Configure Package.json

Add the following configuration to your `package.json`:

```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "web-extend dev --open",
    "build": "web-extend build",
    "preview": "web-extend preview",
    "zip": "web-extend zip"
  }
}
```

### 3. Create Entry Points

Create your extension's entry points in the `src` directory. WebExtend automatically detects entry points based on the file system structure.

Example popup entry point:

```ts [src/popup.ts]
const root = document.querySelector('#root');
if (root) {
  root.innerHTML = `
  <div class="content">
    <h1>Vanilla WebExtend</h1>
    <p>This is a popup page.</p>
  </div>
  `;
}
```

Alternatively, generate entry points using the CLI:

```shell
npx web-extend g popup
```

## Development Workflow

- Start the development serve: `npm run dev`.
- Create a production build: `npm run build`.
- Preview the production build: `npm run preview`.

If you prefer to run the extension manually, please remove the `--open` option in the `dev` command, enable the deveoplment mode in the browser, and then load the `dist/chrome-mv3-dev` or `dist/chrome-mv3-prod` artifact directory.

## Publishing

After building your extension, you can publish it to browser stores:

1. Create a production build: `npm run build`
2. Package the extension: `npm run zip`
3. Submit to browser stores:
   - [Chrome Web Store](https://developer.chrome.com/docs/webstore/publish/)
   - [Firefox Add-ons](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
   - [Safari Extensions](https://developer.apple.com/documentation/safariservices/converting-a-web-extension-for-safari)
   - [Microsoft Edge Add-ons](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)
