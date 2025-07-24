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
