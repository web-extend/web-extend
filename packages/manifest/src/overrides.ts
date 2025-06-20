import { resolve } from 'node:path';
import { matchSingleDeclarativeEntryFile } from './common.js';
import type { Manifest, ManifestEntryInput, ManifestEntryKey, ManifestEntryProcessor } from './types.js';

const overrides: ManifestEntryKey[] = ['newtab', 'history', 'bookmarks'];

const overrideProcessors = overrides.map((key) => {
  const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file) =>
    matchSingleDeclarativeEntryFile(key, file);

  const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, files }) => {
    const { rootPath, srcDir } = context;
    const { chrome_url_overrides = {} } = manifest;
    if (Object.keys(chrome_url_overrides).length) return;

    const entryFile = files
      .filter((file) => matchSingleDeclarativeEntryFile(key, file))
      .map((file) => resolve(rootPath, srcDir, file))[0];

    if (entryFile) {
      manifest.chrome_url_overrides = {
        ...(manifest.chrome_url_overrides || {}),
        [key]: entryFile,
      };
    }
  };

  const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest }) => {
    const { chrome_url_overrides } = manifest || {};
    if (!chrome_url_overrides) return null;

    const entry: ManifestEntryInput = {};
    const input = chrome_url_overrides[key as keyof Manifest.WebExtensionManifestChromeUrlOverridesType];
    if (input) {
      entry[key] = {
        input: [input],
        entryType: 'html',
      };
    }
    return Object.keys(entry).length ? entry : null;
  };

  const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name }) => {
    const { chrome_url_overrides } = manifest;
    if (!chrome_url_overrides) return;

    const key = name as keyof Manifest.WebExtensionManifestChromeUrlOverridesType;
    if (chrome_url_overrides[key]) {
      chrome_url_overrides[key] = `${name}.html`;
    }
  };

  return {
    key,
    matchDeclarativeEntry,
    normalizeEntry,
    readEntry,
    writeEntry,
  } as ManifestEntryProcessor;
});

export default overrideProcessors;
