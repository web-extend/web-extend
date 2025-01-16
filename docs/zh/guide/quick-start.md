# 快速上手

## 准备环境

Node.js >= 16，推荐使用 Node LTS 版本。

## 自动安装

推荐使用 `web-extend` 工具创建项目。在命令行界面运行命令：

```shell
npx web-extend@latest init
```

## 手动安装

### 安装依赖项

首先，创建项目、安装依赖项。WebExtend 使用 [Rsbuild](https://rsbuild.dev/) 作为底层构建工具，因此还需要安装它。

```shell
# create an empty project
mkdir my-extension-app
cd my-extension-app
npm init -y

# install dev dependencies
npm i -D web-extend @rsbuild/core rsbuild-plugin-web-ext

```

推荐安装 TypeScript、React/Vue、Eslint/Prettier/Biome 等前端工具，提升开发体验（可选）。 

###  添加脚本命令

修改 `package.json`，添加 `"type": "module"` 字段和如下命令：

```json
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

上述命令的含义如下：

- `dev`: 使用 Rsbuild 构建开发环境的扩展，同时打开浏览器运行扩展。其中，在浏览器中运行扩展的功能基于 [web-ext](https://github.com/mozilla/web-ext) 工具实现。
- `build`: 使用 Rsbuild 构建生产环境的扩展。
- `preview`: 在浏览器运行生产环境的扩展。需要先执行 `build` 命令。
- `zip`: 将生产环境的扩展压缩为 zip 文件，以备发布。需要先执行 `build` 命令。

### 添加 Rsbuild 配置

创建 `rsbuild.config.js`，添加如下内容。

```js
import { pluginWebExt } from "rsbuild-plugin-web-ext";

export default {
  plugins: [pluginWebExt()],
};

```

### 添加入口文件


推荐使用声明式开发，WebExtend 会基于文件系统自动解析扩展入口，并生成 `manifest.json` 文件。创建 src 目录，按照约定格式添加入口文件。

```
src/
└── popup.js
```

`popup.js` 文件内容如下：

```js
const rootEl = document.querySelector('#root');
if (rootEl) {
  rootEl.innerHTML = `
  <div class="content">
    <h1>Vanilla WebExtend</h1>
    <p>This is a popup page.</p>
  </div>
  `;
}

```

为了方便开发，`web-extend` 工具提供了自动生成入口文件的功能，运行命令：

```shell
npx web-extend generate
```

此外，还可以显示传递 manifest 配置。在 `rsbuild.config.js` 引入的插件中添加 `manifest` 选项参数。

```js

import { pluginWebExt } from "rsbuild-plugin-web-ext";

export default {
  plugins: [pluginWebExt({
    manifest: {...} // [!code ++]
  })],
};
```

### 构建运行

- 运行 `npm run dev` 命令，启动服务器，自动打开浏览器并运行扩展。
- 运行 `npm run build` 命令，构建生产版本的扩展。

### 发布

TODO: 待补充
