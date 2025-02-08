import { basename, resolve } from 'node:path';
import type { Manifest } from 'webextension-polyfill';
import type { ManifestEntryProcessor, WebExtensionManifest } from './types.js';

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

const normalizeIconsEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, files, context }) => {
  const { rootPath, srcDir } = context;
  const declarativeIcons = getDeclarativeIcons(files, resolve(rootPath, srcDir));
  if (!declarativeIcons) return;

  if (!manifest.icons) {
    manifest.icons = {
      ...declarativeIcons,
    };
  }

  const { manifest_version } = manifest;
  let pointer: Manifest.ActionManifest | undefined = undefined;
  if (manifest_version === 2) {
    manifest.browser_action ??= {};
    pointer = manifest.browser_action;
  } else {
    manifest.action ??= {};
    pointer = manifest.action;
  }

  if (!pointer.default_icon) {
    pointer.default_icon = {
      ...declarativeIcons,
    };
  }
};

const readIconsEntry: ManifestEntryProcessor['read'] = ({ manifest }) => {
  const { icons, action, browser_action, manifest_version } = manifest || {};
  const pointer = manifest_version === 2 ? browser_action : action;
  const files = new Set<string>();
  function helper(icons?: WebExtensionManifest['icons']) {
    if (!icons) return;
    for (const size in icons) {
      files.add(icons[size]);
    }
  }

  helper(icons);

  if (typeof pointer?.default_icon === 'string') {
    files.add(pointer.default_icon);
  } else {
    helper(pointer?.default_icon);
  }

  return files.size
    ? {
        [key]: {
          input: Array.from(files),
          html: false,
        },
      }
    : null;
};

const getIconOutputName = (input: string, output: string[]) => {
  const name = basename(input).split('.')[0];
  return output.find((item) => item.endsWith('.png') && basename(item).split('.')[0] === name);
};

const writeIconsEntry: ManifestEntryProcessor['write'] = ({ manifest, output }) => {
  if (!output?.length) return;

  function helper(icons: WebExtensionManifest['icons']) {
    if (!icons) return;
    for (const size in icons) {
      const res = getIconOutputName(icons[size], output || []);
      if (res) {
        icons[size] = res;
      } else {
        delete icons[size];
      }
    }
  }

  const { icons, action, browser_action, manifest_version } = manifest;
  const pointer = manifest_version === 2 ? browser_action : action;

  if (icons) {
    helper(icons);
  }

  if (typeof pointer?.default_icon === 'string') {
    pointer.default_icon = getIconOutputName(pointer.default_icon, output || []);
  } else if (typeof pointer?.default_icon === 'object') {
    helper(pointer.default_icon);
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
