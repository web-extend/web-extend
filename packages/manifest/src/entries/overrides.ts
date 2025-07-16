import { getSingleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestChromeUrlOverrides, ManifestEntryProcessor } from '../types.js';

const overrides = ['newtab', 'history', 'bookmarks'] as const;

const overrideProcessors = overrides.map((key) => {
  const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
    return matchSingleDeclarativeEntryFile(filePath, key, context);
  };

  const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
    const { chrome_url_overrides = {} } = manifest;
    let input = chrome_url_overrides[key as keyof ManifestChromeUrlOverrides];

    if (!input) {
      const result = await getSingleDeclarativeEntryFile(key, context);
      if (result[0]) {
        input = result[0].path;
        manifest.chrome_url_overrides = {
          ...chrome_url_overrides,
          [key]: input,
        };
      }
    }

    if (input) {
      entries[key] = {
        name: key,
        import: [input],
        type: 'html',
      };
    }
  };

  const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name }) => {
    const { chrome_url_overrides = {} } = manifest;
    if (chrome_url_overrides[key]) {
      chrome_url_overrides[key] = `${name}.html`;
    }
  };

  return {
    key,
    matchDeclarativeEntry,
    normalizeEntry,
    writeEntry,
  } as ManifestEntryProcessor;
});

export default overrideProcessors;
