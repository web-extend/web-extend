import { getSingleDeclarativeEntryFile, isDevMode, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor } from '../types.js';

const key = 'background';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchSingleDeclarativeEntryFile(filePath, key, context);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  const { mode, runtime } = context;
  const { background } = manifest;

  const input: string[] = [];
  if (background?.service_worker) {
    input.push(background.service_worker);
  } else if (background?.scripts) {
    input.push(...background.scripts);
  } else {
    const result = await getSingleDeclarativeEntryFile(key, context);
    if (result[0]) {
      input.push(result[0].path);
    }
  }
  if (isDevMode(mode) && runtime?.background) {
    input.push(runtime.background);
  }

  if (input.length) {
    entries[key] = {
      name: key,
      import: input,
      type: 'script',
    };

    manifest.background ??= {};
    manifest.background.service_worker = input.join(',');
  }
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, output }) => {
  const { background } = manifest;
  const scripts = output?.initial?.filter((item) => item.endsWith('.js')) || [];
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
  writeEntry,
};

export default backgroundProcessor;
