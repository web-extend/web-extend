import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getEntryName, matchMultipleDeclarativeEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'scripting';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file) =>
  matchMultipleDeclarativeEntryFile('scripting', file, ['script', 'style']);

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, files, context }) => {
  const { srcDir, rootPath } = context;
  const srcPath = resolve(rootPath, srcDir);

  const entryFile = files.filter(matchDeclarativeEntry).map((file) => resolve(srcPath, file));
  // add permissions for scripting
  if (entryFile.length) {
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

  const { rootPath, srcDir } = context;
  const srcPath = resolve(rootPath, srcDir);
  const scriptingPath = resolve(srcPath, 'scripting');

  if (!existsSync(scriptingPath)) {
    return null;
  }

  const files = await readdir(scriptingPath, { recursive: true });
  const scripting = files
    .map((file) => join('scripting', file))
    .filter(matchDeclarativeEntry)
    .map((file) => resolve(srcPath, file));

  for (const file of scripting) {
    const name = getEntryName(file, rootPath, srcDir);
    if (name) {
      entry[name] = {
        input: [file],
        entryType: file.endsWith('css') ? 'style' : 'script',
      };
    }
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
