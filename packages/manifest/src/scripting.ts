import { readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';
import { getEntryName, matchMultipleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'scripting';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchMultipleDeclarativeEntryFile('scripting', file, ['script', 'style']);

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ context }) => {
  const entry: ManifestEntryInput = {};

  const { rootPath, srcDir } = context;
  const srcPath = resolve(rootPath, srcDir);
  const scriptingPath = resolve(srcPath, 'scripting');

  if (!existsSync(scriptingPath)) {
    return null;
  }

  const files = await readdir(scriptingPath, { recursive: true });
  const scripting = files
    .map((file) => join('scripting', file))
    .filter(matchDeclarativeEntryFile)
    .map((file) => resolve(srcPath, file));

  for (const file of scripting) {
    const name = getEntryName(file, rootPath, srcDir);
    if (name) {
      entry[name] = {
        input: [file],
        entryType: file.endsWith('css') ? 'style' : 'script',
      };
    }
  }

  return Object.keys(entry).length ? entry : null;
};

const processor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  readEntry,
};

export default processor;
