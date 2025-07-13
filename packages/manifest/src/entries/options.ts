import { getSingleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor } from '../types.js';

const key = 'options';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchSingleDeclarativeEntryFile(filePath, key, context);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  const { options_ui, options_page } = manifest;
  let input = options_ui?.page || options_page;

  if (!input) {
    const result = await getSingleDeclarativeEntryFile(key, context);
    if (result[0]) {
      input = result[0].path;
      manifest.options_ui = {
        open_in_tab: true,
        ...(options_ui || {}),
        page: input,
      };
    }
  }

  if (input) {
    entries[key] = {
      name: key,
      input: [input],
      type: 'html',
    };
  }
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name }) => {
  const output = `${name}.html`;
  if (manifest.options_page) {
    manifest.options_page = output;
  }
  if (manifest.options_ui) {
    manifest.options_ui.page = output;
  }
};

const optionsProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  writeEntry,
};

export default optionsProcessor;
