---
outline: [2, 3]
---

# web-extend

[`web-extend`](https://www.npmjs.com/package/web-extend) is a comprehensive toolkit for creating, developing, and building browser extensions. It provides a streamlined workflow with powerful CLI commands and flexible configuration options.

## Commands

`web-extend` is the main command. It includes several subcommands. These subcommands follow the same usage pattern below.

```shell
npx web-extend [options] [command]
```

`we` is a shortened form for `web-extend`. The alias is convenient in some cases. For example, use `we g` to generate entry points.

::: info Note
`we` command should be used after the `web-extend` tool installed.
:::

```shell
npx we g popup

# equals to
npx web-extend generate popup
```

### web-extend init

The `init` command is used to create a project.

Usage:

```shell
npx web-extend@latest init [options] [dir]
```

Options:

```
Options:
  -t, --template <name>  specify the template name
  -e, --entry <name...>  specify entrypoints
  -h, --help             display help for command
```

Available templates:

- `vanilla`
- `react`
- `vue`
- `preact`
- `svelte`
- `solid`

Available entrypoints:

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

The `generate` command is used to generate entry files.

Usage:

```shell
npx web-extend generate|g [options] [entry...]
```

Options:

```
Options:
  -r, --root <dir>       specify the project root directory
  -t, --template <name>  specify the template name or path
  --size <size...>       specify sizes of output icons
  -h, --help             display help for command
```

Available templates: The same as the `init` command.

Available entrypoints: The same as the `init` command.

### web-extend dev

The `dev` command uses Rsbuild to build and run the extension in the development environment.

Usage:

```shell
npx web-extend dev [options]
```

Options:

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

The `dev` command uses Rsbuild to build the extension in the production environment.

Usage:

```shell
npx web-extend build [options]
```

Options:

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

The `preview` command is used to preview the extension for production.

Usage:

```shell
npx web-extend preview [options] [dir]
```

Options:

```
Options:
  -r, --root <root>      specify the project root directory
  -t, --target <target>  specify the extension target
  -h, --help             display help for command
```

### web-extend zip

The `zip` command is used to package the extension for production.

Usage:

```shell
npx web-extend zip [options] [dir]
```

Options:

```
Options:
  -r, --root <root>          specify the project root directory
  -n, --filename <filename>  specify the output filename
  -t, --target <target>      specify the extension target
  -h, --help                 display help for command
```

## Functions

### defineConfig

`defineConfig` function helps you to customize WebExtend's configuration options.

Options:

- [`entriesDir`](#entriesDir)
- [`outDir`](#outDir)
- [`publicDir`](#publicDir)
- [`manifest`](#manifest)
- [`target`](#target)
- [`rsbuild`](#rsbuild)
- [`webExt`](#webExt)

#### entriesDir

- Type: `string`
- Default: `"./src"`

Customize entries directory which defaults to the `./src` directory, falling back to the project root path if `./src` doesn't exists.

#### outDir

- Type: `string`
- Default: `"dist"`

Customize dist path.

#### publicDir

- Type: `string`
- Default: `"public"`

Customize public path.

#### manifest

- Type: [`WebExtensionManifest`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
- Default: `{}`

Customize `manifest` configuration. WebExtend will merge the `manifest` option and the fields parsed from entry files (the previous takes precedence). The merged configuration will be used to generate `manifest.json` automatically.

#### target

- Type:

```ts
type WebExtendTarget =
  | "chrome-mv3"
  | "firefox-mv2"
  | "firefox-mv3"
  | "safari-mv3"
  | "edge-mv3"
  | "opera-mv3";
```

- Default: `"chrome-mv3"`

Customize browser target.

#### rsbuild

- Type: [`RsbuildConfig`](https://rsbuild.rs/config/)
- Default: `{}`

#### webExt

- Type: [`WebExtConfig`](#web-ext-config)
- Default: `{}`

Usage:

```ts [web-extend.config.ts]
import { defineConfig } from 'web-extend';

export default defineConfig({
  entriesDir: "./src",
  outDir: "dist",
  manifest: {...},
  target: "firefox-mv2",
});
```

### defineWebExtConfig

`defineWebExtConfig` function helps you to customize web-ext's configuration options.

Usage:

```ts [web-ext.config.ts]
import { defineWebExtConfig } from "web-extend";

export default defineWebExtConfig({
  run: {
    // ...
  },
});
```

## Types

### ContentScriptConfig {#content-script-config}

- Type:

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

`ContentScriptConfig` is a TypeScript type that helps you define content script's config.

Usage:

```ts [src/content/index.ts]
import type { ContentScriptConfig } from "web-extend";

export const config: ContentScriptConfig = {
  matches: ["https://www.google.com/*"],
};
```

<!-- ### WebExtendManifest {#web-extend-manifest}

source: [`packages/manifest/src/types.ts`](https://github.com/web-extend/web-extend/blob/main/packages/manifest/src/types.ts)

### WebExtendConfig {#web-extend-config}

source: [`packages/core/src/config.ts`](https://github.com/web-extend/web-extend/blob/main/packages/core/src/config.ts#L9)

### WebExtConfig {#web-ext-config}

source: [`packages/core/src/runner.ts`](https://github.com/web-extend/web-extend/blob/main/packages/core/src/runner.ts#L46) -->
