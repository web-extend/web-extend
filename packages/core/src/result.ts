import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

interface CacheBuildInfo {
  rootPath: string;
  distPath: string;
  target: string;
}

interface CacheResult {
  build?: CacheBuildInfo[];
}

const cacheDir = '.web-extend';
const resultFile = 'results.json';

async function initCacheDir(root: string) {
  const dirPath = resolve(root, cacheDir);
  await mkdir(dirPath);
  await writeFile(resolve(dirPath, '.gitignore'), '**/*', 'utf-8');
}

async function readResultFromCache(root: string) {
  try {
    const cachePath = resolve(root, cacheDir, resultFile);
    if (!existsSync(cachePath)) return null;
    const res = await readFile(cachePath, 'utf-8');
    const data = JSON.parse(res);
    return data as CacheResult;
  } catch {
    return null;
  }
}

export async function cacheBuildInfo(root: string, data: CacheBuildInfo) {
  const resultPath = resolve(root, cacheDir, resultFile);
  if (!existsSync(dirname(resultPath))) {
    initCacheDir(root);
  }

  let result = await readResultFromCache(root);
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

export async function resolveBuildInfo({
  root,
  outDir,
  target,
}: {
  root: string;
  outDir?: string;
  target?: string;
}) {
  const res = {
    rootPath: root,
  } as Partial<CacheBuildInfo>;
  const cacheResult = await readResultFromCache(root);
  const buildInfo = cacheResult?.build || [];

  if (outDir) {
    res.distPath = resolve(root, outDir);
    res.target = target || buildInfo.find((item) => item.distPath === res.distPath)?.target;
    return res;
  }

  if (target) {
    res.target = target;
    res.distPath = buildInfo.find((item) => item.target === target)?.distPath;
    return res;
  }

  if (buildInfo[0]) {
    const first = buildInfo[0];
    res.distPath = first.distPath;
    res.target = first.target;
  }
  return res;
}
