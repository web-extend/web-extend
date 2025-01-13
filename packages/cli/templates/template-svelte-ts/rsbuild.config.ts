import { defineConfig } from '@rsbuild/core';
import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { pluginWebExt } from 'rsbuild-plugin-web-ext';

export default defineConfig({
  plugins: [pluginSvelte(), pluginWebExt()],
});
