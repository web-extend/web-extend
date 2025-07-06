---
outline: [2, 3]
---

# web-extend

[`web-extend`](https://www.npmjs.com/package/web-extend) is a comprehensive toolkit for creating, developing, and building browser extensions. It provides a streamlined workflow with powerful CLI commands and flexible configuration options.

## Commands

Usage:

```shell
npx web-extend [options] [command]

# or
npm add -D web-extend
npx we [options] [command]
```

`we` is a shortened form for `web-extend`. They are equal in function, but the `we` command only can be used after the `web-extend` tool installed.

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

## Configuration

### defineConfig

`defineConfig` function help you to customize WebExtend's configuration options.

Options:

- [`manifest`](#manifest)
- [`target`](#target)
- [`entriesDir`](#entriesDir)
- [`outDir`](#outDir)
- [`publicDir`](#publicDir)
- [`rsbuild`](#rsbuild)
- [`webExt`](#webExt)

#### manifest

Customize `manifest` configuration which defaults to `{}`. WebExtend will merge the `manifest` option and the fields parsed from entry files (the previous is prior), and generate `manifest.json` automatically.

- Type: `ExtensionManifest`
- Default: `{}`

#### target

Customize browser target which suppports the following targets.

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

#### entriesDir

Customize entries directory which defaults to the `./src` directory, falling back to the project root path if `./src` doesn't exists. You can also specify the entries directory for each entry type.

- Type:

```ts
type WebExtendEntriesDir =
  | string
  | {
      root?: string;
      background?: string;
      content?: string;
      contents?: string;
      popup?: string;
      options?: string;
      sidepanel?: string;
      devtools?: string;
      panel?: string;
      panels?: string;
      sandbox?: string;
      sandboxes?: string;
      newtab?: string;
      history?: string;
      bookmarks?: string;
      scripting?: string;
      pages?: string;
      icons?: string;
    };
```

- Default:

```ts
const defaultEntriesDir = {
  root: "./src",
  background: "background",
  content: "content",
  contents: "contents",
  popup: "popup",
  options: "options",
  sidepanel: "sidepanel",
  devtools: "devtools",
  panel: "panel",
  panels: "panels",
  sandbox: "sandbox",
  sandboxes: "sandboxes",
  newtab: "newtab",
  history: "history",
  bookmarks: "bookmarks",
  scripting: "scripting",
  pages: "pages",
  icons: "assets",
};
```

#### outDir

Customize dist path which defaults to the `dist` directory.

- Type: `string`
- Default: `"dist"`

#### publicDir

Customize public path which defaults to the `public` directory.

- Type: `string`
- Default: `"public"`

#### rsbuild

- Type: `RsbuildConfig`
- Default: `{}`

See [Rsbuild Configuration](https://rsbuild.rs/config/) for more details.

#### webExt

- Type: `WebExtConfig`
- Default: `{}`

See [web-ext run](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run) for a full list of configurations.

Usage:

```ts [web-extend.config.js]
import { defineConfig } from 'web-extend';

export default defineConfig({
  outDir: "dist",
  manifest: {...},
  target: "firefox-mv2",
});
```

### defineWebExtConfig

`defineWebExtConfig` function helps you to customize web-ext's configuration options.

Usage:

```js [web-ext.config.js]
import { defineWebExtConfig } from "web-extend";

export default defineWebExtConfig({
  run: {
    // ...
  },
});
```

## Types

### ContentScriptConfig

`ContentScriptConfig` is a TypeScript type that helps you define content script's config.

Type:

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

Usage:

```ts [src/content/index.ts]
import type { ContentScriptConfig } from "web-extend";

export const config: ContentScriptConfig = {
  matches: ["https://www.google.com/*"],
};
```
