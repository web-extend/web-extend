import type { ManifestEntryInput, ManifestEntryProcessor, WebExtensionManifest } from './types.js';
import { getEntryFiles } from './util.js';

const key = 'sidepanel';
const pattern = [/^sidepanel([\\/]index)?\.(ts|tsx|js|jsx|mjs|cjs)$/];

const mergeSidepanelEntry: ManifestEntryProcessor['merge'] = async ({ manifest, srcPath, target, files }) => {
  const { side_panel, sidebar_action } = manifest;
  if (side_panel?.default_path || sidebar_action?.default_panel) {
    addSidepanelPermission(manifest);
    return;
  }

  const entryPath = getEntryFiles(srcPath, files, pattern);
  if (entryPath[0]) {
    if (target.includes('firefox')) {
      manifest.sidebar_action = {
        default_panel: entryPath[0],
        ...(sidebar_action || {}),
      };
      return;
    }

    manifest.side_panel = {
      default_path: entryPath[0],
      ...(side_panel || {}),
    };
    addSidepanelPermission(manifest);
  }
};

const readSidepanelEntry: ManifestEntryProcessor['read'] = (manifest) => {
  const { side_panel, sidebar_action } = manifest || {};
  const input = side_panel?.default_path || sidebar_action?.default_panel;
  if (!input) return null;

  const entry: ManifestEntryInput = {
    sidepanel: {
      input: [input],
      html: true,
    },
  };
  return entry;
};

const writeSidepanelEntry: ManifestEntryProcessor['write'] = ({ manifest, name }) => {
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
  match: (entryName) => entryName === 'sidepanel',
  merge: mergeSidepanelEntry,
  read: readSidepanelEntry,
  write: writeSidepanelEntry,
};

function addSidepanelPermission(manifest: WebExtensionManifest) {
  if (manifest.side_panel?.default_path && !manifest.permissions?.includes('sidePanel')) {
    manifest.permissions ??= [];
    manifest.permissions.push('sidePanel');
  }
}

export default sidepanelProcessor;
