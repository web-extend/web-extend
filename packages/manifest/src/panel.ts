import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getEntryName, matchDeclarativeMultipleEntryFile, matchDeclarativeSingleEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'panel';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file) || matchDeclarativeMultipleEntryFile('panels', file);

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ manifest, context }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: ManifestEntryInput = {};

  const { rootPath, srcDir } = context;
  const srcPath = resolve(rootPath, srcDir);
  const files = await readdir(srcPath, { recursive: true });
  const panels = files.filter(matchDeclarativeEntryFile).map((file) => resolve(srcPath, file));

  for (const file of panels) {
    const name = getEntryName(file, rootPath, srcDir);
    if (name) {
      entry[name] = {
        input: [file],
        html: true,
      };
    }
  }

  return Object.keys(entry).length ? entry : null;
};

const panelProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  readEntry,
};

export default panelProcessor;
