import type { ExtensionTarget, CustomManifest } from '@web-extend/manifest/types';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
// import type { RsbuildConfig } from '@rsbuild/core';

export async function loadConfig<T>({
  root,
  configFiles,
}: {
  root: string;
  configFiles: string[];
}): Promise<T | null> {
  const configFile = configFiles.map((item) => resolve(root, item)).find((item) => existsSync(item));
  if (!configFile) return null;
  try {
    const fileUrl = pathToFileURL(configFile).href;
    const { default: config } = await import(fileUrl);
    return config;
  } catch (err) {
    console.error(`Loading ${configFile} failed. \n`, err);
    return null;
  }
}

export interface WebExtendConfig {
  srcDir?: string;
  outDir?: string;
  target?: ExtensionTarget;
  manifest?: CustomManifest;
  // rsbuild?: RsbuildConfig;
}

const posibleConfigFiles = ['web-extend.config.ts', 'web-extend.config.js', 'web-extend.config.mjs'];

export function loadWebExtendConfig(root: string) {
  return loadConfig<WebExtendConfig>({ root, configFiles: posibleConfigFiles });
}

export const defineWebExtendConfig = (config: WebExtendConfig) => {
  return config;
};
