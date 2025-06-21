---
outline: deep
---

# web-extend

[`web-extend`](https://www.npmjs.com/package/web-extend) 是一个趁手的工具集，用于创建项目、生成入口、运行和构建扩展等。

## 命令行接口

使用：

```shell
npx web-extend [options] [command]

# or
npm add -D web-extend
npx we [options] [command]
```

`we` 命令是 `web-extend` 命令的简写形式，二者是等价的。唯一的区别是：`we` 命令需要在安装 `web-extend` 工具后才可以使用。

### web-extend init

`init` 命令用于初始化一个项目，内置了 Vanilla、[React](https://react.dev/)、[Vue](https://vuejs.org/)、[Svelte](https://svelte.dev/) 的项目模板。

使用：

```shell
npx web-extend@latest init [options] [dir]
```

选项：

```
Options:
  -t, --template <name>  specify the template name
  -e, --entry <name...>  specify entrypoints
  -h, --help             display help for command
```

### web-extend generate

`generate` 命令用于生成入口文件。

使用：

```shell
npx web-extend generate|g [options] [entry...]
```

选项：

```
Options:
  -r, --root <dir>       specify the project root directory
  -t, --template <name>  specify the template name or path
  --size <size>          specify sizes of output icons (defaults to 16,32,48,128)
  -h, --help             display help for command
```

### web-extend dev

`dev` 命令使用 Rsbuild 作为构建工具，在开发环境中构建、运行扩展。

使用：

```shell
npx web-extend dev [options]
```

选项：

```
Options:
  -r, --root <root>      specify the project root directory
  -m, --mode <mode>      specify the build mode, can be `development`, `production` or `none`
  --env-mode <mode>      specify the env mode to load the `.env.[mode]` file
  --env-dir <dir>        specify the directory to load `.env` files
  -t, --target <target>  specify the extension target
  --open [url]           open the extension in browser on startup
  --port <port>          specify a port number for server to listen
  -h, --help             display help for command
```

### web-extend build

`build` 命令使用 Rsbuild 作为构建工具，构建生产版本的扩展。

使用：

```shell
npx web-extend build [options]
```

选项：

```
Options:
  -r, --root <root>      specify the project root directory
  -m, --mode <mode>      specify the build mode, can be `development`, `production` or `none`
  --env-mode <mode>      specify the env mode to load the `.env.[mode]` file
  --env-dir <dir>        specify the directory to load `.env` files
  -t, --target <target>  specify the extension target
  -w, --watch            watch for changes and rebuild
  -z, --zip              package the built extension
  -h, --help             display help for command
```

### web-extend preview

`preview` 命令用于预览生产版本的扩展。运行之前需要先使用 `build` 命令构建扩展。

使用：

```shell
npx web-extend preview [options] [dir]
```

选项：

```
Options:
  -r, --root <root>      specify the project root directory
  -t, --target <target>  specify the extension target
  -h, --help             display help for command
```

### web-extend zip

`zip` 命令用于将生产版本的扩展压缩为一个 `.zip` 格式的文件。运行之前需要先使用 `build` 命令构建扩展。

使用：

```shell
npx web-extend zip [options] [dir]
```

选项：

```
Options:
  -r, --root <root>          specify the project root directory
  -n, --filename <filename>  specify the output filename
  -t, --target <target>      specify the extension target
  -h, --help                 display help for command
```

## 函数

### defineConfig

`defineConfig` 函数用于帮助定义 WebExtend 配置项。

选项：

- **manifest**：`manifest` 配置，默认为 `{}`。WebExtend 会合并 `manifest` 选项和入口文件信息（前者有更高的优先级），在构建时自动生成 `manifest.json`。
- **target**：目标浏览器，支持以下选项：
  - `chrome-mv3` (默认)
  - `firefox-mv2` (对于 Firefox，推荐使用 MV2 版本)
  - `firefox-mv3` (实验性支持，不能用于 dev 环境中)
  - `safari-mv3`
  - `edge-mv3`
  - `opera-mv3`
- **srcDir**：源码目录，默认为项目跟路径下的 `./src` 目录，如果 `./src` 目录不存在，则默认为项目根目录。
- **outDir**：设置构建产物目录，默认为 `dist`。
- **publicDir**: 设置公共目录，默认为 `dist`。
- **webExt**: web-ext 配置。
- **rsbuild**: Rsbuild 配置。

使用：

```ts [web-extend.config.js]
import { defineConfig } from 'web-extend';

export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  manifest: {...},
  target: "firefox-mv2",
});
```

### defineWebExtConfig

`defineWebExtConfig` 函数用于帮助定义 web-ext 的配置信息。

使用：

::: code-group

```js [web-ext.config.js]
import { defineWebExtConfig } from "web-extend";

export default defineWebExtConfig({
  run: {
    // ...
  },
});
```

:::

源码： [runner.ts](https://github.com/web-extend/web-extend/blob/main/packages/core/src/runner.ts#L130).

## 类型

### ContentScriptConfig

`ContentScriptConfig` 是一个 TypeScript 类型，用于定义 content script 的配置信息。

类型：

```ts
export interface ContentScriptConfig {
  matches: string[];
  exclude_matches?: string[];
  css?: string[];
  run_at?: "document_start" | "document_end" | "document_idle";
  all_frames?: boolean;
  match_about_blank?: boolean;
  include_globs?: string[];
  exclude_globs?: string[];
  world?: "ISOLATED" | "MAIN";
}
```

使用：

```ts [src/content/index.ts]
import type { ContentScriptConfig } from "web-extend";

export const config: ContentScriptConfig = {
  matches: ["https://www.google.com/*"],
};
```
