import { basename, resolve } from 'node:path';
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

  const { action, browser_action } = manifest;
  let pointer = action || browser_action;
  if (!pointer?.default_icon) {
    if (!pointer) {
      pointer = manifest.action = {};
    }
    pointer.default_icon = {
      ...declarativeIcons,
    };
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest }) => {
  const { icons, action, browser_action } = manifest || {};
  const pointer = action || browser_action;
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
          entryType: 'image',
        },
      }
    : null;
};

const getIconOutputName = (input: string, output: string[]) => {
  const name = basename(input).split('.')[0];
  return output.find((item) => item.endsWith('.png') && basename(item).split('.')[0] === name);
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, output }) => {
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

  const { icons, action, browser_action } = manifest;
  const pointer = action || browser_action;

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
  normalize: normalizeIconsEntry,
  readEntry,
  writeEntry,
};

export default iconsProcessor;
