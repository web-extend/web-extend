import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { createRsbuild } from '@rsbuild/core';
import { pluginWebExtend } from '../src/index.js';
import type { PluginWebExtendOptions } from '../src/index.js';
import { setTargetEnv } from '../src/manifest/common.js';

export { readManifestFile } from '../src/manifest/index.js';

export function getFileContent(distPath: string, name: string) {
  return readFile(resolve(distPath, name), 'utf-8');
}

export function existsFile(distPath: string, name: string, ext: string) {
  if (!name) return false;
  return existsSync(resolve(distPath, name)) && extname(name) === ext;
}

type InitRsbuildOptions = {
  cwd: string;
  mode: 'development' | 'production';
  pluginOptions?: Partial<PluginWebExtendOptions>;
};

export async function initRsbuild({ cwd, mode, pluginOptions }: InitRsbuildOptions) {
  if (pluginOptions?.target) {
    setTargetEnv(pluginOptions.target);
  }
  const rsbuild = await createRsbuild({
    cwd,
    rsbuildConfig: {
      mode,
      plugins: [pluginWebExtend(pluginOptions)],
    },
  });
  return rsbuild;
}

export async function clearDist(distPath: string) {
  await rm(distPath, { recursive: true, force: true });
}
