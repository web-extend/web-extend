import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getEntryName, matchMultipleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'panel';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file) =>
  matchSingleDeclarativeEntryFile(key, file) || matchMultipleDeclarativeEntryFile('panels', file);

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ manifest, context }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: ManifestEntryInput = {};

  const { rootPath, srcDir } = context;
  const srcPath = resolve(rootPath, srcDir);
  const files = await readdir(srcPath, { recursive: true });
  const panels = files.filter(matchDeclarativeEntry).map((file) => resolve(srcPath, file));

  for (const file of panels) {
    const name = getEntryName(file, rootPath, srcDir);
    if (name) {
      entry[name] = {
        input: [file],
        entryType: 'html',
      };
    }
  }

  return Object.keys(entry).length ? entry : null;
};

/**
 * @deprecated Use `pages` instead.
 */
const panelProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  readEntry,
};

export default panelProcessor;
