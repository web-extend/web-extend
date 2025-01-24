import { readdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';
import { getMultipleEntryFiles, getSingleEntryFile } from './util.js';

const key = 'devtools';

const normalizeDevtoolsEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, files, srcPath }) => {
  const { devtools_page } = manifest;
  if (devtools_page) return;

  const entryPath = await getSingleEntryFile(srcPath, files, key);
  if (entryPath) {
    manifest.devtools_page = entryPath;
  }
};

const readDevtoolsEntry: ManifestEntryProcessor['read'] = async (manifest) => {
  const { devtools_page } = manifest || {};
  if (!devtools_page) return null;

  const entry: ManifestEntryInput = {
    devtools: {
      input: [devtools_page],
      html: true,
    },
  };

  const srcPath = dirname(devtools_page);
  const files = await readdir(srcPath, { recursive: true });
  const panels = await getMultipleEntryFiles(srcPath, files, 'panels');
  for (const file of panels) {
    const res = file.match(/([^\\/]+)([\\/]index)?\.(ts|tsx|js|jsx|mjs|cjs)$/);
    const name = res?.[1];
    if (name) {
      entry[name] = {
        input: [file],
        html: true,
      };
    }
  }

  return entry;
};

const writeDevtoolsEntry: ManifestEntryProcessor['write'] = ({ manifest, name }) => {
  manifest.devtools_page = `${name}.html`;
};

const devtoolsProcessor: ManifestEntryProcessor = {
  key,
  match: (entryName) => entryName === 'devtools',
  normalize: normalizeDevtoolsEntry,
  read: readDevtoolsEntry,
  write: writeDevtoolsEntry,
};

export default devtoolsProcessor;
