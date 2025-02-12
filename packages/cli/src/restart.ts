import { relative } from 'node:path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import type { ChokidarOptions } from 'chokidar';
import { debounce } from './util.js';

export type RestartCallback = (props: { filePath: string; rootPath: string }) => Promise<unknown> | unknown;

type WatchEvent = 'add' | 'change' | 'unlink';
type Cleaner = () => Promise<unknown> | unknown;

interface WatchFilesForRestartProps {
  root: string;
  files: string[];
  callback: RestartCallback;
  watchOptions?: ChokidarOptions;
  watchEvents?: WatchEvent[];
}

export function watchFilesForRestart({
  files,
  root,
  callback,
  watchOptions = {},
  watchEvents = ['add', 'change', 'unlink'],
}: WatchFilesForRestartProps) {
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

let cleaners: Cleaner[] = [];

export function onBeforeRestart(cleaner: Cleaner) {
  cleaners.push(cleaner);
}

export async function beforeRestart({
  rootPath,
  filePath,
  id,
  clear = true,
}: { rootPath: string; filePath?: string; id: string; clear?: boolean }) {
  if (clear) {
    console.clear();
  }

  if (filePath) {
    console.info(`Restart ${id} because ${chalk.yellow(relative(rootPath, filePath))} is changed.\n`);
  } else {
    console.info(`Restarting ${id}...\n`);
  }

  for (const cleaner of cleaners) {
    await cleaner();
  }
  cleaners = [];
}
