import { resolveOutDir, resolveSrcDir, resolveTarget, setTargetEnv } from './common.js';
import type { WebExtendContext } from './types.js';

export const normalizeContext = (
  options: Partial<WebExtendContext> & { buildDirTemplate?: string },
): WebExtendContext => {
  const rootPath = options.rootPath || process.cwd();
  const mode = options.mode || process.env.NODE_ENV || 'none';

  const target = resolveTarget(options.target);
  setTargetEnv(target);

  const srcDir = resolveSrcDir(rootPath, options.srcDir);

  const outDir = resolveOutDir({
    outDir: options.outDir,
    target,
    mode,
    buildDirTemplate: options.buildDirTemplate,
  });

  const publicDir = options.publicDir || 'public';

  const entriesDir = {
    root: srcDir,
    background: 'background',
    content: 'content',
    contents: 'contents',
    popup: 'popup',
    options: 'options',
    sidepanel: 'sidepanel',
    devtools: 'devtools',
    panel: 'panel',
    panels: 'panels',
    sandbox: 'sandbox',
    sandboxes: 'sandboxes',
    newtab: 'newtab',
    history: 'history',
    bookmarks: 'bookmarks',
    scripting: 'scripting',
    pages: 'pages',
    icons: 'assets',
    ...(options.entriesDir || {}),
  };

  return {
    rootPath,
    mode,
    target,
    srcDir,
    outDir,
    publicDir,
    entriesDir,
    runtime: options?.runtime,
  };
};

export default normalizeContext;
