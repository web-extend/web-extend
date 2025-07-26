import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/dist/**',
        '**/static/**',
        '**/bin/**',
        '**/rslib.config.ts',
        'packages/core/templates/**',
        'docs/**',
      ],
    },
    testTimeout: 30000,
  },
});
