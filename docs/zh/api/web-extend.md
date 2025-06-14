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
  -o, --out-dir <dir>    specify the output directory
  --size <size>          specify sizes of output icons (defaults to 16,32,48,128)
  -h, --help             display help for command
```

### web-extend rsbuild:dev

`rsbuild:dev` 命令使用 Rsbuild 作为构建工具，在开发环境中构建、运行扩展。

使用：

```shell
npx web-extend rsbuild:dev [options]
```

选项：

```
Options:
  -r, --root <root>      specify the project root directory
  -o, --out-dir <dir>    specify the output directory
  -m, --mode <mode>      specify the build mode, can be `development`, `production` or `none`
  --env-mode <mode>      specify the env mode to load the `.env.[mode]` file
  --env-dir <dir>        specify the directory to load `.env` files
  -t, --target <target>  specify the extension target
  --open [url]           open the extension in browser on startup
  --port <port>          specify a port number for server to listen
  -h, --help             display help for command
```

### web-extend rsbuild:build

`rsbuild:build` 命令使用 Rsbuild 作为构建工具，构建生产版本的扩展。

使用：

```shell
npx web-extend rsbuild:build [options]
```

选项：

```
Options:
  -r, --root <root>      specify the project root directory
  -o, --out-dir <dir>    specify the output directory
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

### defineWebExtConfig

`defineWebExtConfig` 是一个工具函数，用于帮助定义 web-ext 的配置信息。

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
