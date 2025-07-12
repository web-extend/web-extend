import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import type {
  ExtensionManifest,
  ExtensionTarget,
  WebExtendContext,
  WebExtendEntriesDir,
  WebExtendEntryDescription,
  WebExtendEntryKey,
} from './types.js';

const scriptExts = ['.ts', '.js', '.tsx', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];
const styleExts = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus'];

function isScriptFile(file: string) {
  if (file.endsWith('.d.ts')) return false;
  return scriptExts.some((ext) => file.endsWith(ext));
}

function isStyleFile(file: string) {
  return styleExts.some((ext) => file.endsWith(ext));
}

export function getEntryName(file: string, rootPath: string, entriesDir: string) {
  const filePath = isAbsolute(file) ? file : resolve(rootPath, file);
  const srcPath = isAbsolute(entriesDir) ? entriesDir : resolve(rootPath, entriesDir);
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
  if (isScriptFile(`${name}${ext}`)) {
    return scriptExts.flatMap((item) => [`${name}${item}`, `${name}${sep}index${item}`]);
  }
  if (isStyleFile(`${name}${ext}`)) {
    return styleExts.flatMap((item) => [`${name}${item}`]);
  }
  return [`${name}${ext}`];
}

export const matchSingleDeclarativeEntryFile = (
  key: WebExtendEntryKey,
  filePath: string,
  context: WebExtendContext,
  entryType: WebExtendEntryDescription['entryType'][] = ['script'],
) => {
  const allowable = isScriptFile(filePath) || (entryType?.includes('style') && isStyleFile(filePath));
  if (!allowable) return null;

  const { rootPath, entriesDir } = context;
  const entryDir = resolve(rootPath, entriesDir.root, entriesDir[key]);
  if (!filePath.startsWith(entryDir)) return null;

  const ext = extname(filePath);
  const entryName = basename(entryDir);

  // [entryName][ext] or [entryName]/index[ext]
  const file = relative(dirname(entryDir), filePath);
  const slices = file.split(sep);
  if (slices.length > 1 && slices[slices.length - 1] === `index${ext}`) {
    slices.pop();
  }

  return slices.length === 1 && slices[0] === entryName ? { name: entryName, ext } : null;
};

export const matchMultipleDeclarativeEntryFile = (
  key: WebExtendEntryKey,
  filePath: string,
  context: WebExtendContext,
  entryType?: WebExtendEntryDescription['entryType'][],
) => {
  const allowable = isScriptFile(filePath) || (entryType?.includes('style') && isStyleFile(filePath));
  if (!allowable) return null;

  const { rootPath, entriesDir } = context;
  const entryDir = resolve(rootPath, entriesDir.root, entriesDir[key]);
  if (!filePath.startsWith(entryDir)) return null;

  const ext = extname(filePath);
  const entryName = basename(entryDir);

  // [entryName]/*[ext] or [entryName]/*/index[ext]
  const file = relative(dirname(entryDir), filePath);
  const slices = file.split(sep);
  if (slices.length === 2) {
    slices[1] = basename(slices[1], ext);
  } else if (slices.length > 2 && slices[slices.length - 1] === `index${ext}`) {
    slices.pop();
  }

  return slices.length === 2 && slices[0] === entryName
    ? {
        name: `${entryName}/${slices[1]}`,
        ext,
      }
    : null;
};

export const isAllowableEntryFile = (
  file: string,
  entryTypes: WebExtendEntryDescription['entryType'][] = ['script'],
) => {
  if (entryTypes.includes('script') && isScriptFile(file)) {
    return true;
  }
  if (entryTypes.includes('style') && isStyleFile(file)) {
    return true;
  }
  return false;
};

