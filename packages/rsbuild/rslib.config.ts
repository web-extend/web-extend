import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      dts: {
        bundle: true,
      },
    },
  ],
  output: {
    copy: [
      {
        from: './src/static',
        to: 'static',
      },
    ],
  },
});
