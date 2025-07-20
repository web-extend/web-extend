---
outline: deep
---

# 环境变量 {#environment-variables}

WebExtend 支持在源码中注入环境变量，这对于动态配置很有帮助。

## 内置环境变量 {#built-in-environment-variables}

可以使用由 Rsbuild 提供的环境变量和由 WebExtend 提供的环境变量。

Rsbuild 提供了如下的环境变量。

- `import.meta.env.MODE`: 读取 `mode` 配置, 可以是 'development' 或 'production'。
- `import.meta.env.DEV`: `mode` 是否为 'development'。
- `import.meta.env.PROD`: `mode` 是否为 'production'。

WebExtend 提供了如下的环境变量。

- `import.meta.env.WEB_EXTEND_TARGET`: 读取扩展目标

## 自定义环境变量 {#custom-environment-variables}

可以在如下的 `env` 文件中定义环境变量。

| 名称                     | 描述                                                           |
| ------------------------ | -------------------------------------------------------------- |
| `.env`                   | 公共环境变量文件                                               |
| `.env.local`             | 本地的公共环境变量文                                           |
| `.env.development`       | 环境变量文件，process.env.NODE_ENV 为 'development' 时生效     |
| `.env.production`        | 环境变量文件，process.env.NODE_ENV 为 'production' 时生效      |
| `.env.development.local` | 本地环境变量文件，process.env.NODE_ENV 为 'development' 时生效 |
| `.env.production.local`  | 本地环境变量文件，process.env.NODE_ENV 为 'production' 时生效  |
| `.env.[mode]`            | 环境变量文件，指定 `env-mode` 时生效                           |
| `.env.[mode].local`      | 本地环境变量文件，指定 `env-mode` 时生效                       |

例如，可以定义如下的环境变量配置。

::: code-group

```[.env]
FOO=Hello
BAR=1
```

```[.env.test]
FOO=Hello Test
```

当设置 `env-mode` 为 `test` 时。

:::

```shell
npx web-extend dev --env-mode test
```

匹配的 `env` 文件将会按照以下顺序被解析，并且合并解析的结果。

- .env
- .env.local
- .env.test
- .env.test.local

最终的环境变量如下。

```ts [rsbuild.config.ts]
console.log(import.meta.env.FOO); // 'Hello Test'
console.log(import.meta.env.BAR); // '1'
```

## Public 变量

所有内置的环境变量和以 `PUBLIC_` 前缀开头的自定义环境变量均可以在客户端代码中被访问。例如，如果定义了如下的环境变量：

```[.env]
PUBLIC_FOO=1
BAR=2
```

在客户端代码中，可以通过 `import.meta.env.<name>` 来访问环境变量。

```ts [src/popup/index.ts]
console.log(import.meta.env.PUBLIC_FOO); // -> '1'
console.log(import.meta.env.BAR); // -> undefined
```

## 类型声明

为了避免因环境变量而导致的 TypeScript 类型错误，你可能需要扩展 `import.meta.env` 的类型。例如：

```ts [src/env.d.ts]
/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  // import.meta.env.PUBLIC_FOO
  readonly PUBLIC_FOO: string;
}
```
