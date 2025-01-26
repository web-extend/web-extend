import { basename, resolve } from 'node:path';
import type { Manifest } from 'webextension-polyfill';
import type { ManifestEntryInput, ManifestEntryProcessor, WebExtensionManifest } from './types.js';

const key = 'icons';

const matchDeclarativeEntryFile = (file: string) => {
  const ext = '.png';
  const match = file.match(/^assets[\\/]icon-?(\d+)\.png$/);
  const size = match ? Number(match[1]) : null;
  if (size) {
    return {
      name: basename(file, ext),
      ext,
      size,
    };
  }
  return null;
};

const getDeclarativeIcons = (files: string[], srcPath: string) => {
  const res: WebExtensionManifest['icons'] = {};
  for (const file of files) {
    const size = matchDeclarativeEntryFile(file)?.size || null;
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
    for (const size in icons) {
      const entryName = `${key}-${size}`;
      entry[entryName] = {
        html: false,
        input: [icons[size]],
      };
    }
  }

  helper(icons);

  if (typeof pointer?.default_icon === 'string') {
    entry[`${key}-default`] = {
      html: false,
      input: [pointer.default_icon],
    };
  } else {
    helper(pointer?.default_icon);
  }

  return Object.keys(entry).length ? entry : null;
};

const writeIconsEntry: ManifestEntryProcessor['write'] = ({ manifest, output, name }) => {
  const file = output?.find((item) => item.endsWith('.png'));
  if (!file) return;

  const { icons, action, browser_action, manifest_version } = manifest;
  const pointer = manifest_version === 2 ? browser_action : action;

  if (name === `${key}-default`) {
    if (pointer) {
      pointer.default_icon = file;
    }
    return;
  }

  const size = Number(name.replace(`${key}-`, ''));
  if (size) {
    if (icons) {
      icons[size] = file;
    }
    if (typeof pointer?.default_icon === 'object') {
      pointer.default_icon[size] = file;
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
