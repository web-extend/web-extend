import { getSingleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor } from '../types.js';

const key = 'sidepanel';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchSingleDeclarativeEntryFile(filePath, key, context);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  const { side_panel, sidebar_action } = manifest;
  let input = side_panel?.default_path || sidebar_action?.default_panel;

  if (!input) {
    const result = await getSingleDeclarativeEntryFile(key, context);
    if (result[0]) {
      input = result[0].path;
      manifest.side_panel = {
        default_path: input,
      };
    }
  }

  if (input) {
    entries[key] = {
      name: key,
      import: [input],
      type: 'html',
    };
  }
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
  writeEntry,
};

export default sidepanelProcessor;
