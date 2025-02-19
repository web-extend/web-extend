import { resolve } from 'node:path';
import { matchDeclarativeSingleEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'options';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file);

const normalizeOptionsEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, context, files }) => {
  const { rootPath, srcDir } = context;
  const { options_ui, options_page } = manifest;
  if (options_ui?.page || options_page) return;

  const entryPath = files
    .filter((file) => matchDeclarativeEntryFile(file))
    .map((file) => resolve(rootPath, srcDir, file))[0];

  if (entryPath) {
    manifest.options_ui = {
      open_in_tab: true,
      ...(options_ui || {}),
      page: entryPath,
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
      html: true,
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
  matchDeclarativeEntryFile,
  normalize: normalizeOptionsEntry,
  readEntry,
  writeEntry,
};

export default optionsProcessor;
