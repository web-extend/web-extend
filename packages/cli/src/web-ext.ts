import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export type TargetType = 'firefox-desktop' | 'firefox-android' | 'chromium';

export interface WebExtOptions {
  run?: WebExtRunOptions;
}

export interface WebExtRunOptions {
  artifactsDir?: string;
  browserConsole?: boolean;
  devtools?: boolean;
  pref?: { [key: string]: boolean | string | number };
  firefox?: string;
  firefoxProfile?: string;
  profileCreateIfMissing?: boolean;
  keepProfileChanges?: boolean;
  ignoreFiles?: string[];
  noInput?: boolean;
  // noReload?: boolean;
  preInstall?: boolean;
  sourceDir?: string;
  watchFile?: string[];
  watchIgnored?: string[];
  startUrl?: string | string[];
  target?: TargetType | TargetType[];
  args?: string[];
  // Android CLI options.
  adbBin?: string;
  adbHost?: string;
  adbPort?: string;
  adbDevice?: string;
  adbDiscoveryTimeout?: number;
  adbRemoveOldArtifacts?: boolean;
  firefoxApk?: string;
  firefoxApkComponent?: string;
  // Chromium CLI options.
  chromiumBinary?: string;
  chromiumProfile?: string;
}

const posibleConfigFiles = ['web-ext.config.mjs', 'web-ext.config.cjs', 'web-ext.config.js'];

async function loadWebExtConfig(root: string) {
  const configFile = posibleConfigFiles.map((item) => resolve(root, item)).find((item) => existsSync(item));
  if (!configFile) return null;
  try {
    const { default: config } = await import(configFile);
    return config;
  } catch (err) {
    console.error(`Loading ${configFile} failed. \n`, err);
    return null;
  }
}

export async function normalizeWebExtRunConfig(root: string, options: WebExtRunOptions) {
  const userConfig = await loadWebExtConfig(root);
  const userRunconfig = userConfig?.run || {};

  const config: WebExtRunOptions = {
    ...options,
    ...(userRunconfig || {}),
    noReload: true,
  };

  return config;
}

export async function importWebExt() {
  const webExt = await import('web-ext')
    .then((mod) => mod.default)
    .catch(() => {
      console.warn(`Cannot find package 'web-ext', falling back to default open method.`);
      return null;
    });
  return webExt;
}
