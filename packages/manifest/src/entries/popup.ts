import { resolve } from 'node:path';
import { matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'popup';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return matchSingleDeclarativeEntryFile(entriesDir.popup, file);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, files }) => {
  const { rootPath, srcDir } = context;
  const { action, browser_action } = manifest;
  let pointer = action || browser_action;

  if (pointer?.default_popup) return;

  const entryFile = files
    .filter((file) => matchDeclarativeEntry(file, context))
    .map((file) => resolve(rootPath, srcDir, file))[0];
  if (entryFile) {
    if (!pointer) {
      pointer = manifest.action = {};
    }
    pointer.default_popup ??= entryFile;
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest }) => {
  const { action, browser_action } = manifest || {};
  const pointer = action || browser_action;
  const input = pointer?.default_popup;
  if (!input) return null;

  const entry: ManifestEntryInput = {
    popup: {
      input: [input],
      entryType: 'html',
    },
  };
  return entry;
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = async ({ manifest, name }) => {
  const { action, browser_action } = manifest;
  const pointer = action || browser_action;
  if (!pointer) return;

  pointer.default_popup = `${name}.html`;

  // const { default_title } = pointer;
  // const entryMain = input?.[0];
  // const entryManinPath = resolve(rootPath, entryMain || '');
  // if (!default_title && entryMain && existsSync(entryManinPath)) {
  //   const code = await readFile(entryManinPath, 'utf-8');
  //   const title = parseExportObject<string>(code, 'title');
  //   if (title) {
  //     pointer.default_title = title;
  //   }
  // }
};

const popupProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  readEntry,
  writeEntry,
};

export default popupProcessor;
