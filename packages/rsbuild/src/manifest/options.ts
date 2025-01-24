import type { ManifestEntryInput, ManifestEntryProcessor } from './types.js';
import { getSingleEntryFile } from './util.js';

const key = 'options';

const normalizeOptionsEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, srcPath, files }) => {
  const { options_ui, options_page } = manifest;
  if (options_ui?.page || options_page) return;

  const entryPath = await getSingleEntryFile(key, files, srcPath);
  if (entryPath) {
    manifest.options_ui = {
      open_in_tab: true,
      ...(options_ui || {}),
      page: entryPath,
    };
  }
};

const readOptionsEntry: ManifestEntryProcessor['read'] = (manifest) => {
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

const writeOptionsEntry: ManifestEntryProcessor['write'] = ({ manifest, name }) => {
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
  match: (entryName) => entryName === 'options',
  normalize: normalizeOptionsEntry,
  read: readOptionsEntry,
  write: writeOptionsEntry,
};

export default optionsProcessor;
