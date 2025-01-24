import { readFile } from 'node:fs/promises';
import { extname, resolve, sep, join } from 'node:path';
import { existsSync } from 'node:fs';
import type { ExtensionTarget } from './types.js';

const jsFileExts = ['.ts', '.js', '.tsx', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];

export const matchDeclarativeSingleEntry = (key: string, file: string) => {
  const ext = extname(file);
  if (!jsFileExts.includes(ext)) return null;

  // match [key].js or [key]/index.js
  const patterns = [`${key}${ext}`, `${key}/index${ext}`];
  if (patterns.includes(file)) {
    return {
      name: patterns[0],
      ext,
    };
  }
  return null;
};

export const matchDeclarativeMultipleEntry = (key: string, file: string) => {
  const ext = extname(file);
  if (!jsFileExts.includes(ext)) return null;

  // match [key]/*.js or [key]/*/index.js
  const slices = file.split(sep);
  if (slices[0] !== key) return null;

  let name = '';
  if (slices.length === 2) {
    name = `${key}-${slices[2]}`;
  } else if (slices.length === 3 && slices[2] === `index${ext}`) {
    name = `${key}-${slices[2]}${ext}`;
  }
  return name
    ? {
        name,
        ext,
      }
    : null;
};

export async function readPackageJson(rootPath: string) {
  const filePath = resolve(rootPath, './package.json');
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export function isDevMode(mode?: string) {
  return mode === 'development';
}

export function isProdMode(mode?: string) {
  return mode === 'production';
}

const EXTENSION_TARGETS: ExtensionTarget[] = [
  'chrome-mv3',
  'firefox-mv3',
  'firefox-mv2',
  'safari-mv3',
  'edge-mv3',
  'opera-mv3',
];
const DEFAULT_EXTENSION_TARGET: ExtensionTarget = 'chrome-mv3';

export function resolveTarget(target?: string): ExtensionTarget {
  const envTarget = process.env.WEB_EXTEND_TARGET as ExtensionTarget;
  if (envTarget && EXTENSION_TARGETS.includes(envTarget)) {
    return envTarget;
  }

  const optionTarget = target as ExtensionTarget;
  if (optionTarget && EXTENSION_TARGETS.includes(optionTarget)) {
    return optionTarget;
  }
  return DEFAULT_EXTENSION_TARGET;
}

export function setTargetEnv(target: string) {
  if (target) {
    process.env.WEB_EXTEND_TARGET = target;
  }
}

export function resolveSrcDir(rootPath: string, srcDir: string | undefined) {
  if (srcDir) return srcDir;
  return existsSync(resolve(rootPath, './src')) ? './src' : './';
}

interface GetOutDirProps {
  outdir?: string | undefined;
  distPath?: string | undefined;
  target?: ExtensionTarget;
  mode?: string | undefined;
  tag?: string | undefined;
}

export function resolveOutDir({ outdir, distPath, target, mode, tag }: GetOutDirProps) {
  const envOutdir = process.env.WEB_EXTEND_OUT_DIR;
  if (envOutdir) return envOutdir;

  if (outdir) return outdir;

  const dir = distPath || 'dist';

  let postfix = '';
  if (tag) {
    postfix = tag;
  } else if (isDevMode(mode)) {
    postfix = 'dev';
  } else if (isProdMode(mode)) {
    postfix = 'prod';
  } else {
    postfix = mode || '';
  }
  const subDir = [target || DEFAULT_EXTENSION_TARGET, postfix].filter(Boolean).join('-');
  return join(dir, subDir);
}

export function setOutDirEnv(outDir: string) {
  if (outDir) {
    process.env.WEB_EXTEND_OUT_DIR = outDir;
  }
}
