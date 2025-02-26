import { defineConfig } from '@rsbuild/core';
import { pluginWebExtend } from '../../src/index.js';

export default defineConfig({
  plugins: [pluginWebExtend({})],
});
