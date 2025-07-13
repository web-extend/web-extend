import {
  getEntryName,
  getMultipleDeclarativeEntryFile,
  getSingleDeclarativeEntryFile,
  matchMultipleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFile,
} from '../common.js';
import type { ManifestEntryProcessor, WebExtendEntryInput } from '../types.js';

const key = 'sandbox';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return (
    matchSingleDeclarativeEntryFile(filePath, key, context) ||
    matchMultipleDeclarativeEntryFile(filePath, 'sandboxes', context)
  );
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  const { target, rootPath, entriesDir } = context;
  let input = manifest.sandbox?.pages || [];
  if (target.includes('firefox')) return;

  if (!input.length) {
    const singleEntry = await getSingleDeclarativeEntryFile(key, context);
    const multipleEntry = await getMultipleDeclarativeEntryFile('sandboxes', context);
    const result = [singleEntry[0], ...multipleEntry].filter(Boolean);

    if (result.length) {
      input = result.map((item) => item.path);
      manifest.sandbox = {
        ...(manifest.sandbox || {}),
        pages: input,
      };
    }
  }

  if (input.length) {
    const entry: WebExtendEntryInput[] = [];
    input.forEach((page) => {
      const name = getEntryName(page, rootPath, entriesDir.root);
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
  const entry = (entries[key] as WebExtendEntryInput[]) || [];
  const index = entry.findIndex((item) => item.name === name);

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
