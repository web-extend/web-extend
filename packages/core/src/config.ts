import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { CustomManifest, ExtensionTarget } from '@web-extend/manifest/types';
// import type { RsbuildConfig } from '@rsbuild/core';
import type { Jiti } from 'jiti';

export async function loadConfig<T>({
  root,
  configFiles,
}: {
  root: string;
  configFiles: string[];
}): Promise<T | null> {
  const configFile = configFiles.map((item) => resolve(root, item)).find((item) => existsSync(item));
  if (!configFile) return null;

  const isTsConfig = configFile.endsWith('.ts');
  let jiti: Jiti | null = null;
  try {
    // Use jiti for TypeScript files
    if (isTsConfig) {
      const { createJiti } = await import('jiti');
      jiti = createJiti(import.meta.url);
      const config = await jiti.import<T>(configFile, { default: true });
      return config;
    }

    const fileUrl = pathToFileURL(configFile).href;
    const { default: config } = await import(fileUrl);
    return config;
  } catch (err) {
    if (isTsConfig && !jiti) {
      console.error('Please install jiti to load TypeScript config files.');
    }
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

const webExtendConfigFiles = ['web-extend.config.mjs', 'web-extend.config.ts', 'web-extend.config.js'];

export function loadWebExtendConfig(root: string) {
  return loadConfig<WebExtendConfig>({ root, configFiles: webExtendConfigFiles });
}

export const defineWebExtendConfig = (config: WebExtendConfig) => {
  return config;
};
