import { getSingleDeclarativeEntryFile, matchSingleDeclarativeEntryFile } from '../common.js';
import type { ManifestEntryProcessor } from '../types.js';

const key = 'devtools';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return matchSingleDeclarativeEntryFile(filePath, key, context);
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  let input = manifest.devtools_page;

  if (!input) {
    const result = await getSingleDeclarativeEntryFile(key, context);
    if (result[0]) {
      input = result[0].path;
      manifest.devtools_page = input;
    }
  }

  if (input) {
    entries[key] = {
      name: key,
      input: [input],
      type: 'html',
    };
  }
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = ({ manifest, name }) => {
  manifest.devtools_page = `${name}.html`;
};

const devtoolsProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntry,
  normalizeEntry,
  writeEntry,
};

export default devtoolsProcessor;
