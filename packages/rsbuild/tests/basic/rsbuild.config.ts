import { defineConfig } from '@rsbuild/core';
import { pluginWebExtend } from '../../src/index.js';

export default defineConfig({
  // mode: 'development',
  plugins: [
    pluginWebExtend({
      target: 'firefox-mv2',
    }),
  ],
  output: {
    distPath: {
      root: 'dist/firefox-mv2-prod',
    },
  },
});
