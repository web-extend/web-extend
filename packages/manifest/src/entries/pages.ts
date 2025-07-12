import { resolve } from 'node:path';
import { getMultipleDeclarativeEntryFile, matchMultipleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'pages';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchMultipleDeclarativeEntryFile(key, filePath, context);
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ context }) => {
  const entry: ManifestEntryInput = {};

  const { rootPath, entriesDir } = context;
  const result = await getMultipleDeclarativeEntryFile(resolve(rootPath, entriesDir.root, entriesDir.pages));

  for (const item of result) {
    entry[item.name] = {
      input: [item.path],
      entryType: 'html',
    };
  }

  return Object.keys(entry).length ? entry : null;
};

const processor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  readEntry,
};

export default processor;
