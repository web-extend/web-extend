import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';
import { getMultipleEntryFiles, getSingleEntryFile } from './util.js';

const key = 'sandbox';

const normalizeSandboxEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, srcPath, target, files }) => {
  const pages = manifest.sandbox?.pages;
  if (pages?.length || target.includes('firefox')) return;

  const entryPath: string[] = [];
  const singleEntry = await getSingleEntryFile(key, files, srcPath);
  if (singleEntry) {
    entryPath.push(singleEntry);
  }
  const multipleEntry = await getMultipleEntryFiles('sandboxes', files, srcPath);
  if (multipleEntry.length) {
    entryPath.push(...multipleEntry);
  }

  if (entryPath.length) {
    manifest.sandbox = {
      ...(manifest.sandbox || {}),
      pages: entryPath,
    };
  }
};

const readSandboxEntry: ManifestEntryProcessor['read'] = (manifest) => {
  const pages = manifest?.sandbox?.pages || [];
  if (!pages.length) return null;

  const entry: ManifestEntryInput = {};
  pages.forEach((page, index) => {
    const name = `sandbox${pages.length === 1 ? '' : index}`;
    entry[name] = {
      input: [page],
      html: true,
    };
  });
  return entry;
};

const writeSandboxEntry: ManifestEntryProcessor['write'] = ({ manifest, name }) => {
  const pages = manifest?.sandbox?.pages || [];
  if (!pages.length) return;

  const index = Number(name.replace('sandbox', '') || '0');
  if (pages[index]) {
    pages[index] = `${name}.html`;
  }
};

const sandboxProcessor: ManifestEntryProcessor = {
  key,
  match: (entryName) => entryName.startsWith(key),
  normalize: normalizeSandboxEntry,
  read: readSandboxEntry,
  write: writeSandboxEntry,
};

export default sandboxProcessor;
