import { resolve } from 'node:path';
import { isDevMode, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'background';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (file, context) => {
  const { entriesDir } = context;
  return matchSingleDeclarativeEntryFile(entriesDir.background, file);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, files, context }) => {
  const { rootPath, mode, target, runtime, entriesDir } = context;
  const { background } = manifest;
  const scripts: string[] = [];

  if (background?.service_worker) {
    scripts.push(background.service_worker);
  } else if (background?.scripts) {
    scripts.push(...background.scripts);
  } else {
    const entryFile = files
      .filter((file) => matchDeclarativeEntry(file, context))
      .map((file) => resolve(rootPath, entriesDir.root, file))[0];
    if (entryFile) {
      scripts.push(entryFile);
    }
  }
  if (isDevMode(mode) && runtime?.background) {
    scripts.push(runtime.background);
  }

  if (!scripts.length) return;

  manifest.background ??= {};
  // Firefox only supports background.scripts
  if (target.includes('firefox')) {
    manifest.background.scripts = scripts;
  } else {
    manifest.background.service_worker = scripts.join(',');
  }
};

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest }) => {
  const { background } = manifest || {};
  if (!background) return null;

  let input: string[] = [];
  if (background.service_worker) {
    input = background.service_worker.split(',');
  } else if (background.scripts) {
    input = background.scripts || [];
  }

  if (!input.length) return null;

  const entry: ManifestEntryInput = {
    background: {
      input,
      entryType: 'script',
    },
  };
  return entry;
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, output }) => {
  const { background } = manifest;
  const scripts = output?.filter((item) => item.endsWith('.js')) || [];
  if (!background || !scripts.length) return;

  if (background.scripts) {
    background.scripts = scripts;
  } else {
    background.service_worker = scripts[0];
  }
};

const backgroundProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  readEntry,
  writeEntry,
};

export default backgroundProcessor;
