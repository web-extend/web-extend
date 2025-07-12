import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getMultipleDeclarativeEntryFile, matchMultipleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'scripting';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchMultipleDeclarativeEntryFile(key, filePath, context, ['script', 'style']);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context }) => {
  const { rootPath, entriesDir } = context;
  const entryDir = resolve(rootPath, entriesDir.root, entriesDir.scripting);

  // add permissions for scripting
  if (existsSync(entryDir)) {
    const permissions = manifest.permissions || [];
    if (!permissions.includes('scripting')) {
      permissions.push('scripting');
    }
    if (!manifest.host_permissions && !permissions.includes('activeTab')) {
      permissions.push('activeTab');
    }
    manifest.permissions = permissions;
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = async ({ context }) => {
  const entry: ManifestEntryInput = {};

  const { rootPath, entriesDir } = context;
  const result = await getMultipleDeclarativeEntryFile(resolve(rootPath, entriesDir.root, entriesDir.scripting), [
    'script',
    'style',
  ]);

  for (const item of result) {
    entry[item.name] = {
      input: [item.path],
      entryType: item.path.endsWith('css') ? 'style' : 'script',
    };
  }

  return Object.keys(entry).length ? entry : null;
};

const processor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  readEntry,
};

export default processor;
