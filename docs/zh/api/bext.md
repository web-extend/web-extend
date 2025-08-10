---
outline: [2, 3]
---

# Bext

[`bext`](https://www.npmjs.com/package/bext) 是一个 CLI 工具，用于创建、开发和构建浏览器扩展。它提供了一个流线型的工作流程，强大的 CLI 命令和灵活的配置选项。

## 命令

`bext` 是主命令，包含几个子命令。这些子命令遵循相同的用法模式。

```shell
bext [options] [command]
```

### bext init

`init` 命令用于初始化一个项目，内置了 Vanilla、[React](https://react.dev/)、[Vue](https://vuejs.org/)、[Svelte](https://svelte.dev/) 的项目模板。

使用：

```shell
npx bext@latest init [options] [dir]
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

### bext generate

`generate` 命令用于生成入口文件。

使用：

```shell
npx bext generate|g [options] [entry...]
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

### bext dev

`dev` 命令使用 Rsbuild 作为构建工具，在开发环境中构建、运行扩展。

使用：

```shell
bext dev [options]
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

### bext build

`build` 命令使用 Rsbuild 作为构建工具，构建生产版本的扩展。

使用：

```shell
bext build [options]
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

### bext preview

`preview` 命令用于预览生产版本的扩展。运行之前需要先使用 `build` 命令构建扩展。

使用：

```shell
bext preview [options] [dir]
```

选项：

```
Options:
  -r, --root <root>      specify the project root directory
  -t, --target <target>  specify the extension target
  -h, --help             display help for command
```

### bext zip

`zip` 命令用于将生产版本的扩展压缩为一个 `.zip` 格式的文件。运行之前需要先使用 `build` 命令构建扩展。

使用：

```shell
bext zip [options] [dir]
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

- [`entriesDir`](#entriesDir)
- [`outDir`](#outDir)
- [`publicDir`](#publicDir)
- [`manifest`](#manifest)
- [`target`](#target)
- [`rsbuild`](#rsbuild)
- [`webExt`](#webExt)

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

#### manifest

- 类型: [`WebExtensionManifest`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
- 默认值: `{}`

`manifest` 配置。WebExtend 会合并 `manifest` 选项和入口文件信息（前者有更高的优先级），在构建时自动生成 `manifest.json`。

#### target

- 类型:

```ts
type WebExtendTarget = 'chrome-mv3' | 'firefox-mv2' | 'firefox-mv3' | 'safari-mv3' | 'edge-mv3' | 'opera-mv3';
```

- 默认值: `"chrome-mv3"`

#### rsbuild

- 类型: [`RsbuildConfig`](https://rsbuild.rs/config/)
- 默认值: `{}`

#### webExt

- 类型: [`WebExtConfig`](#web-ext-config)
- 默认值: `{}`

使用：

```ts [bext.config.ts]
import { defineConfig } from 'bext';

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

```ts [web-ext.config.ts]
import { defineWebExtConfig } from 'bext';

export default defineWebExtConfig({
  run: {
    // ...
  },
});
```

## 类型

### ContentScriptConfig {#content-script-config}

- 类型：

```ts
export interface ContentScriptConfig {
  matches: string[];
  exclude_matches?: string[];
  css?: string[];
  run_at?: 'document_start' | 'document_end' | 'document_idle';
  all_frames?: boolean;
  match_about_blank?: boolean;
  include_globs?: string[];
  exclude_globs?: string[];
  world?: 'ISOLATED' | 'MAIN';
}
```

`ContentScriptConfig` 是一个 TypeScript 类型，用于定义 content script 的配置信息。

使用：

```ts [src/content/index.ts]
import type { ContentScriptConfig } from 'bext';

export const config: ContentScriptConfig = {
  matches: ['https://www.google.com/*'],
};
```
