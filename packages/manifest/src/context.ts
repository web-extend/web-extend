import { normalizeEntriesDir, resolveOutDir, resolveTarget, setTargetEnv } from './common.js';
import type { WebExtendCommonConfig, WebExtendContext } from './types.js';

export type NormalizeContextOptions = Partial<Pick<WebExtendContext, 'rootPath' | 'mode' | 'runtime'>> &
  WebExtendCommonConfig;

export const normalizeContext = (options: NormalizeContextOptions): WebExtendContext => {
  const rootPath = options.rootPath || process.cwd();
  const mode = options.mode || process.env.NODE_ENV || 'none';

  const target = resolveTarget(options.target);
  setTargetEnv(target);

  const outDir = resolveOutDir({
    outDir: options.outDir,
    target,
    mode,
    buildDirTemplate: options.buildDirTemplate,
  });

  const publicDir = options.publicDir || 'public';

  const entriesDir = normalizeEntriesDir(rootPath, options.entriesDir);

  return {
    rootPath,
    mode,
    target,
    outDir,
    publicDir,
    entriesDir,
    runtime: options?.runtime,
  };
};
