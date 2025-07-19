---
outline: [2, 3]
---

# web-extend

[`web-extend`](https://www.npmjs.com/package/web-extend) 是一个功能强大的工具集，用于创建、开发和构建浏览器扩展。它提供了一个流线型的工作流程，强大的 CLI 命令和灵活的配置选项。

## 命令

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

可用模板：

- `vanilla`
- `react`
- `vue`
- `preact`
- `svelte`
- `solid`

可用入口：

- `background`
- `content`
- `contents/{name}`
- `popup`
- `options`
- `sidepanel`
- `devtools`
- `panel`
- `panels/{name}`
- `sandbox`
- `sandboxes/{name}`
- `newtab`
- `history`
- `bookmarks`
- `scripting`
- `pages/{name}`
- `icons`

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
  --size <size...>       specify sizes of output icons
  -h, --help             display help for command
```

可用模板：同 `init` 命令。

可用入口：同 `init` 命令。

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

- [`manifest`](#manifest)
- [`target`](#target)
- [`entriesDir`](#entriesDir)
- [`outDir`](#outDir)
- [`publicDir`](#publicDir)
- [`rsbuild`](#rsbuild)
- [`webExt`](#webExt)

#### manifest

- 类型: `WebExtendManifest`
- 默认值: `{}`

`manifest` 配置。WebExtend 会合并 `manifest` 选项和入口文件信息（前者有更高的优先级），在构建时自动生成 `manifest.json`。

#### target

- 类型:

```ts
type WebExtendTarget =
  | "chrome-mv3"
  | "firefox-mv2"
  | "firefox-mv3"
  | "safari-mv3"
  | "edge-mv3"
  | "opera-mv3";
```

- 默认值: `"chrome-mv3"`

#### entriesDir

- 类型: `string`
- 默认值: `"./src"`

自定义入口目录，默认为项目根路径下的 `./src` 目录，如果 `./src` 目录不存在，则默认为项目根目录。

#### outDir

- 类型: `string`
- 默认值: `dist`

设置构建产物目录。

#### publicDir

- 类型: `string`
- 默认值: `public`

设置公共目录。

#### rsbuild

- 类型: `RsbuildConfig`
- 默认值: `{}`

参考 [Rsbuild Configuration](https://rsbuild.rs/config/) 了解更多配置项。

#### webExt

- 类型: `WebExtConfig`
- 默认值: `{}`

参考 [web-ext run](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run) 了解更多配置项。

使用：

```ts [web-extend.config.js]
import { defineConfig } from 'web-extend';

export default defineConfig({
  entriesDir: "./src",
  outDir: "dist",
  manifest: {...},
  target: "firefox-mv2",
});
```

### defineWebExtConfig

`defineWebExtConfig` 函数用于帮助定义 web-ext 的配置信息。

使用：

```js [web-ext.config.js]
import { defineWebExtConfig } from "web-extend";

export default defineWebExtConfig({
  run: {
    // ...
  },
});
```

## 类型

### ContentScriptConfig

- 类型：

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

`ContentScriptConfig` 是一个 TypeScript 类型，用于定义 content script 的配置信息。

使用：

```ts [src/content/index.ts]
import type { ContentScriptConfig } from "web-extend";

export const config: ContentScriptConfig = {
  matches: ["https://www.google.com/*"],
};
```
