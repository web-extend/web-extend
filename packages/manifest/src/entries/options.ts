import { resolve } from 'node:path';
import { matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'options';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return matchSingleDeclarativeEntryFile(entriesDir.options, file);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, files }) => {
  const { rootPath, srcDir } = context;
  const { options_ui, options_page } = manifest;
  if (options_ui?.page || options_page) return;

  const entryFile = files
    .filter((file) => matchDeclarativeEntry(file, context))
    .map((file) => resolve(rootPath, srcDir, file))[0];

  if (entryFile) {
    manifest.options_ui = {
      open_in_tab: true,
      ...(options_ui || {}),
      page: entryFile,
    };
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest }) => {
  const { options_ui, options_page } = manifest || {};
  const input = options_ui?.page || options_page;
  if (!input) return null;

  const entry: ManifestEntryInput = {
    options: {
      input: [input],
      entryType: 'html',
    },
  };
  return entry;
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
  readEntry,
  writeEntry,
};

export default optionsProcessor;
