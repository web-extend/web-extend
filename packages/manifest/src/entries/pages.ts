import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getEntryName, matchMultipleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'pages';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return matchMultipleDeclarativeEntryFile(entriesDir.pages, file);
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ context }) => {
  const entry: ManifestEntryInput = {};

  const { rootPath, entriesDir } = context;
  const srcPath = resolve(rootPath, entriesDir.root);
  const pagesPath = resolve(srcPath, key);

  if (!existsSync(pagesPath)) {
    return null;
  }

  const files = await readdir(pagesPath, { recursive: true });
  const pages = files
    .map((file) => join(key, file))
    .filter((file) => matchDeclarativeEntry(file, context))
    .map((file) => resolve(srcPath, file));

  for (const file of pages) {
    const name = getEntryName(file, rootPath, entriesDir.root);
    if (name) {
      entry[name] = {
        input: [file],
        entryType: 'html',
      };
    }
  }

  return Object.keys(entry).length ? entry : null;
};

const processor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  readEntry,
};

export default processor;
