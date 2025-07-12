import { resolve } from 'node:path';
import { matchMultipleDeclarativeEntryFile, matchMultipleDeclarativeEntryFileV2 } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'pages';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return matchMultipleDeclarativeEntryFile(entriesDir.pages, file);
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ context }) => {
  const entry: ManifestEntryInput = {};
  const { rootPath, entriesDir } = context;
  const entryDir = resolve(rootPath, entriesDir.root, entriesDir.pages);
  const pages = await matchMultipleDeclarativeEntryFileV2(entryDir);

  for (const file of pages) {
    if (file.name) {
      entry[file.name] = {
        input: [file.path],
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
