import type { EnvironmentConfig } from '@rsbuild/core';
import type { WebExtendEntries, WebExtendEntryInput } from '@web-extend/manifest/types';
import { getCssDistPath, getJsDistPath, transformManifestEntry } from './helper.js';

type EnviromentKey = 'web' | 'background';

type NormalizeRsbuildEnvironmentProps = {
  entries: WebExtendEntries;
  isDev: boolean;
};

function getWebEnvironmentConfig({ entries, isDev }: NormalizeRsbuildEnvironmentProps): EnvironmentConfig | undefined {
  const webEntry: WebExtendEntryInput[] = Object.values(entries).flat();
  const entry = transformManifestEntry(webEntry);
  if (!entry) return;

  return {
    source: {
      entry,
    },
    output: {
      target: 'web',
      injectStyles: isDev && !!entries.contents,
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
  const { entries } = options;
  const { background, ...webEntries } = entries;

  const environments: {
    [key in EnviromentKey]?: EnvironmentConfig;
  } = {};

  if (background) {
    const backgroundEntry = [background].flat();
    environments.background = {
      source: {
        entry: transformManifestEntry(backgroundEntry),
      },
      output: {
        target: 'web-worker',
        distPath: {
          js: '',
        },
        filename: {
          js: getJsDistPath(backgroundEntry),
        },
      },
    };
  }

  const webEnv = getWebEnvironmentConfig({
    ...options,
    entries: webEntries,
  });
  if (webEnv) {
    environments.web = webEnv;
  }

  if (!environments.background && !environments.web) {
    throw new Error('No entry found, please add at least one entry.');
  }

  return environments;
};
