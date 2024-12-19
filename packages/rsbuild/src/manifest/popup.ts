import { parseExportObject } from './parser/export.js';
import type { ManifestEntry, ManifestEntryProcessor } from './types.js';
import { getFileContent, getSingleEntryFile } from './util.js';

const mergePopupEntry: ManifestEntryProcessor['merge'] = async ({ manifest, rootPath, srcDir, files }) => {
  const { manifest_version } = manifest;

  const entryPath = await getSingleEntryFile(rootPath, srcDir, files, 'popup');
  if (!entryPath) return;

  if (manifest_version === 2) {
    manifest.browser_action ??= {};
    manifest.browser_action.default_popup ??= entryPath;
    return;
  }

  manifest.action ??= {};
  manifest.action.default_popup ??= entryPath;
};

const readPopupEntry: ManifestEntryProcessor['read'] = (manifest) => {
  const { manifest_version, action, browser_action } = manifest || {};
  const pointer = manifest_version === 2 ? browser_action : action;
  const input = pointer?.default_popup;
  if (!input) return null;

  const entry: ManifestEntry = {
    popup: {
      import: input,
      html: true,
    },
  };
  return entry;
};

const writePopupEntry: ManifestEntryProcessor['write'] = async ({ manifest, entryName, entryPath, rootPath }) => {
  const { manifest_version, action, browser_action } = manifest;
  const pointer = manifest_version === 2 ? browser_action : action;
  if (!pointer) return;

  const { default_title } = pointer;
  const input = Array.isArray(entryPath) ? entryPath[0] : entryPath;
  if (!default_title && input) {
    const code = await getFileContent(rootPath, input);
    const title = parseExportObject<string>(code, 'title');
    if (title) {
      pointer.default_title = title;
    }
  }

  const popup = `${entryName}.html`;
  pointer.default_popup = popup;
};

const popupProcessor: ManifestEntryProcessor = {
  key: 'popup',
  match: (entryName) => entryName === 'popup',
  merge: mergePopupEntry,
  read: readPopupEntry,
  write: writePopupEntry,
};

export default popupProcessor;
