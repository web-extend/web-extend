import { basename } from 'node:path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import type { ChokidarOptions } from 'chokidar';
import { debounce } from './util.js';

export type RestartCallback = (props: { filePath: string }) => Promise<unknown> | unknown;

type WatchEvent = 'add' | 'change' | 'unlink';
type Cleaner = () => Promise<unknown> | unknown;

interface WatchFilesForRestartProps {
  root: string;
  files: string[];
  restart: RestartCallback;
  watchOptions?: ChokidarOptions;
  watchEvents?: WatchEvent[];
}

export function watchFilesForRestart({
  files,
  root,
  restart,
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

  const callback = debounce(async (filePath) => {
    await watcher.close();
    await restart({ filePath });
  }, 300);

  for (const event of watchEvents) {
    watcher.on(event, callback);
  }

  return watcher;
}

let cleaners: Cleaner[] = [];

export function onBeforeRestart(cleaner: Cleaner) {
  cleaners.push(cleaner);
}

export async function beforeRestart({
  filePath,
  id,
  clear = true,
}: { filePath?: string; id: string; clear?: boolean }) {
  if (clear) {
    console.clear();
  }

  if (filePath) {
    const filename = basename(filePath);
    console.info(`Restart ${id} because ${chalk.yellow(filename)} is changed.\n`);
  } else {
    console.info(`Restarting ${id}...\n`);
  }

  for (const cleaner of cleaners) {
    await cleaner();
  }
  cleaners = [];
}
