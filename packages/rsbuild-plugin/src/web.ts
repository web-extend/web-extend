import type { EnvironmentConfig } from '@rsbuild/core';
import { transformManifestEntry } from './helper.js';
import type { NormalizeRsbuildEnvironmentProps } from './types.js';

const isProd = process.env.NODE_ENV === 'production';
const jsDistPath = 'static/js';
const cssDistPath = 'static/css';

export function getWebEnvironmentConfig({
  manifestEntries,
  context,
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
        js: (pathData) => {
          const chunkName = pathData.chunk?.name;
          if (chunkName && webEntry[chunkName] && webEntry[chunkName].entryType !== 'html') {
            return '[name].js';
          }
          const name = isProd ? '[name].[contenthash:8].js' : '[name].js';
          return `${jsDistPath}/${name}`;
        },
        css: (pathData) => {
          const chunkName = pathData.chunk?.name;
          if (chunkName && webEntry[chunkName]?.entryType === 'style') {
            return '[name].css';
          }
          const name = isProd ? '[name].[contenthash:8].css' : '[name].css';
          return `${cssDistPath}/${name}`;
        },
      },
    },
  };
}
