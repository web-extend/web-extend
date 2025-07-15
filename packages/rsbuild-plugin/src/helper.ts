import { existsSync } from 'node:fs';
import { readdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { FilenameConfig, RsbuildEntry, Rspack } from '@rsbuild/core';
import type { WebExtendEntryInput } from '@web-extend/manifest/types';

export function transformManifestEntry(entries: WebExtendEntryInput[]) {
  const res: RsbuildEntry = {};
  for (const item of entries) {
    const { name, type } = item;
    let imports = [item.import].flat();
    if (name === 'icons') {
      imports = imports.map((file) => `${file}?url`);
    }

    res[name] = {
      import: imports,
      html: type === 'html',
    };
  }
  return Object.keys(res).length ? res : undefined;
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

const isProd = process.env.NODE_ENV === 'production';
const jsDistPath = 'static/js';
const cssDistPath = 'static/css';

export const getJsDistPath = (entries: WebExtendEntryInput[]): FilenameConfig['js'] => {
  return (pathData) => {
    const chunkName = pathData.chunk?.name;
    const entry = entries.find((item) => item.name === chunkName);
    if (chunkName && entry && entry.type !== 'html') {
      return '[name].js';
    }
    const name = isProd ? '[name].[contenthash:8].js' : '[name].js';
    return `${jsDistPath}/${name}`;
  };
};

export const getCssDistPath = (entries: WebExtendEntryInput[]): FilenameConfig['css'] => {
  return (pathData) => {
    const chunkName = pathData.chunk?.name;
    const entry = entries.find((item) => item.name === chunkName);
    if (chunkName && entry && entry.type === 'style') {
      return '[name].css';
    }
    const name = isProd ? '[name].[contenthash:8].css' : '[name].css';
    return `${cssDistPath}/${name}`;
  };
};
