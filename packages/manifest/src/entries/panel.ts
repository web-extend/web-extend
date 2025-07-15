import {
  getMultipleDeclarativeEntryFile,
  getSingleDeclarativeEntryFile,
  matchMultipleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFile,
} from '../common.js';
import type { ManifestEntryProcessor, WebExtendEntryInput } from '../types.js';

const key = 'panels';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return (
    matchSingleDeclarativeEntryFile(filePath, 'panel', context) ||
    matchMultipleDeclarativeEntryFile(filePath, 'panels', context)
  );
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return;

  const entry: WebExtendEntryInput[] = [];

  const singleEntry = await getSingleDeclarativeEntryFile('panel', context);
  const multipleEntry = await getMultipleDeclarativeEntryFile('panels', context);
  const result = [singleEntry[0], ...multipleEntry].filter(Boolean);

  for (const item of result) {
    entry.push({
      name: item.name,
      import: [item.path],
      type: 'html',
    });
  }

  if (entry.length) {
    entries[key] = entry;
  }
};

const panelProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
};

export default panelProcessor;
