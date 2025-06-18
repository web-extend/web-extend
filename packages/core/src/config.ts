import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RsbuildConfig } from '@rsbuild/core';
import type { PluginWebExtendOptions } from '@web-extend/rsbuild-plugin';
import type { Jiti } from 'jiti';
import type { WebExtConfig } from './runner.js';

export interface WebExtendConfig extends PluginWebExtendOptions {
  rsbuild?: RsbuildConfig;
  webExt?: WebExtConfig;
}

type ConfigResult<T> = {
  content?: T;
  filePath?: string;
};

export type WebExtendConfigResult = ConfigResult<WebExtendConfig>;

export async function loadConfig<T>({
  root,
  configFiles,
}: {
  root: string;
  configFiles: string[];
}): Promise<ConfigResult<T>> {
  const configFile = configFiles.map((item) => resolve(root, item)).find((item) => existsSync(item));
  if (!configFile) return {};

  const isTsConfig = configFile.endsWith('.ts');
  let jiti: Jiti | null = null;
  try {
    // Use jiti for TypeScript files
    if (isTsConfig) {
      const { createJiti } = await import('jiti');
      jiti = createJiti(import.meta.url);
      const config = await jiti.import<T>(configFile, { default: true });
      return { content: config, filePath: configFile };
    }

    const fileUrl = pathToFileURL(configFile).href;
    const { default: config } = await import(fileUrl);
    return { content: config, filePath: configFile };
  } catch (err) {
    if (isTsConfig && !jiti) {
      console.error('Please install jiti to load TypeScript config files.');
    }
    console.error(`Loading ${configFile} failed. \n`, err);
    return {};
  }
}

const webExtendConfigFiles = ['web-extend.config.mjs', 'web-extend.config.ts', 'web-extend.config.js'];

export function loadWebExtendConfig(root: string) {
  return loadConfig<WebExtendConfig>({ root, configFiles: webExtendConfigFiles });
}

export const defineWebExtendConfig = (config: WebExtendConfig) => {
  return config;
};
