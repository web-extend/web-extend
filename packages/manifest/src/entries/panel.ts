import {
  getMultipleDeclarativeEntryFile,
  getSingleDeclarativeEntryFile,
  matchMultipleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFile,
} from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'panel';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return (
    matchSingleDeclarativeEntryFile('panel', filePath, context) ||
    matchMultipleDeclarativeEntryFile('panels', filePath, context)
  );
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ manifest, context }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: ManifestEntryInput = {};

  const singleEntry = await getSingleDeclarativeEntryFile('panel', context);
  const multipleEntry = await getMultipleDeclarativeEntryFile('panels', context);
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
