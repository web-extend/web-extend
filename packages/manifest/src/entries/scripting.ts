import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getMultipleDeclarativeEntryFile, matchMultipleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor, WebExtendEntryInput } from '../types.js';

const key = 'scripting';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchMultipleDeclarativeEntryFile(filePath, key, context, ['script', 'style']);
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
  const entry: WebExtendEntryInput[] = [];

  const result = await getMultipleDeclarativeEntryFile(key, context, ['script', 'style']);

  for (const item of result) {
    entry.push({
      name: item.name,
      input: [item.path],
      type: item.path.endsWith('css') ? 'style' : 'script',
    });
  }

  return entry.length ? entry : null;
};

const processor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  readEntry,
};

export default processor;
