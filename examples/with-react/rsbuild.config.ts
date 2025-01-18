import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginWebExtend } from '../lib';

export default defineConfig({
  plugins: [pluginReact(), pluginWebExtend()],
});
