import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginWebExtend } from '@web-extend/rsbuild-plugin';

export default defineConfig({
  plugins: [pluginVue(), pluginWebExtend()],
  output: {
    // https://github.com/web-infra-dev/rsbuild/issues/3217
    sourceMap: {
      js: false
    }
  }
});
