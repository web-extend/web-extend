---
outline: deep
---

# Environment Variables

WebExtend supports injecting environment variables into your code based on Rsbuild, which is helpful for dynamic configuration, thanks to Rsbuild.

## Built-in Env Variables

There are two kinds of built-in env variables you can use: the ones provided by Rsbuild, and the ones provided by WebExtend.

Rsbuild provides the following variables.

- `import.meta.env.MODE`: read the mode configuration, which can be either 'development' or 'production'.
- `import.meta.env.DEV`: whether the mode is 'development'.
- `import.meta.env.PROD`: whether the mode is 'production'.

WebExtend provides the following variables.

- `import.meta.env.WEB_EXTEND_TARGET`: read the extension target.

## Custom Env Variables

You can custom env variables in the following env files.

| Name                     | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `.env`                   | Loaded by default in all scenarios.                 |
| `.env.local`             | Local usage of the .env file                        |
| `.env.development`       | Loaded when `process.env.NODE_ENV` is 'development' |
| `.env.development.local` | Local usage of the `.env.development` file          |
| `.env.production`        | Loaded when `process.env.NODE_ENV` is 'production'  |
| `.env.production.local`  | Local usage of the `.env.production` file           |
| `.env.[mode]`            | Loaded when the env mode is specified               |
| `.env.[mode].local`      | Local usage of the `.env.[mode]` file               |

For example, suppose the env variables are as follows.

::: code-group

```[.env]
FOO=Hello
BAR=1
```

```[.env.test]
FOO=Hello Test
```

When you set the env mode is `test`.

:::

```shell
bext dev --env-mode test
```

Then matched `env` files will be parse by the following order and the results will be merged.

- .env
- .env.local
- .env.test
- .env.test.local

So the final environment variables are as follows.

```ts [rsbuild.config.ts]
console.log(import.meta.env.FOO); // 'Hello Test'
console.log(import.meta.env.BAR); // '1'
```

## Public Variables

All the built-in env variables and the custom env variables with the `PUBLIC_` prefix can be accessed in client code. For example, if the following variables are defined:

```[.env]
PUBLIC_FOO=1
BAR=2
```

In the client code, you can access the environment variables through `import.meta.env.<name>`.

```ts [src/popup/index.ts]
console.log(import.meta.env.PUBLIC_FOO); // -> '1'
console.log(import.meta.env.BAR); // -> undefined
```

## Type Declarations

To fix TypeScript type errors when using env variables, you might need to extend the type of `import.meta.env`.

```ts [src/env.d.ts]
/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  // import.meta.env.PUBLIC_FOO
  readonly PUBLIC_FOO: string;
}
```
