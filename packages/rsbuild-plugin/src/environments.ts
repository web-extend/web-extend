import type { EnvironmentConfig } from '@rsbuild/core';
import { getCssDistPath, getJsDistPath, transformManifestEntry } from './helper.js';
import type { ManifestEntries } from '@web-extend/manifest/types';

type EnviromentKey = 'web' | 'background';

type NormalizeRsbuildEnvironmentProps = {
  manifestEntries: ManifestEntries;
  isDev: boolean;
};

function getWebEnvironmentConfig({
  manifestEntries,
  isDev,
}: NormalizeRsbuildEnvironmentProps): EnvironmentConfig | undefined {
  const webEntry = Object.values(manifestEntries)
    .filter(Boolean)
    .reduce((res, cur) => Object.assign(res, cur), {});

  const entry = transformManifestEntry(webEntry);
  if (!entry) return;

  return {
    source: {
      entry,
    },
    output: {
      target: 'web',
      injectStyles: isDev && Object.keys(manifestEntries.content || {}).length > 0, // needed for content entry
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

export const normalizeRsbuildEnvironments = (options: NormalizeRsbuildEnvironmentProps) => {
  const { manifestEntries } = options;
  const { background, ...webEntries } = manifestEntries;

  const environments: {
    [key in EnviromentKey]?: EnvironmentConfig;
  } = {};

  if (background) {
    environments.background = {
      source: {
        entry: transformManifestEntry(background),
      },
      output: {
        target: 'web-worker',
        distPath: {
          js: '',
        },
        filename: {
          js: getJsDistPath(background),
        },
      },
    };
  }

  const webEnv = getWebEnvironmentConfig({
    ...options,
    manifestEntries: webEntries,
  });
  if (webEnv) {
    environments.web = webEnv;
  }

  if (!environments.background && !environments.web) {
    throw new Error('No entry found, please add at least one entry.');
  }

  return environments;
};
