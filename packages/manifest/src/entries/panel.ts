import { resolve } from 'node:path';
import {
  matchMultipleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFileV2,
  matchMultipleDeclarativeEntryFileV2,
} from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'panel';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return (
    matchSingleDeclarativeEntryFile(entriesDir.panel, file) ||
    matchMultipleDeclarativeEntryFile(entriesDir.panels, file)
  );
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ manifest, context }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: ManifestEntryInput = {};
  const { rootPath, entriesDir } = context;

  const singleEntry = await matchSingleDeclarativeEntryFileV2(resolve(rootPath, entriesDir.root, entriesDir.panel));
  const multipleEntry = await matchMultipleDeclarativeEntryFileV2(
    resolve(rootPath, entriesDir.root, entriesDir.panels),
  );
  const result = [singleEntry[0], ...multipleEntry].filter(Boolean);

  for (const item of result) {
    entry[item.name] = {
      input: [item.path],
      entryType: 'html',
    };
  }

  return Object.keys(entry).length ? entry : null;
};

const panelProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  readEntry,
};

export default panelProcessor;
