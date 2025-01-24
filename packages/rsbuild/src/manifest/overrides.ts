import { resolve } from 'node:path';
import type { Manifest } from 'webextension-polyfill';
import { matchDeclarativeSingleEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor, PageToOverride } from './types.js';

const key = 'overrides';
const overrides: PageToOverride[] = ['newtab', 'history', 'bookmarks'];

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) => {
  for (const key of overrides) {
    const item = matchDeclarativeSingleEntryFile(key, file);
    if (item) return item;
  }
  return null;
};

const normalizeOverridesEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, srcPath, files }) => {
  const { chrome_url_overrides = {} } = manifest;
  if (Object.keys(chrome_url_overrides).length) return;

  for (const key of overrides) {
    const entryPath = files
      .filter((file) => matchDeclarativeSingleEntryFile(key, file))
      .map((file) => resolve(srcPath, file))[0];

    if (entryPath) {
      manifest.chrome_url_overrides = {
        ...(manifest.chrome_url_overrides || {}),
        [key]: entryPath,
      };
    }
  }
};

const readOverridesEntry: ManifestEntryProcessor['read'] = (manifest) => {
  const { chrome_url_overrides } = manifest || {};
  if (!chrome_url_overrides) return null;

  const entry: ManifestEntryInput = {};
  for (const key of overrides) {
    const input = chrome_url_overrides[key as keyof Manifest.WebExtensionManifestChromeUrlOverridesType];
    if (!input) continue;

    entry[key] = {
      input: [input],
      html: true,
    };
  }
  return Object.keys(entry).length ? entry : null;
};

const writeOverridesEntry: ManifestEntryProcessor['write'] = ({ manifest, name }) => {
  const { chrome_url_overrides } = manifest;
  if (!chrome_url_overrides) return;

  const key = name as keyof Manifest.WebExtensionManifestChromeUrlOverridesType;
  if (chrome_url_overrides[key]) {
    chrome_url_overrides[key] = `${name}.html`;
  }
};

const overrideProcessors: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  matchEntryName: (entryName) => overrides.includes(entryName as PageToOverride),
  normalize: normalizeOverridesEntry,
  read: readOverridesEntry,
  write: writeOverridesEntry,
};

export default overrideProcessors;
