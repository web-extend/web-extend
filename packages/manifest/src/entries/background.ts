import { basename, dirname, relative, resolve } from 'node:path';
import { getSingleDeclarativeEntryFile, isDevMode, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryInput, ManifestEntryProcessor } from '../types.js';

const key = 'background';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  const { rootPath, entriesDir } = context;
  const entryDir = resolve(rootPath, entriesDir.root, entriesDir.background);

  if (filePath.startsWith(entryDir)) {
    const entryName = basename(entryDir);
    const file = relative(dirname(entryDir), filePath);
    return matchSingleDeclarativeEntryFile(entryName, file);
  }

  return null;
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context }) => {
  const { rootPath, mode, target, runtime, entriesDir } = context;
  const { background } = manifest;
  const scripts: string[] = [];

  if (background?.service_worker) {
    scripts.push(background.service_worker);
  } else if (background?.scripts) {
    scripts.push(...background.scripts);
  } else {
    const result = await getSingleDeclarativeEntryFile(resolve(rootPath, entriesDir.root, entriesDir.background));
    if (result[0]) {
      scripts.push(result[0].path);
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
