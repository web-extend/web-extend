---
outline: deep
---

# web-extend CLI

`web-extend` 是一个命令行工具，用于创建项目、生成入口、运行和构建扩展等。

## web-extend init

`init` 命令用于初始化一个项目，内置了 Vanilla、React、Vue、Sevlte 几种项目模板。

基础使用：

```shell
npx web-extend@latest init [options] [dir]
```

选项设置：

```
Usage: web-extend init [options] [dir]

create a new project

Options:
  -t, --template <name>  specify the template name
  -e, --entry <name>     specify entry ponts
  -h, --help             display help for command
```

## web-extend generate

`generate` 命令用于生成入口文件。

基础使用：

```shell
npx web-extend generate
```

选项设置：

```
Usage: web-extend generate|g [options] <type>

generate entry files

Arguments:
  type                   type of files

Options:
  -r, --root <dir>       specify the project root directory
  -t, --template <name>  specify the template name or path
  -o, --out-dir <dir>    specify the output directory
  -n, --filename <name>  specify the output filename
  --size <size>          specify sizes of output icons (defaults to 16,32,48,64,128)
  -h, --help             display help for command
```

## web-extend rsbuild:dev

`rsbuild:dev` 命令使用 Rsbuild 作为构建工具，启动 dev 环境。

基础使用：

```shell
npx web-extend rsbuild:dev
```

选项设置：

```
Usage: web-extend rsbuild:dev [options]

execute the dev command of rsbuild

Options:
  -r, --root <root>      specify the project root directory
  -c --config <config>   specify the configuration file
  -m --mode <mode>       specify the build mode, can be `development`, `production` or `none`
  --env-mode <mode>      specify the env mode to load the `.env.[mode]` file
  --env-dir <dir>        specify the directory to load `.env` files
  -t, --target <target>  specify the extension target
  -o, --open [url]       open the page in browser on startup
  --port <port>          specify a port number for server to listen
  -h, --help             display help for command
```

## web-extend rsbuild:build

`rsbuild:build` 命令使用 Rsbuild 作为构建工具，构建生产版本的扩展。

基础使用：

```shell
npx web-extend rsbuild:build
```

选项设置：

```
Usage: web-extend rsbuild:build [options]

execute the build command of rsbuild

Options:
  -r, --root <root>      specify the project root directory
  -c --config <config>   specify the configuration file
  -m --mode <mode>       specify the build mode, can be `development`, `production` or `none`
  --env-mode <mode>      specify the env mode to load the `.env.[mode]` file
  --env-dir <dir>        specify the directory to load `.env` files
  -t, --target <target>  specify the extension target
  -z, --zip              package the extension after build
  -h, --help             display help for command
```

## web-extend preview

`preview` 命令用于预览生产版本的扩展。

基础使用：

```shell
npx web-extend preview
```

## web-extend zip

`zip` 命令用于压缩生产版本的扩展。

基础使用：

```shell
npx web-extend zip
```

选项设置：

```
Usage: web-extend zip [options] [source]

package an extension into a .zip file for publishing

Arguments:
  source                     specify the dist path

Options:
  -r, --root <root>          specify the project root directory
  -o, --out-dir <dir>        specify the output directory
  -n, --filename <filename>  specify the output filename
  -h, --help                 display help for command
```
