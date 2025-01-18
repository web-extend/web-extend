import { defineConfig } from '@rsbuild/core';
import { pluginWebExtend } from '../lib';

export default defineConfig({
  plugins: [pluginWebExtend()],
});
