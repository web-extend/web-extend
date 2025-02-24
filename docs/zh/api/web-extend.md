---
outline: deep
---

# web-extend CLI

[`web-extend`](https://www.npmjs.com/package/web-extend) 是一个命令行工具，用于创建项目、生成入口、运行和构建扩展等。

使用：

```shell
npx web-extend [options] [command]

# or
npm add -D web-extend
npx we [options] [command]
```

`we` 命令是 `web-extend` 命令的简写形式，二者是等价的。唯一的区别是：`we` 命令需要在安装 `web-extend` 工具后才可以使用。

## web-extend init

`init` 命令用于初始化一个项目，内置了 Vanilla、[React](https://react.dev/)、[Vue](https://vuejs.org/)、[Svelte](https://svelte.dev/) 的项目模板。

使用：

```shell
npx web-extend@latest init [options] [dir]
```

选项：

```
Options:
  -t, --template <name>  specify the template name
  -e, --entry <name>     specify entrypoints
  -h, --help             display help for command
```

## web-extend generate

`generate` 命令用于生成入口文件。

使用：

```shell
npx web-extend generate|g [options] [entry]
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

## web-extend rsbuild:dev

`rsbuild:dev` 命令使用 Rsbuild 作为构建工具，在开发环境中构建、运行扩展。

使用：

```shell
npx web-extend rsbuild:dev [options]
```

选项：

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

## web-extend rsbuild:build

`rsbuild:build` 命令使用 Rsbuild 作为构建工具，构建生产版本的扩展。

使用：

```shell
npx web-extend rsbuild:build [options]
```

选项：

```
Options:
  -r, --root <root>      specify the project root directory
  -c, --config <config>  specify the configuration file
  -o, --out-dir <dir>    specify the output directory
  -m, --mode <mode>      specify the build mode, can be `development`, `production` or `none`
  --env-mode <mode>      specify the env mode to load the `.env.[mode]` file
  --env-dir <dir>        specify the directory to load `.env` files
  -t, --target <target>  specify the extension target
  -z, --zip              package the built extension
  -h, --help             display help for command
```

## web-extend preview

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

## web-extend zip

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
