import { resolve } from 'node:path';
import { getEntryName, matchMultipleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'sandbox';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return (
    matchSingleDeclarativeEntryFile(entriesDir.sandbox, file) ||
    matchMultipleDeclarativeEntryFile(entriesDir.sandboxes, file)
  );
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, files, context }) => {
  const { srcDir, rootPath, target } = context;
  const srcPath = resolve(rootPath, srcDir);
  const pages = manifest.sandbox?.pages;
  if (pages?.length || target.includes('firefox')) return;

  const entryFile = files.filter((file) => matchDeclarativeEntry(file, context)).map((file) => resolve(srcPath, file));
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

  const { rootPath, entriesDir } = context;

  const entry: ManifestEntryInput = {};
  pages.forEach((page) => {
    const name = getEntryName(page, rootPath, entriesDir.root);
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

  const { rootPath, entriesDir } = context;
  normalizedPages.forEach((page, index) => {
    if (getEntryName(page, rootPath, entriesDir.root) === name) {
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
