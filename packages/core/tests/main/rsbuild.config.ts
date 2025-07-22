import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginWebExtend } from '../../../rsbuild-plugin/src/index.js';

export default defineConfig({
  plugins: [pluginReact(), pluginWebExtend()],
});
