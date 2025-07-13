import { getMultipleDeclarativeEntryFile, matchMultipleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor, WebExtendEntryInput } from '../types.js';

const key = 'pages';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchMultipleDeclarativeEntryFile(filePath, key, context);
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ context }) => {
  const entry: WebExtendEntryInput[] = [];

  const result = await getMultipleDeclarativeEntryFile(key, context);
  for (const item of result) {
    entry.push({
      name: item.name,
      input: [item.path],
      type: 'html',
    });
  }

  return entry.length ? entry : null;
};

const processor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  readEntry,
};

export default processor;
