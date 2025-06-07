import { existsSync } from 'node:fs';
import { readdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RsbuildConfig, RsbuildEntry, Rspack } from '@rsbuild/core';
import type { ManifestEntryInput } from '@web-extend/manifest/types';

export function isDevMode(mode: string | undefined) {
  return mode === 'development';
}

export function transformManifestEntry(entry: ManifestEntryInput | undefined) {
  if (!entry) return;
  const res: RsbuildEntry = {};
  for (const key in entry) {
    const { input, entryType = 'html' } = entry[key];
    let imports = input;

    if (key.startsWith('icons')) {
      imports = input.map((file) => `${file}?url`);
    }

    res[key] = {
      import: imports,
      html: entryType === 'html',
    };
  }
  return Object.keys(res).length ? res : undefined;
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
    recursive: true,
  });
  const outdatedFiles: string[] = [];

  for (const file of files) {
    if (file.includes('.hot-update.')) {
      const item = reservedFiles.find((prefix) => file.includes(prefix));
      if (!item) {
        outdatedFiles.push(file);
      }
    }
  }

  for (const file of outdatedFiles) {
    await unlink(resolve(distPath, file));
  }
}
