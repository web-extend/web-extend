import type { ChokidarOptions } from 'chokidar';
import chokidar from 'chokidar';
import { debounce } from './util.js';

export type WatchCallback = (props: { filePath: string; rootPath: string }) => Promise<unknown> | unknown;

type WatchEvent = 'add' | 'change' | 'unlink';

interface ChokidarWatchFilesOptions {
  root: string;
  files: string[];
  callback: WatchCallback;
  watchOptions?: ChokidarOptions;
  watchEvents?: WatchEvent[];
}

export function watchFiles({
  files,
  root,
  callback,
  watchOptions = {},
  watchEvents = ['add', 'change', 'unlink'],
}: ChokidarWatchFilesOptions) {
  if (!files.length) {
    return;
  }

  const watcher = chokidar.watch(files, {
    ignoreInitial: true,
    ignorePermissionErrors: true,
    cwd: root,
    ...watchOptions,
  });

  const cb = debounce(async (filePath) => {
    await callback({ filePath, rootPath: root });
  }, 300);

  for (const event of watchEvents) {
    watcher.on(event, cb);
  }

  return watcher;
}
