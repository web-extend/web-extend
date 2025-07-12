import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';
import type { ExtensionManifest, ManifestEntryProcessor } from '../types.js';

const key = 'icons';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  const { rootPath, entriesDir } = context;
  const entryDir = resolve(rootPath, entriesDir.root, entriesDir.icons);
  if (!filePath.startsWith(entryDir)) return null;

  const file = relative(entryDir, filePath);
  const ext = '.png';
  const match = file.match(/icon-?(\d+)\.png$/);
  const size = match ? Number(match[1]) : null;
  if (size) {
    return {
      name: basename(filePath, ext),
      ext,
      size,
    };
  }
  return null;
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context }) => {
  const { rootPath, entriesDir } = context;

  const iconsPath = resolve(rootPath, entriesDir.root, entriesDir.icons);
  if (!existsSync(iconsPath)) return;

  const files = await readdir(iconsPath);
  const declarativeIcons: ExtensionManifest['icons'] = {};
  for (const file of files) {
    const filePath = resolve(iconsPath, file);
    const size = matchDeclarativeEntry(filePath, context)?.size || null;
    if (size) {
      declarativeIcons[size] = filePath;
    }
  }
  if (!Object.keys(declarativeIcons).length) return;

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

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest, context }) => {
  const { icons, action, browser_action } = manifest || {};
  const { rootPath } = context;
  const pointer = action || browser_action;
  const files = new Set<string>();

  function helper(icons?: ExtensionManifest['icons']) {
    if (!icons) return;
    for (const size in icons) {
      const file = icons[size];
      const isPublicFile = file.startsWith('/') && !file.startsWith(rootPath);
      if (isPublicFile) continue;
      files.add(file);
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

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, output, context }) => {
  if (!output?.length) return;

  const { rootPath } = context;

  function helper(icons: ExtensionManifest['icons']) {
    if (!icons) return;
    for (const size in icons) {
      const file = icons[size];
      const isPublicFile = file.startsWith('/') && !file.startsWith(rootPath);
      if (isPublicFile) continue;
      const res = getIconOutputName(file, output || []);
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
  matchDeclarativeEntry,
  normalizeEntry,
  readEntry,
  writeEntry,
};

export default iconsProcessor;
