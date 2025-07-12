import { resolve } from 'node:path';
import {
  getEntryName,
  matchMultipleDeclarativeEntryFile,
  matchMultipleDeclarativeEntryFileV2,
  matchSingleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFileV2,
} from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'sandbox';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return (
    matchSingleDeclarativeEntryFile(entriesDir.sandbox, file) ||
    matchMultipleDeclarativeEntryFile(entriesDir.sandboxes, file)
  );
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context }) => {
  const { rootPath, entriesDir, target } = context;
  const pages = manifest.sandbox?.pages;
  if (pages?.length || target.includes('firefox')) return;

  const singleEntry = await matchSingleDeclarativeEntryFileV2(resolve(rootPath, entriesDir.root, entriesDir.sandbox));
  const multipleEntry = await matchMultipleDeclarativeEntryFileV2(
    resolve(rootPath, entriesDir.root, entriesDir.sandboxes),
  );
  const result = [singleEntry[0], ...multipleEntry].filter(Boolean);

  if (result.length) {
    manifest.sandbox = {
      ...(manifest.sandbox || {}),
      pages: result.map((item) => item.path),
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
