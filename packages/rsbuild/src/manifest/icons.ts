import { basename, resolve } from 'node:path';
import type { Manifest } from 'webextension-polyfill';
import type { ManifestEntryInput, ManifestEntryProcessor, WebExtensionManifest } from './types.js';

const key = 'icons';
const pattern = /^assets[\\/]icon-?(\d+)\.png$/;

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) => {
  const ext = '.png';
  if (pattern.test(file)) {
    return {
      key,
      name: basename(file, ext),
      ext,
    };
  }
  return null;
};

const getDeclarativeIcons = (files: string[], srcPath: string) => {
  const res: WebExtensionManifest['icons'] = {};
  for (const file of files) {
    const match = file.match(pattern);
    const size = match ? Number(match[1]) : null;
    if (size) {
      res[size] = resolve(srcPath, file);
    }
  }
  return Object.keys(res).length ? res : null;
};

const normalizeIconsEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, files, srcPath }) => {
  const declarativeIcons = getDeclarativeIcons(files, srcPath);
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
  matchDeclarativeEntryFile,
  matchEntryName: (entryName) => entryName.startsWith('icon'),
  normalize: normalizeIconsEntry,
  read: readIconsEntry,
  write: writeIconsEntry,
};

export default iconsProcessor;
