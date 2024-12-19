import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { createRsbuild } from '@rsbuild/core';
import { pluginWebExt } from '../src/index.js';
import type { PluginWebExtOptions } from '../src/index.js';
import type { WebExtensionManifest } from '../src/manifest/types.js';

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
  outDir?: string;
  pluginOptions?: Partial<PluginWebExtOptions>;
};

export async function initRsbuild({ cwd, mode, outDir = 'dist', pluginOptions }: InitRsbuildOptions) {
  const rsbuild = await createRsbuild({
    cwd,
    rsbuildConfig: {
      mode,
      plugins: [pluginWebExt(pluginOptions)],
      output: {
        distPath: {
          root: outDir,
        },
        sourceMap: false,
      },
    },
  });
  return rsbuild;
}

export async function readManifest(distPath: string) {
  const manifestPath = resolve(distPath, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8')) as WebExtensionManifest;
  return manifest;
}
