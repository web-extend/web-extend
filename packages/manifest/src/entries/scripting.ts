import { getMultipleDeclarativeEntryFile, isStyleFile, matchMultipleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor, WebExtendEntryDescription } from '../types.js';

const key = 'scripting';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchMultipleDeclarativeEntryFile(filePath, key, context, ['script', 'style']);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  const result = await getMultipleDeclarativeEntryFile(key, context, ['script', 'style']);
  const entry: WebExtendEntryDescription[] = [];

  for (const item of result) {
    entry.push({
      name: item.name,
      import: [item.path],
      type: isStyleFile(item.path) ? 'style' : 'script',
    });
  }

  if (entry.length) {
    entries[key] = entry;

    // add permissions for scripting
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

const processor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
};

export default processor;
