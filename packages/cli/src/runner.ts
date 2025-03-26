import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { defaultExtensionTarget } from '@web-extend/manifest/common';
import type { ExtensionTarget } from '@web-extend/manifest/types';
import chalk from 'chalk';
import { resolveBuildInfo } from './result.js';
import { pathToFileURL } from 'node:url';

type TargetType = 'firefox-desktop' | 'firefox-android' | 'chromium';

interface WebExtRunConfig {
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

interface WebExtConfig {
  run?: WebExtRunConfig;
}

export interface ExtensionRunner {
  reloadAllExtensions: () => void;
  exit: () => void;
}

export interface PreviewOptions {
  root?: string;
  target?: ExtensionTarget;
  outDir?: string;
}

const posibleConfigFiles = ['web-ext.config.mjs', 'web-ext.config.cjs', 'web-ext.config.js'];

async function loadWebExtConfig(root: string) {
  const configFile = posibleConfigFiles.map((item) => resolve(root, item)).find((item) => existsSync(item));
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

export async function normalizeRunnerConfig(
  root: string,
  outDir: string,
  extensionTarget = defaultExtensionTarget,
  options: WebExtRunConfig = {},
) {
  const userConfig = await loadWebExtConfig(root);
  const userRunconfig = userConfig?.run || {};
  const sourceDir = resolve(root, outDir);

  const config: WebExtRunConfig = {
    target: extensionTarget?.includes('firefox') ? 'firefox-desktop' : 'chromium',
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
export async function run(webExt: any, config: WebExtRunConfig) {
  const extensionRunner: ExtensionRunner = await webExt.cmd.run(config, {
    shouldExitProgram: false,
  });
  return extensionRunner;
}

export async function preview({ root = process.cwd(), outDir, target }: PreviewOptions) {
  const webExt = await importWebExt();
  if (!webExt) {
    throw Error(`Cannot find package 'web-ext'; please install web-ext first.`);
  }

  const { distPath, target: finalTarget } = await resolveBuildInfo({ root, outDir, target });
  if (!distPath) {
    throw Error('Cannot find build info; please build first or specify the artifact directory.');
  }

  if (!existsSync(distPath)) {
    throw new Error(`Directory ${chalk.yellow(relative(root, distPath))} doesn't exist.`);
  }

  const config = await normalizeRunnerConfig(root, distPath, finalTarget);
  return run(webExt, config);
}

// https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/#setting-option-defaults-in-a-configuration-file
export function defineWebExtConfig(config: WebExtConfig): WebExtConfig {
  return config;
}
