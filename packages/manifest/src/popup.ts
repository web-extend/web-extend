import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { matchDeclarativeSingleEntryFile } from './common.js';
import { parseExportObject } from './parser/export.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'popup';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file);

const normalizePopupEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, context, files }) => {
  const { rootPath, srcDir } = context;
  const { manifest_version } = manifest;

  const entryPath = files.filter(matchDeclarativeEntryFile).map((file) => resolve(rootPath, srcDir, file))[0];

  if (entryPath) {
    if (manifest_version === 2) {
      manifest.browser_action ??= {};
      manifest.browser_action.default_popup ??= entryPath;
      return;
    }

    manifest.action ??= {};
    manifest.action.default_popup ??= entryPath;
  }
};

const readPopupEntry: ManifestEntryProcessor['read'] = ({ manifest }) => {
  const { manifest_version, action, browser_action } = manifest || {};
  const pointer = manifest_version === 2 ? browser_action : action;
  const input = pointer?.default_popup;
  if (!input) return null;

  const entry: ManifestEntryInput = {
    popup: {
      input: [input],
      html: true,
    },
  };
  return entry;
};

const writePopupEntry: ManifestEntryProcessor['write'] = async ({ manifest, rootPath, name, input }) => {
  const { manifest_version, action, browser_action } = manifest;
  const pointer = manifest_version === 2 ? browser_action : action;
  if (!pointer) return;

  pointer.default_popup = `${name}.html`;

  const { default_title } = pointer;
  const entryMain = input?.[0];
  const entryManinPath = resolve(rootPath, entryMain || '');
  if (!default_title && entryMain && existsSync(entryManinPath)) {
    const code = await readFile(entryManinPath, 'utf-8');
    const title = parseExportObject<string>(code, 'title');
    if (title) {
      pointer.default_title = title;
    }
  }
};

const popupProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  matchEntryName: (entryName) => entryName === key,
  normalize: normalizePopupEntry,
  read: readPopupEntry,
  write: writePopupEntry,
};

export default popupProcessor;
