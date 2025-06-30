import type { EnvironmentConfig } from '@rsbuild/core';
import { getCssDistPath, getJsDistPath, transformManifestEntry } from './helper.js';
import type { NormalizeRsbuildEnvironmentProps } from './types.js';

export function getScriptingEnvironmentConfig({
  manifestEntries,
}: NormalizeRsbuildEnvironmentProps): EnvironmentConfig | undefined {
  const scripting = manifestEntries.scripting;
  const entry = transformManifestEntry(scripting);
  if (!scripting || !entry) return;

  return {
    source: {
      entry,
    },
    output: {
      target: 'web',
      injectStyles: false,
      distPath: {
        js: '',
        css: '',
      },
      filename: {
        js: getJsDistPath(scripting),
        css: getCssDistPath(scripting),
      },
    },
  };
}
