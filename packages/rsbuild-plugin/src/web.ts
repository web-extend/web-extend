import type { EnvironmentConfig } from '@rsbuild/core';
import { ContentRuntimePlugin } from './content.js';
import { getCssDistPath, getJsDistPath, hotUpdateGlobal, isDevMode, transformManifestEntry } from './helper.js';
import type { NormalizeRsbuildEnvironmentProps } from './types.js';

export function getWebEnvironmentConfig({
  manifestEntries,
  manifestContext,
  context,
}: NormalizeRsbuildEnvironmentProps): EnvironmentConfig | undefined {
  const webEntry = Object.values(manifestEntries)
    .filter(Boolean)
    .reduce((res, cur) => Object.assign(res, cur), {});

  const entry = transformManifestEntry(webEntry);
  if (!entry) return;
  const { mode } = manifestContext;

  return {
    source: {
      entry,
    },
    output: {
      target: 'web',
      injectStyles: isDevMode(mode), // needed for content entry
      distPath: {
        js: '',
        css: '',
      },
      filename: {
        js: getJsDistPath(webEntry),
        css: getCssDistPath(webEntry),
      },
    },
    tools: {
      rspack: {
        output: {
          hotUpdateGlobal,
        },
        plugins: [
          new ContentRuntimePlugin({
            getPort: () => context.devServer?.port,
            target: manifestContext.target,
            mode: manifestContext.mode,
            entry: entry || {},
          }),
        ],
      },
    },
  };
}
