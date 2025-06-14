---
outline: deep
---

# 使用库

WebExtend 支持众多前端框架或库，这得益于 [Rsbuild 提供的功能](https://rsbuild.rs/guide/start/features)。本章覆盖了一些常用的使用案例。

## UI 库

### React

若要使用 React 创建一个新的 WebExtend 项目，请执行以下命令。

```shell
npx web-extend@latest init --template react
```

若要在已有的 WebExtend 项目中使用 React，则需要引入 [Rsbuild React 插件](https://rsbuild.rs/plugins/list/plugin-react)。

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
});
```

### Vue

若要使用 Vue 创建一个新的 WebExtend 项目，请执行以下命令。

```shell
npx web-extend@latest init --template vue
```

若要在已有的 WebExtend 项目中使用 Vue，则需要引入 [Rsbuild Vue 插件](https://rsbuild.rs/plugins/list/plugin-vue)。

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";

export default defineConfig({
  plugins: [pluginVue()],
  output: {
    // https://github.com/web-infra-dev/rsbuild/issues/3217
    sourceMap: {
      js: false,
    },
  },
});
```

### Preact

若要使用 Preact 创建一个新的 WebExtend 项目，请执行以下命令。

```shell
npx web-extend@latest init --template preact
```

若要在已有的 WebExtend 项目中使用 React，则需要引入 [Rsbuild Preact 插件](https://rsbuild.rs/plugins/list/plugin-preact)。

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";

export default defineConfig({
  plugins: [pluginReact()],
});
```

### Svelte

若要使用 Svelte 创建一个新的 WebExtend 项目，请执行以下命令。

```shell
npx web-extend@latest init --template svelte
```

若要在已有的 WebExtend 项目中使用 Svelte，则需要引入 [Rsbuild Svelte 插件](https://rsbuild.rs/plugins/list/plugin-svelte)。

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginSvelte } from "@rsbuild/plugin-svelte";

export default defineConfig({
  plugins: [pluginSvelte()],
});
```

### Solid

若要使用 Solid 创建一个新的 WebExtend 项目，请执行以下命令。

```shell
npx web-extend@latest init --template solid
```

若要在已有的 WebExtend 项目中使用 Solid，则需要引入 [Rsbuild Solid 插件](https://rsbuild.rs/plugins/list/plugin-solid)。

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
  ],
});
```

## CSS 库

### CSS Modules

在 WebExtend 项目中可以直接使用 [CSS Modules](https://github.com/css-modules/css-modules)。以 `.module.(css|less|sass|scss|styl|stylus)` 结尾的文件将会被当作 CSS Modules 处理。

示例如下。

```css [button.module.css]
.red {
  background: red;
}
```

```ts [src/popup/Button.tsx]
import styles from "./button.module.css";

export default () => {
  return <button className={styles.red}>Button</button>;
};
```

### CSS 预处理器

在 WebExtend 项目中可以使用 CSS 预处理器，包括 Sass、Less 和 Stylus。为了使用它们，需要引入对应的插件。

- [Sass 插件](https://rsbuild.rs/plugins/list/plugin-sass)
- [Less 插件](https://rsbuild.rs/plugins/list/plugin-less)
- [Stylus 插件](https://rsbuild.rs/plugins/list/plugin-stylus)

::: code-group

```ts [Sass]
// rsbuild.config.ts
import { pluginSass } from "@rsbuild/plugin-sass";

export default {
  plugins: [pluginSass()],
};
```

```ts [Less]
// rsbuild.config.ts
import { pluginLess } from "@rsbuild/plugin-less";

export default {
  plugins: [pluginLess()],
};
```

```ts [Stylus]
// rsbuild.config.ts
import { pluginStylus } from "@rsbuild/plugin-stylus";

export default {
  plugins: [pluginStylus()],
};
```

:::

### Tailwind CSS

若要在 WebExtend 项目中使用 [Tailwind CSS](https://tailwindcss.com/)，需要通过 PostCSS 集成。Rsbuild 内置了 PostCSS 的支持。

安装依赖。

::: code-group

```shell [npm]
npm add tailwindcss @tailwindcss/postcss -D
```

```shell [pnpm]
pnpm add tailwindcss @tailwindcss/postcss -D
```

```shell [yarn]
yarn add tailwindcss @tailwindcss/postcss -D
```

:::

在 `postcss.config.js` 中注册 Tailwind CSS PostCSS 插件。

```js [postcss.config.mjs]
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

在 CSS 入口文件中引入 Tailwind CSS。

```css [src/popup/index.css]
@import "tailwindcss";
```

在组件或 HTML 中使用 Tailwind CSS。

```tsx
<h1 class="text-3xl font-bold underline">Hello world!</h1>
```

### UnoCSS

若要在 WebExtend 项目中使用 [UnoCSS](https://unocss.dev/)，可以通过 PostCSS 集成。Rsbuild 内置了 PostCSS 的支持。

安装依赖。

::: code-group

```shell [npm]
npm add unocss @unocss/postcss -D
```

```shell [pnpm]
pnpm add unocss @unocss/postcss -D
```

```shell [yarn]
yarn add unocss @unocss/postcss -D
```

:::

在 `postcss.config.js` 中注册 UnoCSS PostCSS 插件。

```js [postcss.config.mjs]
import UnoCSS from "@unocss/postcss";

export default {
  plugins: [UnoCSS()],
};
```

在 `uno.config.ts` 中添加 UnoCSS 配置。

```ts [uno.config.ts]
import { defineConfig, presetWind3 } from "unocss";

export default defineConfig({
  content: {
    filesystem: [
      "**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}",
      "!src/**/*.d.ts",
    ],
  },
  presets: [presetWind3()],
});
```

在 CSS 入口文件中引入 UnoCSS。

```css [src/popup/index.css]
@unocss;
```

在组件或 HTML 中使用 UnoCSS。

```tsx
<div class="m-1">>Hello world!</div>
```

## 自动导入

[unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) 是一个用于按需自动导入 API 的库。若要在 WebExtend 项目中使它，需要引入对应的插件。

示例如下。

```ts [rsbuild.config.ts]
import { defineConfig } from "@rsbuild/core";
import AutoImport from "unplugin-auto-import/rspack";

export default defineConfig({
  tools: {
    rspack: {
      plugins: [
        AutoImport({
          imports: [
            "vue",
            {
              "webextension-polyfill": [["=", "browser"]],
            },
          ],
          dts: "./src/auto-imports.d.ts",
        }),
      ],
    },
  },
});
```

现在可以直接使用 browser 和 Vue 组合式 API，而不需要手动导入。在构建时，这些依赖将会被自动注入。

```vue [src/popup/Popup.vue]
<script setup lang="ts">
// import { ref } from 'vue';
// import browser from "webextension-polyfill";

const count = ref(1);

function openOptionsPage() {
  browser.runtime.openOptionsPage();
}
</script>

<template>
  <main>
    <div>Popup</div>
    <button @click="count++">{{ count }}</button>
    <button @click="openOptionsPage">Open Options</button>
  </main>
</template>
```

## 校验与格式化

### ESLint

ESLint 是一个代码校验工具，可以帮助你发现和修复 JavaScript 代码中的问题。

使用 [ESLint](https://eslint.org/docs/latest/use/getting-started)。

### Prettier

Prettier 是一个代码格式化工具，可以帮助你统一代码风格。

使用 [Prettier](https://prettier.io/docs/install)。

### Biome

Biome 是一个工具链，可以帮助你格式化和校验代码，可以视为 ESlint 和 Prettier 的组合。

使用 [Biome](https://biomejs.dev/guides/getting-started/)。
