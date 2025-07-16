import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { loadWebExtendConfig } from './config.js';

interface CacheBuildInfo {
  rootPath: string;
  distPath: string;
  target: string;
}

interface CacheResult {
  build?: CacheBuildInfo[];
}

const defaultCacheDir = join('node_modules', '.web-extend');
const resultFile = 'results.json';

async function readResultFromCache(root: string, cacheDir: string) {
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

export async function cacheBuildResult({
  root,
  data,
  cacheDir = defaultCacheDir,
}: { root: string; data: CacheBuildInfo; cacheDir?: string }) {
  const resultPath = resolve(root, cacheDir, resultFile);

  const cacheDirPath = dirname(resultPath);
  if (!existsSync(cacheDirPath)) {
    await mkdir(cacheDirPath, { recursive: true });
  }

  let result = await readResultFromCache(root, cacheDir);
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

export async function loadBuildResult({
  root,
  outDir,
  target,
}: {
  root: string;
  outDir?: string;
  target?: string;
}) {
  const { content: webExtendConfig } = await loadWebExtendConfig(root);
  const cacheDir = webExtendConfig?.cacheDir || defaultCacheDir;
  const res = {
    rootPath: root,
  } as Partial<CacheBuildInfo>;
  const cacheResult = await readResultFromCache(root, cacheDir);
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
