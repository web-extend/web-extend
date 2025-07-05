import { resolve } from 'node:path';
import { matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'devtools';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return matchSingleDeclarativeEntryFile(entriesDir.devtools, file);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, files, context }) => {
  const { rootPath, entriesDir } = context;
  const { devtools_page } = manifest;
  if (devtools_page) return;

  const entryFile = files
    .filter((file) => matchDeclarativeEntry(file, context))
    .map((file) => resolve(rootPath, entriesDir.root, file))[0];
  if (entryFile) {
    manifest.devtools_page = entryFile;
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
