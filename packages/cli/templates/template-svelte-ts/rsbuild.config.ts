import { defineConfig } from '@rsbuild/core';
import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { pluginWebExtend } from '@web-extend/rsbuild-plugin';

export default defineConfig({
  plugins: [pluginSvelte(), pluginWebExtend()],
});
