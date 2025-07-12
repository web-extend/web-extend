import { getSingleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor } from '../types.js';

const key = 'popup';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchSingleDeclarativeEntryFile(filePath, key, context);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context }) => {
  const { action, browser_action } = manifest;
  let pointer = action || browser_action;

  if (pointer?.default_popup) return;

  const result = await getSingleDeclarativeEntryFile(key, context);
  if (result[0]) {
    if (!pointer) {
      pointer = manifest.action = {};
    }
    pointer.default_popup ??= result[0].path;
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest }) => {
  const { action, browser_action } = manifest || {};
  const pointer = action || browser_action;
  const input = pointer?.default_popup;
  if (!input) return null;

  return {
    name: key,
    input: [input],
    type: 'html',
  };
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