export const getSingleDeclarativeEntryFile = async (
  key: WebExtendEntryKey,
  context: WebExtendContext,
  entryTypes: WebExtendEntryDescription['entryType'][] = ['script'],
) => {
  const { rootPath, entriesDir } = context;
  const entryDir = resolve(rootPath, entriesDir.root, entriesDir[key]);
  const entryName = basename(entryDir);
  const dirPath = dirname(entryDir);
  if (!existsSync(dirPath)) return [];

  const possibleFiles: { name: string; ext: string; path: string }[] = [];
  const files = await readdir(dirPath, { withFileTypes: true });
  for (const file of files) {
    const ext = extname(file.name);
    const name = basename(file.name, ext);
    if (name !== entryName) continue;

    if (file.isFile() && isAllowableEntryFile(file.name, entryTypes)) {
      possibleFiles.push({ name, ext, path: resolve(dirPath, file.name) });
    }

    if (file.isDirectory()) {
      const subFiles = await readdir(resolve(dirPath, file.name), { withFileTypes: true });
      for (const subFile of subFiles) {
        const subExt = extname(subFile.name);
        const subName = basename(subFile.name, subExt);
        if (subFile.isFile() && subName === 'index' && isAllowableEntryFile(subFile.name, entryTypes)) {
          possibleFiles.push({
            name,
            ext: subExt,
            path: resolve(dirPath, file.name, subFile.name),
          });
        }
      }
    }
  }

  return possibleFiles;
};

export const getMultipleDeclarativeEntryFile = async (
  key: WebExtendEntryKey,
  context: WebExtendContext,
  entryTypes: WebExtendEntryDescription['entryType'][] = ['script'],
) => {
  const { rootPath, entriesDir } = context;
  const entryDir = resolve(rootPath, entriesDir.root, entriesDir[key]);
  if (!existsSync(entryDir)) return [];

  const entryName = basename(entryDir);
  const possibleFiles: { name: string; ext: string; path: string }[] = [];

  const files = await readdir(entryDir, { withFileTypes: true });
  for (const file of files) {
    const ext = extname(file.name);
    const name = basename(file.name, ext);
    if (file.isFile() && isAllowableEntryFile(file.name, entryTypes)) {
      possibleFiles.push({ name: `${entryName}/${name}`, ext, path: resolve(entryDir, file.name) });
    }

    if (file.isDirectory()) {
      const subFiles = await readdir(resolve(entryDir, file.name), { withFileTypes: true });
      for (const subFile of subFiles) {
        const subExt = extname(subFile.name);
        const subName = basename(subFile.name, subExt);
        if (subFile.isFile() && subName === 'index' && isAllowableEntryFile(subFile.name, entryTypes)) {
          possibleFiles.push({
            name: `${entryName}/${name}`,
            ext: subExt,
            path: resolve(entryDir, file.name, subFile.name),
          });
        }
      }
    }
  }

  return possibleFiles;
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

interface ResolveOutDirProps {
  outDir?: string | undefined;
  target?: ExtensionTarget;
  mode?: string | undefined;
  buildDirTemplate?: string | undefined;
}

export function resolveOutDir({
  outDir,
  target = defaultExtensionTarget,
  mode,
  buildDirTemplate = '{target}-{mode}',
}: ResolveOutDirProps) {
  const dir = outDir || 'dist';
  let postfix = '';
  if (isDevMode(mode)) {
    postfix = 'dev';
  } else if (isProdMode(mode)) {
    postfix = 'prod';
  } else {
    postfix = mode || '';
  }

  const subDir = buildDirTemplate.replace(/\{target\}/g, target).replace(/\{mode\}/g, postfix);

  return join(dir, subDir);
}

export async function readManifestFile(distPath: string) {
  const manifestFile = resolve(distPath, 'manifest.json');
  if (!existsSync(manifestFile)) {
    throw new Error(`Cannot find manifest.json in ${distPath}`);
  }
  const manifest = JSON.parse(await readFile(manifestFile, 'utf-8')) as ExtensionManifest;
  return manifest;
}

export function normalizeEntriesDir(rootPath: string, entriesDir?: Partial<WebExtendEntriesDir> | string) {
  const entriesDirOption = typeof entriesDir === 'string' ? { root: entriesDir } : entriesDir || {};
  const defaultRoot = existsSync(resolve(rootPath, './src')) ? './src' : './';

  const res: WebExtendEntriesDir = {
    root: defaultRoot,
    background: 'background',
    content: 'content',
    contents: 'contents',
    popup: 'popup',
    options: 'options',
    sidepanel: 'sidepanel',
    devtools: 'devtools',
    panel: 'panel',
    panels: 'panels',
    sandbox: 'sandbox',
    sandboxes: 'sandboxes',
    newtab: 'newtab',
    history: 'history',
    bookmarks: 'bookmarks',
    scripting: 'scripting',
    pages: 'pages',
    icons: 'assets',
    ...entriesDirOption,
  };
  return res;
}
