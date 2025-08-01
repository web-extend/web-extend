import { getMultipleDeclarativeEntryFile, matchMultipleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor, WebExtendEntries } from '../types.js';

const key = 'pages';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchMultipleDeclarativeEntryFile(filePath, key, context);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ context, entries }) => {
  const entry: WebExtendEntries['pages'] = [];

  const result = await getMultipleDeclarativeEntryFile(key, context);
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

const processor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
};

export default processor;
