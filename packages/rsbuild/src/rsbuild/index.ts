import { existsSync } from 'node:fs';
import { readdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { EnvironmentConfig, RsbuildConfig, RsbuildEntry, Rspack } from '@rsbuild/core';
import type { ManifestEnties, ManifestEntryInput } from '../manifest/types.js';
import type { EnviromentKey } from './types.js';

export function isDevMode(mode: string | undefined) {
  return mode === 'development';
}

function transformManifestEntry(entry: ManifestEntryInput | undefined) {
  if (!entry) return;
  const res: RsbuildEntry = {};
  for (const key in entry) {
    const { input, html } = entry[key];
    res[key] = {
      import: input,
      html,
    };
  }
  return res;
}

export function getRsbuildEntryFiles(entries: RsbuildEntry, key: string) {
  const entry = entries[key];
  const res: string[] = [];
  if (typeof entry === 'string') {
    res.push(entry);
  } else if (Array.isArray(entry)) {
    res.push(...entry);
  } else {
    res.push(...[entry.import].flat());
  }
  return res;
}

export function getAllRsbuildEntryFiles(environments: RsbuildConfig['environments']) {
  const res: string[] = [];
  if (!environments) return [];
  for (const key in environments) {
    const entry = environments[key]?.source?.entry;
    if (!entry) continue;
    for (const entryName in entry) {
      res.push(...getRsbuildEntryFiles(entry, entryName));
    }
  }
  return res;
}

export async function normalizeRsbuildEnvironments({
  manifestEntries,
  config,
  selfRootPath,
}: {
  config: RsbuildConfig;
  selfRootPath: string;
  manifestEntries: ManifestEnties;
}) {
  const { icons, background, content, ...others } = manifestEntries;
  const mode = config.mode || process.env.NODE_ENV;

  const environments: {
    [key in EnviromentKey]?: EnvironmentConfig;
  } = {};
  let defaultEnvironment: EnvironmentConfig | null = null;

  if (icons) {
    defaultEnvironment = environments.icons = {
      source: {
        entry: transformManifestEntry(icons),
      },
      output: {
        target: 'web',
        dataUriLimit: 0,
      },
    };
  }

  if (background) {
    defaultEnvironment = environments.background = {
      source: {
        entry: transformManifestEntry(background),
      },
      output: {
        target: 'web-worker',
      },
    };
  }

  if (content) {
    defaultEnvironment = environments.content = {
      source: {
        entry: transformManifestEntry(content),
      },
      output: {
        target: 'web',
        injectStyles: isDevMode(mode),
      },
      dev: {
        assetPrefix: true,
      },
      tools: {
        rspack: {
          output: {
            hotUpdateGlobal: 'webpackHotUpdateWebExtend_content',
          },
        },
      },
    };
  }

  const webEntry = Object.values(others)
    .filter((entry) => !!entry)
    .reduce((res, cur) => Object.assign(res, cur), {});
  if (Object.values(webEntry).length) {
    defaultEnvironment = environments.web = {
      source: {
        entry: transformManifestEntry(webEntry),
      },
      output: {
        target: 'web',
      },
    };
  }

  if (!defaultEnvironment) {
    // void the empty entry error
    defaultEnvironment = environments.icons = {
      source: {
        entry: {
          empty: {
            import: resolve(selfRootPath, './static/empty_entry.js'),
            html: false,
          },
        },
      },
      output: {
        target: 'web',
      },
    };
  }

  return environments;
}

function getHotUpdateAssets(statsList: Rspack.Stats[]) {
  const entrypointsList = statsList.map((item) => item?.toJson().entrypoints).filter((item) => !!item);
  const res: string[] = [];

  for (const entrypoints of entrypointsList) {
    const data = Object.values(entrypoints).flatMap((entrypoint) => {
      const assets = entrypoint.assets?.map((item) => item.name).filter((item) => item.includes('.hot-update.'));
      return assets || [];
    });
    res.push(...data);
  }
  return res;
}

export async function clearOutdatedHotUpdateFiles(distPath: string, statsList: Rspack.Stats[]) {
  if (!existsSync(distPath)) return;
  const reservedFiles = getHotUpdateAssets(statsList);

  const files = await readdir(distPath, {
    withFileTypes: true,
  });
  const outdatedFiles: string[] = [];

  for (const file of files) {
    const { name } = file;
    if (file.isFile() && name.includes('.hot-update.')) {
      const item = reservedFiles.find((prefix) => name.includes(prefix));
      if (!item) {
        outdatedFiles.push(file.name);
      }
    }
  }

  for (const file of outdatedFiles) {
    await unlink(resolve(distPath, file));
  }
}
