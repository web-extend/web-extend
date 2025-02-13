import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ExtensionTarget } from '@web-extend/manifest/types';

export interface CacheBuildInfo {
  rootPath: string;
  distPath: string;
  target: ExtensionTarget;
}

interface CacheResult {
  build?: CacheBuildInfo[];
}

const cacheDir = '.web-extend';
const resultFile = 'results.json';

async function initCacheDir(dirPath: string) {
  await mkdir(dirPath);
  await writeFile(resolve(dirPath, '.gitignore'), '**/*', 'utf-8');
}

async function readCacheResult(filePath: string) {
  try {
    if (!existsSync(filePath)) return null;
    const res = await readFile(filePath, 'utf-8');
    const data = JSON.parse(res);
    return data as CacheResult;
  } catch {
    return null;
  }
}

export async function writeBuildInfo(root: string, data: CacheBuildInfo) {
  const cachePath = resolve(root, cacheDir);
  const resultPath = resolve(cachePath, resultFile);

  if (!existsSync(cachePath)) {
    initCacheDir(cachePath);
  }

  let result = await readCacheResult(resultPath);
  if (!result) {
    result = {};
  }
  if (!Array.isArray(result.build)) {
    result.build = [];
  }

  const index = result.build.findIndex((item) => item.target === data.target);
  if (index !== -1) {
    result.build[index] = data;
  } else {
    result.build.push(data);
  }

  await writeFile(resultPath, JSON.stringify(result), 'utf-8');
}

export async function readBuildInfo(root: string) {
  const filePath = resolve(root, cacheDir, resultFile);
  const result = await readCacheResult(filePath);
  return result?.build;
}

export function getCurrentBuildInfo(list: CacheBuildInfo[], option: Partial<CacheBuildInfo>) {
  const { distPath, target } = option;
  if (distPath && target) {
    return list.find((item) => item.distPath === distPath && item.target === target);
  }
  if (distPath) {
    return list.find((item) => item.distPath === distPath);
  }
  if (target) {
    return list.find((item) => item.target === target);
  }
}
