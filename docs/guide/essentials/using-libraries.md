---
outline: deep
---

# Using Libraries

WebExtend supports lots of frontend frameworks or libraries, which benefits from [Rsbuild's features](https://rsbuild.rs/guide/start/features). This chapter covers most commonly used cases.

## UI Libraries

### React

To create a project with WebExtend and React, just run the following command.

```shell
npx web-extend@latest init --template react
```

To use React in an existing WebExtend project, you need to register the [Rsbuild React plugin](https://rsbuild.rs/plugins/list/plugin-react).

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
});
```

### Vue

To create a project with WebExtend and Vue, just run the following command.

```shell
npx web-extend@latest init --template vue
```

To use Vue in an existing WebExtend project, you need to register the [Rsbuild Vue plugin](https://rsbuild.rs/plugins/list/plugin-vue).

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';

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

To create a project with WebExtend and React, just run the following command.

```shell
npx web-extend@latest init --template preact
```

To use Preact in an existing WebExtend project, you need to register the [Rsbuild Rreact plugin](https://rsbuild.rs/plugins/list/plugin-preact).

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import { pluginPreact } from '@rsbuild/plugin-preact';

export default defineConfig({
  plugins: [pluginPreact()],
});
```

### Svelte

To create a project with WebExtend and Svelte, just run the following command.

```shell
npx web-extend@latest init --template svelte
```

To use Svelte in an existing WebExtend project, you need to register the [Rsbuild Svelte plugin](https://rsbuild.rs/plugins/list/plugin-svelte).

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import { pluginSvelte } from '@rsbuild/plugin-svelte';

export default defineConfig({
  plugins: [pluginSvelte()],
});
```

### Solid

To create a project with WebExtend and Solid, just run the following command.

```shell
npx web-extend@latest init --template solid
```

To use Solid in an existing WebExtend project, you need to register the [Rsbuild Solid plugin](https://rsbuild.rs/plugins/list/plugin-solid).

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
  ],
});
```

## CSS Libraries

### CSS Modules

You can directly use [CSS Modules](https://github.com/css-modules/css-modules) in a WebExtend project. Files ending with `.module.(css|less|sass|scss|styl|stylus)` are considered CSS Modules.

For example.

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

### CSS Preprocessors

You can use CSS preprocessors in a WebExtend project, including Sass, Less and Stylus. To use one of them, you need to register the corresponding Rsbuild plugin.

- [Sass Plugin](https://rsbuild.rs/plugins/list/plugin-sass)
- [Less Plugin](https://rsbuild.rs/plugins/list/plugin-less)
- [Stylus Plugin](https://rsbuild.rs/plugins/list/plugin-stylus)

::: code-group

```ts [Sass]
// rsbuild.config.ts
import { pluginSass } from '@rsbuild/plugin-sass';

export default {
  plugins: [pluginSass()],
};
```

```ts [Less]
// rsbuild.config.ts
import { pluginLess } from '@rsbuild/plugin-less';

export default {
  plugins: [pluginLess()],
};
```

```ts [Stylus]
// rsbuild.config.ts
import { pluginStylus } from '@rsbuild/plugin-stylus';

export default {
  plugins: [pluginStylus()],
};
```

:::

### Tailwind CSS

To use [Tailwind CSS](https://tailwindcss.com/) in a WebExtend project, you can integrate it with PostCSS, which is built-in supported in Rsbuild.

Install the following dependencies.

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

Register the Tailwind CSS PostCSS plugin through `postcss.config.js`.

```js [postcss.config.mjs]
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Import Tailwind CSS to your CSS entry file.

```css [src/popup/index.css]
@import 'tailwindcss';
```

Now you can use Tailwind CSS in your components or HTML.

```tsx
<h1 class="text-3xl font-bold underline">Hello world!</h1>
```

### UnoCSS

To use [UnoCSS](https://unocss.dev/) in a WebExtend project, you can integrate it with PostCSS, which is built-in supported in Rsbuild.

Install the following dependencies.

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

Register the UnoCSS PostCSS plugin through `postcss.config.js`.

```js [postcss.config.mjs]
import UnoCSS from '@unocss/postcss';

export default {
  plugins: [UnoCSS()],
};
```

Add UnoCSS configuration through `uno.config.ts`.

```ts [uno.config.ts]
import { defineConfig, presetWind3 } from 'unocss';

export default defineConfig({
  content: {
    filesystem: ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}', '!src/**/*.d.ts'],
  },
  presets: [presetWind3()],
});
```

Import UnoCSS to your CSS entry file.

```css [src/popup/index.css]
@unocss;
```

Now you can use UnoCSS in your components or HTML.

```tsx
<div class="m-1">Hello world!</div>
```

## Unplugin

### unplugin-auto-import

[unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) is a library for auto importing APIs on-demand. To use it in a WebExtend project, you need to register the corresponding plugin.

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import AutoImport from 'unplugin-auto-import/rspack';

export default defineConfig({
  tools: {
    rspack: {
      plugins: [
        AutoImport({
          imports: [
            'vue',
            {
              'webextension-polyfill': [['=', 'browser']],
            },
          ],
          dts: './src/auto-imports.d.ts',
        }),
      ],
    },
  },
});
```

Now you can directly use browser and Vue Composition API without importing, which will be automatically injected in the build time.

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

### unplugin-vue-components

[unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components) is a library for on-demand auto importing Vue components. To use it in a WebExtend project, you need to register the corresponding plugin.

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import Components from 'unplugin-vue-components/rspack';

export default defineConfig({
  tools: {
    rspack: {
      plugins: [Components({})],
    },
  },
});
```

### unplugin-icons

[unplugin-icons](https://github.com/antfu/unplugin-icons) is a library for importing icons as components. To use it in a WebExtend project, you need to register the corresponding plugin.

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';
import Icons from 'unplugin-icons/rspack';

export default defineConfig({
  tools: {
    rspack: {
      plugins: [Icons()],
    },
  },
});
```

## Linting & Formatting

### ESLint

ESLint is a lint tool that helps you find and fix problems in JavaScript code.

Use [ESLint](https://eslint.org/docs/latest/use/getting-started).

### Prettier

Prettier is an opinionated code formatter that helps you style code.

Use [Prettier](https://prettier.io/docs/install).

### Biome

Biome is one toolchain that helps you format and lint your code, which can be considered a combination of ESLint and Prettier.

Use [Biome](https://biomejs.dev/guides/getting-started/).
