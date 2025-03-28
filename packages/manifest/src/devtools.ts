import { resolve } from 'node:path';
import { matchDeclarativeSingleEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'devtools';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file);

const normalizeDevtoolsEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, files, context }) => {
  const { rootPath, srcDir } = context;
  const { devtools_page } = manifest;
  if (devtools_page) return;

  const entryPath = files.filter(matchDeclarativeEntryFile).map((file) => resolve(rootPath, srcDir, file))[0];
  if (entryPath) {
    manifest.devtools_page = entryPath;
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ manifest, context }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: ManifestEntryInput = {
    devtools: {
      input: [devtools_page],
      html: true,
    },
  };

  return entry;
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name }) => {
  manifest.devtools_page = `${name}.html`;
};

const devtoolsProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  normalize: normalizeDevtoolsEntry,
  readEntry,
  writeEntry,
};

export default devtoolsProcessor;
