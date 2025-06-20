import { resolve } from 'node:path';
import { getEntryName, matchMultipleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'sandbox';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file) =>
  matchSingleDeclarativeEntryFile(key, file) || matchMultipleDeclarativeEntryFile('sandboxes', file);

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, files, context }) => {
  const { srcDir, rootPath, target } = context;
  const srcPath = resolve(rootPath, srcDir);
  const pages = manifest.sandbox?.pages;
  if (pages?.length || target.includes('firefox')) return;

  const entryFile = files.filter(matchDeclarativeEntry).map((file) => resolve(srcPath, file));
  if (entryFile.length) {
    manifest.sandbox = {
      ...(manifest.sandbox || {}),
      pages: entryFile,
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
  matchDeclarativeEntry,
  normalizeEntry,
  readEntry,
  writeEntry,
};

export default sandboxProcessor;
