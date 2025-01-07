import type { Manifest } from 'webextension-polyfill';
import type { ManifestEntryInput, ManifestEntryProcessor, WebExtensionManifest } from './types.js';
import { getAssetFiles } from './util.js';

const key = 'icons';

const getDeclarativeIcons = (assetFiles: string[]) => {
  const res: WebExtensionManifest['icons'] = {};
  for (const filePath of assetFiles) {
    const match = filePath.match(/icon-?(\d+)\.png$/);
    const size = match ? Number(match[1]) : null;
    if (size) {
      res[size] = filePath;
    }
  }
  return Object.keys(res).length ? res : null;
};

const mergeIconsEntry: ManifestEntryProcessor['merge'] = async ({ manifest, files, srcPath }) => {
  const assetFiles = await getAssetFiles(srcPath, files);
  const declarativeIcons = getDeclarativeIcons(assetFiles);
  if (!declarativeIcons) return;

  manifest.icons = {
    ...declarativeIcons,
    ...(manifest.icons || {}),
  };

  const { manifest_version } = manifest;
  let pointer: Manifest.ActionManifest | undefined = undefined;
  if (manifest_version === 2) {
    manifest.browser_action ??= {};
    pointer = manifest.browser_action;
  } else {
    manifest.action ??= {};
    pointer = manifest.action;
  }

  if (typeof pointer.default_icon !== 'string') {
    pointer.default_icon = {
      ...declarativeIcons,
      ...(pointer.default_icon || {}),
    };
  }
};

const readIconsEntry: ManifestEntryProcessor['read'] = (manifest) => {
  const { icons, action, browser_action, manifest_version } = manifest || {};
  const pointer = manifest_version === 2 ? browser_action : action;
  const entry: ManifestEntryInput = {};

  function helper(icons?: WebExtensionManifest['icons']) {
    if (!icons) return;
    for (const key in icons) {
      const entryName = `icon${key}`;
      entry[entryName] = {
        html: false,
        input: [icons[key]],
      };
    }
  }

  helper(icons);

  if (typeof pointer?.default_icon === 'string') {
    entry.icon_default = {
      html: false,
      input: [pointer.default_icon],
    };
  } else {
    helper(pointer?.default_icon);
  }

  return Object.keys(entry).length ? entry : null;
};

const writeIconsEntry: ManifestEntryProcessor['write'] = ({ manifest, output, name }) => {
  if (!output?.length) return;

  const { icons, action, browser_action, manifest_version } = manifest;
  const pointer = manifest_version === 2 ? browser_action : action;

  if (name === 'icon_default') {
    if (pointer) {
      pointer.default_icon = output[0];
    }
    return;
  }

  const size = Number(name.replace('icon', ''));
  if (size) {
    if (icons) {
      icons[size] = output[0];
    }
    if (typeof pointer?.default_icon === 'object') {
      pointer.default_icon[size] = output[0];
    }
  }
};

const iconsProcessor: ManifestEntryProcessor = {
  key,
  match: (entryName) => entryName.startsWith('icon'),
  merge: mergeIconsEntry,
  read: readIconsEntry,
  write: writeIconsEntry,
};

export default iconsProcessor;
