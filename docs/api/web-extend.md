---
outline: deep
---

# web-extend

[`web-extend`](https://www.npmjs.com/package/web-extend) is a useful tool set for creating a project, and generating entry files, etc.

## CLI

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
  -e, --entry <name>     specify entrypoints
  -h, --help             display help for command
```

### web-extend generate

The `generate` command is used to generate entry files.

Usage:

```shell
npx web-extend generate|g [options] [entry]
```

Options:

```
Options:
  -r, --root <dir>       specify the project root directory
  -t, --template <name>  specify the template name or path
  -o, --out-dir <dir>    specify the output directory
  --size <size>          specify sizes of output icons (defaults to 16,32,48,128)
  -h, --help             display help for command
```

### web-extend rsbuild:dev

The `rsbuild:dev` command uses Rsbuild to build and run the extension in the development environment.

Usage:

```shell
npx web-extend rsbuild:dev [options]
```

Options:

```
Options:
  -r, --root <root>      specify the project root directory
  -c, --config <config>  specify the configuration file
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

The `rsbuild:dev` command uses Rsbuild to build the extension in the production environment.

Usage:

```shell
npx web-extend rsbuild:build [options]
```

Options:

```
Options:
  -r, --root <root>      specify the project root directory
  -c, --config <config>  specify the configuration file
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

### defineWebExtConfig

`defineWebExtConfig` is a function that helps you to custom web-ext's config.

Usage:

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

Source: [runner.ts](https://github.com/web-extend/web-extend/blob/main/packages/cli/src/runner.ts#L130).

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
