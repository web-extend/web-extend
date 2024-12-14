import type { ManifestEntry, ManifestEntryProcessor, PageToOverride } from './manifest.js';

const createMergeEntry = (key: PageToOverride): ManifestEntryProcessor['merge'] => {
  return ({ manifest, entryPath }) => {
    const item = manifest.chrome_url_overrides?.[key];
    if (item || !entryPath.length) return;

    manifest.chrome_url_overrides ??= {};
    manifest.chrome_url_overrides[key] = entryPath[0];
  };
};

const createGetEntry = (key: PageToOverride): ManifestEntryProcessor['read'] => {
  return (manifest) => {
    const item = manifest?.chrome_url_overrides?.[key];
    if (!item) return null;
    const entry: ManifestEntry = {};
    entry[key] = {
      import: item,
      html: true,
    };
    return entry;
  };
};

const createWriteEntry = (key: PageToOverride): ManifestEntryProcessor['write'] => {
  return ({ manifest, entryName }) => {
    const filename = `${entryName}.html`;
    const { chrome_url_overrides } = manifest;
    if (chrome_url_overrides) {
      chrome_url_overrides[key] = filename;
    }
  };
};

const overrides: PageToOverride[] = ['newtab', 'history', 'bookmarks'];
const overrideProcessors: ManifestEntryProcessor[] = overrides.map((key) => ({
  key,
  match: (entryName) => entryName === key,
  merge: createMergeEntry(key),
  read: createGetEntry(key),
  write: createWriteEntry(key),
}));

export default overrideProcessors;
