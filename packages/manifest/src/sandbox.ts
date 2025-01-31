import { resolve } from 'node:path';
import { matchDeclarativeMultipleEntryFile, matchDeclarativeSingleEntryFile, getEntryFileName } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'sandbox';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file) || matchDeclarativeMultipleEntryFile('sandboxes', file);

const normalizeSandboxEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, files, context }) => {
  const { srcDir, rootPath, target } = context;
  const srcPath = resolve(rootPath, srcDir);
  const pages = manifest.sandbox?.pages;
  if (pages?.length || target.includes('firefox')) return;

  const entryPath = files.filter(matchDeclarativeEntryFile).map((file) => resolve(srcPath, file));
  if (entryPath.length) {
    manifest.sandbox = {
      ...(manifest.sandbox || {}),
      pages: entryPath,
    };
  }
};

const readSandboxEntry: ManifestEntryProcessor['read'] = ({ manifest, context }) => {
  const pages = manifest?.sandbox?.pages || [];
  if (!pages.length) return null;

  const entry: ManifestEntryInput = {};
  pages.forEach((page) => {
    // const name = `sandbox${pages.length === 1 ? '' : index}`;
    const name = getEntryFileName(page, context.rootPath, context.srcDir);
    entry[name] = {
      input: [page],
      html: true,
    };
  });
  return entry;
};

const writeSandboxEntry: ManifestEntryProcessor['write'] = ({ manifest, name, normalizedManifest, context }) => {
  const pages = manifest?.sandbox?.pages || [];
  if (!pages.length) return;
  const index = (normalizedManifest.sandbox?.pages || []).findIndex((file) =>
    getEntryFileName(file, context.rootPath, context.srcDir),
  );
  if (index === -1) return;

  // const index = Number(name.replace('sandbox', '') || '0');
  if (pages[index]) {
    pages[index] = `${name}.html`;
  }
};

const sandboxProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  matchEntryName: (entryName) => entryName.startsWith(key),
  normalize: normalizeSandboxEntry,
  read: readSandboxEntry,
  write: writeSandboxEntry,
};

export default sandboxProcessor;
