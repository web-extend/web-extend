# @web-extend/rsbuild-plugin

[`@web-extend/rsbuild-plugin`](https://www.npmjs.com/package/@web-extend/rsbuild-plugin) 是一个 Rsbuild 插件，用于开发和构建浏览器扩展。

我们推荐使用 [`web-extend`](./web-extend.md)。它内置了此插件，并提供了更好的用户体验。

如果你想要直接使用此插件，请按照以下步骤操作。

## 使用 {#usage}

安装插件。

```bash
npm add @web-extend/rsbuild-plugin -D
```

添加插件到 Rsbuild 配置。

```ts [rsbuild.config.ts]
import { pluginWebExtend } from '@web-extend/rsbuild-plugin';

export default {
  plugins: [
    pluginWebExtend({
      /* options */
    }),
  ],
};
```

开发工作流：

- 运行 `npm run dev` 启动开发服务器。
- 在浏览器扩展页面启用开发者模式并加载 `dist` 目录。
- 运行 `npm run build` 构建生产环境。

## 选项 {#options}

它支持以下选项，与 `web-extend` 包相同。

- [`entriesDir`](./web-extend.md#entriesdir)
- [`outDir`](./web-extend.md#outdir)
- [`publicDir`](./web-extend.md#publicdir)
- [`manifest`](./web-extend.md#manifest)
- [`target`](./web-extend.md#target)
