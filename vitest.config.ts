import { defineConfig, coverageConfigDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    workspace: ['packages/*'],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/dist/**',
        '**/static/**',
        '**/rslib.config.ts',
        'packages/core/templates/**',
      ],
    },
  },
});
