import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginWebExtend } from '@web-extend/rsbuild-plugin';

export default defineConfig({
  plugins: [pluginReact(), pluginWebExtend()],
});
