import { resolve } from 'node:path';
import { matchSingleDeclarativeEntryFile, matchSingleDeclarativeEntryFileV2 } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'devtools';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return matchSingleDeclarativeEntryFile(entriesDir.devtools, file);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context }) => {
  const { rootPath, entriesDir } = context;
  const { devtools_page } = manifest;
  if (devtools_page) return;

  const result = await matchSingleDeclarativeEntryFileV2(resolve(rootPath, entriesDir.root, entriesDir.devtools));
  if (result[0]) {
    manifest.devtools_page = result[0].path;
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ manifest }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: ManifestEntryInput = {
    devtools: {
      input: [devtools_page],
      entryType: 'html',
    },
  };

  return entry;
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name }) => {
  manifest.devtools_page = `${name}.html`;
};

const devtoolsProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  readEntry,
  writeEntry,
};

export default devtoolsProcessor;
