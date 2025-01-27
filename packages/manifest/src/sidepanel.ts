import { resolve } from 'node:path';
import { matchDeclarativeSingleEntryFile } from './common.js';
import type { ManifestEntryInput, ManifestEntryProcessor, WebExtensionManifest } from './types.js';

const key = 'sidepanel';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file);

const normalizeSidepanelEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, srcPath, target, files }) => {
  const { side_panel, sidebar_action } = manifest;
  if (side_panel?.default_path || sidebar_action?.default_panel) {
    addSidepanelPermission(manifest);
    return;
  }

  const entryPath = files.filter(matchDeclarativeEntryFile).map((file) => resolve(srcPath, file))[0];

  if (entryPath) {
    if (target.includes('firefox')) {
      manifest.sidebar_action = {
        default_panel: entryPath,
        ...(sidebar_action || {}),
      };
      return;
    }

    manifest.side_panel = {
      default_path: entryPath,
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

function addSidepanelPermission(manifest: WebExtensionManifest) {
  if (manifest.side_panel?.default_path && !manifest.permissions?.includes('sidePanel')) {
    manifest.permissions ??= [];
    manifest.permissions.push('sidePanel');
  }
}

const sidepanelProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  matchEntryName: (entryName) => entryName === key,
  normalize: normalizeSidepanelEntry,
  read: readSidepanelEntry,
  write: writeSidepanelEntry,
};

export default sidepanelProcessor;
