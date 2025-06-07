import type { EnvironmentConfig } from '@rsbuild/core';
import { getCssDistPath, getJsDistPath, transformManifestEntry } from './helper.js';
import type { NormalizeRsbuildEnvironmentProps } from './types.js';

export function getWebEnvironmentConfig({
  manifestEntries,
}: NormalizeRsbuildEnvironmentProps): EnvironmentConfig | undefined {
  const webEntry = Object.values(manifestEntries)
    .filter(Boolean)
    .reduce((res, cur) => Object.assign(res, cur), {});

  const entries = transformManifestEntry(webEntry);
  if (!entries) return;

  return {
    source: {
      entry: entries,
    },
    output: {
      target: 'web',
      distPath: {
        js: '',
        css: '',
      },
      filename: {
        js: getJsDistPath(webEntry),
        css: getCssDistPath(webEntry),
      },
    },
  };
}
