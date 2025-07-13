import {
  getMultipleDeclarativeEntryFile,
  getSingleDeclarativeEntryFile,
  matchMultipleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFile,
} from '../common.js';
import type { DeclarativeEntryFileResult, ManifestEntryProcessor, WebExtendEntryInput } from '../types.js';

const key = 'sandboxes';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return (
    matchSingleDeclarativeEntryFile(filePath, 'sandbox', context) ||
    matchMultipleDeclarativeEntryFile(filePath, 'sandboxes', context)
  );
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  const { target } = context;
  if (target.includes('firefox')) return;

  let input = manifest.sandbox?.pages || [];
  let declarativeResult: DeclarativeEntryFileResult[] | null = null;
  if (!input.length) {
    const singleEntry = await getSingleDeclarativeEntryFile('sandbox', context);
    const multipleEntry = await getMultipleDeclarativeEntryFile('sandboxes', context);
    declarativeResult = [singleEntry[0], ...multipleEntry].filter(Boolean);
    if (declarativeResult.length) {
      input = declarativeResult.map((item) => item.path);
      manifest.sandbox = {
        ...(manifest.sandbox || {}),
        pages: input,
      };
    }
  }

  if (input.length) {
    const entry: WebExtendEntryInput[] = [];
    input.forEach((page, index) => {
      const name = declarativeResult ? declarativeResult[index].name : `${key}/${index}`;
      entry.push({
        name,
        input: [page],
        type: 'html',
      });
    });

    if (entry.length) {
      entries[key] = entry;
    }
  }
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name, entries }) => {
  const pages = manifest?.sandbox?.pages || [];
  const entry = entries[key] || [];
  const index = [entry].flat().findIndex((item) => item.name === name);

  if (index !== -1) {
    pages[index] = `${name}.html`;
  }
};

const sandboxProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  writeEntry,
};

export default sandboxProcessor;
