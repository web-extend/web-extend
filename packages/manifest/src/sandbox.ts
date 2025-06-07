import { resolve } from 'node:path';
import { getEntryName, matchMultipleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'sandbox';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchSingleDeclarativeEntryFile(key, file) || matchMultipleDeclarativeEntryFile('sandboxes', file);

const normalizeSandboxEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, files, context }) => {
  const { srcDir, rootPath, target } = context;
  const srcPath = resolve(rootPath, srcDir);
  const pages = manifest.sandbox?.pages;
  if (pages?.length || target.includes('firefox')) return;

  const entryPath = files.filter(matchDeclarativeEntryFile).map((file) => resolve(srcPath, file));
  if (entryPath.length) {
    manifest.sandbox = {
      ...(manifest.sandbox || {}),
      pages: entryPath,
    };
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest, context }) => {
  const pages = manifest?.sandbox?.pages || [];
  if (!pages.length) return null;

  const entry: ManifestEntryInput = {};
  pages.forEach((page) => {
    const name = getEntryName(page, context.rootPath, context.srcDir);
    entry[name] = {
      input: [page],
      entryType: 'html',
    };
  });
  return entry;
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name, normalizedManifest, context }) => {
  const pages = manifest?.sandbox?.pages || [];
  const normalizedPages = normalizedManifest.sandbox?.pages || [];
  if (!pages.length || !normalizedPages.length) return;

  normalizedPages.forEach((page, index) => {
    if (getEntryName(page, context.rootPath, context.srcDir) === name) {
      pages[index] = `${name}.html`;
    }
  });
};

const sandboxProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  normalize: normalizeSandboxEntry,
  readEntry,
  writeEntry,
};

export default sandboxProcessor;
