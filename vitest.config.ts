import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/dist/**',
        '**/static/**',
        '**/rslib.config.ts',
        'packages/core/templates/**',
        'docs/**',
      ],
    },
  },
});
