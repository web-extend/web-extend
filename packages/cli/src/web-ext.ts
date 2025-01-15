import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { readBuildInfo } from './cache.js';

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

export interface ExtensionRunner {
  reloadAllExtensions: () => void;
  exit: () => void;
}

export interface PreviewOptions {
  root?: string;
  target?: string;
  outDir?: string;
}

export function getBrowserTarget(target: string): TargetType {
  const browser = target?.includes('firefox') ? 'firefox-desktop' : 'chromium';
  return browser;
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

export async function normalizeRunConfig(
  root: string,
  outDir: string,
  extensionTarget: string,
  options: WebExtRunOptions = {},
) {
  const userConfig = await loadWebExtConfig(root);
  const userRunconfig = userConfig?.run || {};
  const target = getBrowserTarget(extensionTarget);
  const sourceDir = resolve(root, outDir);

  const config: WebExtRunOptions = {
    target,
    sourceDir,
    ...options,
    ...userRunconfig,
    noReload: true,
  };

  return config;
}

export async function importWebExt() {
  const webExt = await import('web-ext').then((mod) => mod.default).catch(() => null);
  return webExt;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function run(webExt: any, config: WebExtRunOptions) {
  const extensionRunner: ExtensionRunner = await webExt.cmd.run(config, {
    shouldExitProgram: false,
  });
  return extensionRunner;
}

export async function preview({ root = process.cwd(), outDir, target }: PreviewOptions) {
  const webExt = await importWebExt();
  if (!webExt) {
    throw Error(`Cannot find package 'web-ext', please intsall web-ext first.`);
  }

  const buildInfo = await readBuildInfo(root);
  const sourceDir = outDir ? resolve(root, outDir) : buildInfo?.distPath;
  const extensionTarget = target || buildInfo?.target;

  if (!sourceDir) {
    throw Error('The output directory is missing, please build first.');
  }

  if (!extensionTarget) {
    throw Error('The extension target is missing, please build first.');
  }

  const config = await normalizeRunConfig(root, sourceDir, extensionTarget);
  return run(webExt, config);
}
