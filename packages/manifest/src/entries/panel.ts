import {
  getMultipleDeclarativeEntryFile,
  getSingleDeclarativeEntryFile,
  matchMultipleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFile,
} from '../common.js';
import type { ManifestEntryProcessor, WebExtendEntryInput } from '../types.js';

const key = 'panel';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return (
    matchSingleDeclarativeEntryFile(filePath, 'panel', context) ||
    matchMultipleDeclarativeEntryFile(filePath, 'panels', context)
  );
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ manifest, context }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: WebExtendEntryInput[] = [];

  const singleEntry = await getSingleDeclarativeEntryFile('panel', context);
  const multipleEntry = await getMultipleDeclarativeEntryFile('panels', context);
  const result = [singleEntry[0], ...multipleEntry].filter(Boolean);

  for (const item of result) {
    entry.push({
      name: item.name,
      input: [item.path],
      type: 'html',
    });
  }

  return entry.length ? entry : null;
};

const panelProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  readEntry,
};

export default panelProcessor;
