import { resolve } from 'node:path';
import type { Manifest } from 'webextension-polyfill';
import { matchDeclarativeSingleEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor, PageToOverride } from './types.js';

const overrides: PageToOverride[] = ['newtab', 'history', 'bookmarks'];

const overrideProcessors = overrides.map((key) => {
  const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
    matchDeclarativeSingleEntryFile(key, file);

  const normalizeOverridesEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, context, files }) => {
    const { rootPath, srcDir } = context;
    const { chrome_url_overrides = {} } = manifest;
    if (Object.keys(chrome_url_overrides).length) return;

    const entryPath = files
      .filter((file) => matchDeclarativeSingleEntryFile(key, file))
      .map((file) => resolve(rootPath, srcDir, file))[0];

    if (entryPath) {
      manifest.chrome_url_overrides = {
        ...(manifest.chrome_url_overrides || {}),
        [key]: entryPath,
      };
    }
  };

  const readOverridesEntry: ManifestEntryProcessor['read'] = ({ manifest }) => {
    const { chrome_url_overrides } = manifest || {};
    if (!chrome_url_overrides) return null;

    const entry: ManifestEntryInput = {};
    const input = chrome_url_overrides[key as keyof Manifest.WebExtensionManifestChromeUrlOverridesType];
    if (input) {
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

  return {
    key,
    matchDeclarativeEntryFile,
    matchEntryName: (entryName) => entryName === key,
    normalize: normalizeOverridesEntry,
    read: readOverridesEntry,
    write: writeOverridesEntry,
  } as ManifestEntryProcessor;
});

export default overrideProcessors;
