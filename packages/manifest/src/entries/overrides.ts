import { getSingleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from '../common.js';
import type {
  ManifestChromeUrlOverrides,
  ManifestEntryInput,
  ManifestEntryProcessor,
  WebExtendEntryKey,
} from '../types.js';

const overrides: WebExtendEntryKey[] = ['newtab', 'history', 'bookmarks'];

const overrideProcessors = overrides.map((key) => {
  const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
    return matchSingleDeclarativeEntryFile(filePath, key, context);
  };

  const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context }) => {
    const { chrome_url_overrides = {} } = manifest;
    if (Object.keys(chrome_url_overrides).length) return;

    const result = await getSingleDeclarativeEntryFile(key, context);
    if (result[0]) {
      manifest.chrome_url_overrides = {
        ...(manifest.chrome_url_overrides || {}),
        [key]: result[0].path,
      };
    }
  };

  const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest }) => {
    const { chrome_url_overrides } = manifest || {};
    if (!chrome_url_overrides) return null;

    const entry: ManifestEntryInput = {};
    const input = chrome_url_overrides[key as keyof ManifestChromeUrlOverrides];
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

    const key = name as keyof ManifestChromeUrlOverrides;
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
