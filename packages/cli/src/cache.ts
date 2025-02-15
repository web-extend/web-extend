import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface BuildInfo {
  rootPath: string;
  distPath: string;
  target: string;
}

interface CacheResult {
  build?: BuildInfo;
}

const cacheDir = '.web-extend';
const resultFile = 'result.json';

async function initCacheDir(dirPath: string) {
  await mkdir(dirPath);
  await writeFile(resolve(dirPath, '.gitignore'), '**/*', 'utf-8');
}

export async function writeBuildInfo(root: string, data: BuildInfo) {
  const cachePath = resolve(root, cacheDir);
  const resultPath = resolve(cachePath, resultFile);

  if (!existsSync(cachePath)) {
    initCacheDir(cachePath);
  }

  let result = await readCacheResult(resultPath);
  if (!result) {
    result = {};
  }
  result.build = {
    ...(result.build || {}),
    ...data,
  };

  await writeFile(resultPath, JSON.stringify(result, null, 2), 'utf-8');
}

export async function readBuildInfo(root: string) {
  const filePath = resolve(root, cacheDir, resultFile);
  const result = await readCacheResult(filePath);
  return result?.build;
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
