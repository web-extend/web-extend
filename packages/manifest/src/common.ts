import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import type { ExtensionTarget, ManifestEntryItem, WebExtensionManifest } from './types.js';

const scriptExts = ['.ts', '.js', '.tsx', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];
const styleExts = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus'];

function isScriptFile(file: string) {
  if (file.endsWith('.d.ts')) return false;
  return scriptExts.some((ext) => file.endsWith(ext));
}

function isStyleFile(file: string) {
  return styleExts.some((ext) => file.endsWith(ext));
}

export function getEntryName(file: string, rootPath: string, srcDir: string) {
  const filePath = isAbsolute(file) ? file : resolve(rootPath, file);
  const srcPath = isAbsolute(srcDir) ? srcDir : resolve(rootPath, srcDir);
  const relativeFilePath = filePath.startsWith(srcPath)
    ? relative(srcPath, filePath)
    : filePath.startsWith(rootPath)
      ? relative(rootPath, filePath)
      : basename(filePath);
  const ext = extname(relativeFilePath);
  const name = relativeFilePath.replace(ext, '').replace(/[\\/]index$/, '');
  return name.split(sep).join('/');
}

export function getEntryFileVariants(name: string, ext: string) {
  if (!isScriptFile(`${name}${ext}`)) {
    return [`${name}${ext}`];
  }
  return scriptExts.flatMap((item) => [`${name}${item}`, `${name}${sep}index${item}`]);
}

export const matchSingleDeclarativeEntryFile = (key: string, file: string) => {
  const res = getEntryFileVariants(key, '.js').includes(file);
  return res ? { name: key, ext: extname(file) } : null;
};

export const matchMultipleDeclarativeEntryFile = (
  key: string,
  file: string,
  entryType?: ManifestEntryItem['entryType'][],
) => {
  const isScript = isScriptFile(file);
  const allowable = isScript || (entryType?.includes('style') && isStyleFile(file));
  if (!allowable) return null;

  const ext = extname(file);
  // match [key]/*.[ext] or [key]/*/index.[ext]
  let name = '';
  const slices = file.split(sep);
  if (slices[0] === key) {
    if (slices.length === 2) {
      name = `${key}/${basename(slices[1], ext)}`;
    } else if (slices.length === 3 && slices[2] === `index${ext}`) {
      name = `${key}/${slices[1]}`;
    }
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

export const defaultExtensionTarget = 'chrome-mv3';

export function resolveTarget(target?: string): ExtensionTarget {
  const envTarget = process.env.WEB_EXTEND_TARGET as ExtensionTarget;
  if (envTarget && EXTENSION_TARGETS.includes(envTarget)) {
    return envTarget;
  }

  const optionTarget = target as ExtensionTarget;
  if (optionTarget && EXTENSION_TARGETS.includes(optionTarget)) {
    return optionTarget;
  }
  return defaultExtensionTarget;
}

export function setTargetEnv(target: string) {
  process.env.WEB_EXTEND_TARGET = target;
}

export function resolveSrcDir(rootPath: string, srcDir?: string) {
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
  if (outdir) return outdir;

  const envOutdir = process.env.WEB_EXTEND_OUT_DIR;
  if (envOutdir) return envOutdir;

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
  const subDir = [target || defaultExtensionTarget, postfix].filter(Boolean).join('-');
  return join(dir, subDir);
}

export async function readManifestFile(distPath: string) {
  const manifestFile = resolve(distPath, 'manifest.json');
  if (!existsSync(manifestFile)) {
    throw new Error(`Cannot find manifest.json in ${distPath}`);
  }
  const manifest = JSON.parse(await readFile(manifestFile, 'utf-8')) as WebExtensionManifest;
  return manifest;
}
