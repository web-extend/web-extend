import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getEntryName, matchMultipleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'pages';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file) =>
  matchMultipleDeclarativeEntryFile(key, file);

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ context }) => {
  const entry: ManifestEntryInput = {};

  const { rootPath, srcDir } = context;
  const srcPath = resolve(rootPath, srcDir);
  const pagesPath = resolve(srcPath, key);

  if (!existsSync(pagesPath)) {
    return null;
  }

  const files = await readdir(pagesPath, { recursive: true });
  const pages = files
    .map((file) => join(key, file))
    .filter(matchDeclarativeEntry)
    .map((file) => resolve(srcPath, file));

  for (const file of pages) {
    const name = getEntryName(file, rootPath, srcDir);
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
