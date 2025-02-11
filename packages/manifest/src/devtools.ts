import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getEntryName, matchDeclarativeMultipleEntryFile, matchDeclarativeSingleEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'devtools';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file);

const normalizeDevtoolsEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, files, context }) => {
  const { rootPath, srcDir } = context;
  const { devtools_page } = manifest;
  if (devtools_page) return;

  const entryPath = files.filter(matchDeclarativeEntryFile).map((file) => resolve(rootPath, srcDir, file))[0];
  if (entryPath) {
    manifest.devtools_page = entryPath;
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ manifest, context }) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: ManifestEntryInput = {
    devtools: {
      input: [devtools_page],
      html: true,
    },
  };

  const { rootPath, srcDir } = context;
  const srcPath = resolve(rootPath, srcDir);
  const files = await readdir(srcPath, { recursive: true });
  const panels = files
    .filter(
      (file) => matchDeclarativeSingleEntryFile('panel', file) || matchDeclarativeMultipleEntryFile('panels', file),
    )
    .map((file) => resolve(srcPath, file));

  for (const file of panels) {
    const name = getEntryName(file, rootPath, srcDir);
    if (name) {
      entry[name] = {
        input: [file],
        html: true,
      };
    }
  }

  return entry;
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name }) => {
  if (name === 'devtools') {
    manifest.devtools_page = `${name}.html`;
  }
};

const devtoolsProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  normalize: normalizeDevtoolsEntry,
  readEntry,
  writeEntry,
};

export default devtoolsProcessor;
