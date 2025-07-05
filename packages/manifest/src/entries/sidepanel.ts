import { resolve } from 'node:path';
import { matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'sidepanel';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return matchSingleDeclarativeEntryFile(entriesDir.sidepanel, file);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, files }) => {
  const { rootPath, entriesDir } = context;
  const { side_panel, sidebar_action } = manifest;
  if (side_panel?.default_path || sidebar_action?.default_panel) {
    return;
  }

  const entryFile = files
    .filter((file) => matchDeclarativeEntry(file, context))
    .map((file) => resolve(rootPath, entriesDir.root, file))[0];
  if (entryFile) {
    manifest.side_panel = {
      default_path: entryFile,
    };
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest }) => {
  const { side_panel, sidebar_action } = manifest || {};
  const input = side_panel?.default_path || sidebar_action?.default_panel;
  if (!input) return null;

  const entry: ManifestEntryInput = {
    sidepanel: {
      input: [input],
      entryType: 'html',
    },
  };
  return entry;
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name }) => {
  const output = `${name}.html`;
  const { side_panel, sidebar_action } = manifest;
  if (side_panel) {
    side_panel.default_path = output;
  }
  if (sidebar_action) {
    sidebar_action.default_panel = output;
  }
};

const sidepanelProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  readEntry,
  writeEntry,
};

export default sidepanelProcessor;
