import backgroundProcessor from './background.js';
import contentProcessor from './content.js';
import devtoolsProcessor from './devtools.js';
import iconsProcessor from './icons.js';
import optionsProcessor from './options.js';
import overrideProcessors from './overrides.js';
import pagesProcessor from './pages.js';
import panelProcessor from './panel.js';
import popupProcessor from './popup.js';
import sandboxProcessor from './sandbox.js';
import scriptingProcessor from './scripting.js';
import sidepanelProcessor from './sidepanel.js';
import type { ManifestEntryProcessor } from '../types.js';

export const entryProcessors: ManifestEntryProcessor[] = [
  backgroundProcessor,
  contentProcessor,
  popupProcessor,
  optionsProcessor,
  sidepanelProcessor,
  devtoolsProcessor,
  panelProcessor,
  sandboxProcessor,
  iconsProcessor,
  scriptingProcessor,
  pagesProcessor,
  ...overrideProcessors,
];
