import { resolve } from 'node:path';
import type { Manifest } from 'webextension-polyfill';
import { isDevMode } from './env.js';
import type { ManifestEntryInput, ManifestEntryProcessor, WebExtensionManifest } from './types.js';
import { getSingleEntryFile } from './util.js';

const key = 'background';

const normalizeBackgroundEntry: ManifestEntryProcessor['normalize'] = async ({
  manifest,
  target,
  mode,
  selfRootPath,
  files,
  srcPath,
}) => {
  const { background } = manifest;
  const scripts: string[] = [];

  if (background && 'service_worker' in background) {
    scripts.push(background.service_worker);
  } else if (background && 'scripts' in background && background.scripts) {
    scripts.push(...background.scripts);
  } else {
    const entryPath = await getSingleEntryFile(srcPath, files, key);
    if (entryPath) {
      scripts.push(entryPath);
    }
  }

  if (isDevMode(mode)) {
    scripts.push(resolve(selfRootPath, 'static/background_runtime.js'));
  }

  if (!scripts.length) return;
  manifest.background ??= {} as WebExtensionManifest['background'];
  // Firefox only supports background.scripts
  if (target.includes('firefox')) {
    (manifest.background as Manifest.WebExtensionManifestBackgroundC2Type).scripts = scripts;
  } else {
    (manifest.background as Manifest.WebExtensionManifestBackgroundC3Type).service_worker = scripts.join(',');
  }
};

const readBackgroundEntry: ManifestEntryProcessor['read'] = (manifest) => {
  const { background } = manifest || {};
  if (!background) return null;

  let input: string[] = [];
  if ('service_worker' in background) {
    input = background.service_worker.split(',');
  } else if ('scripts' in background) {
    input = background.scripts || [];
  }

  if (!input.length) return null;
  const entry: ManifestEntryInput = {
    background: {
      input,
      html: false,
    },
  };
  return entry;
};

const writeBackgroundEntry: ManifestEntryProcessor['write'] = ({ manifest, output }) => {
  const { background } = manifest;
  const scripts = output?.filter((item) => item.endsWith('.js')) || [];
  if (!background || !scripts.length) return;

  if ('scripts' in background) {
    background.scripts = scripts;
  } else {
    (background as Manifest.WebExtensionManifestBackgroundC3Type).service_worker = scripts[0];
  }
};

const backgroundProcessor: ManifestEntryProcessor = {
  key,
  match: (entryName) => entryName === key,
  normalize: normalizeBackgroundEntry,
  read: readBackgroundEntry,
  write: writeBackgroundEntry,
};

export default backgroundProcessor;
