import { existsSync } from 'node:fs';
import { copyFile, unlink } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import type { RsbuildMode } from '@rsbuild/core';
import type { ExtensionTarget } from '@web-extend/manifest/types';
import chalk from 'chalk';
import type { FSWatcher } from 'chokidar';
import { cacheBuildInfo } from './result.js';
import { type ExtensionRunner, importWebExt, normalizeRunnerConfig, run } from './runner.js';
import { type WatchCallback, watchFiles as chokidarWatchFiles } from './watcher.js';
import { zip } from './zip.js';

export interface StartOptions {
  target?: string;
  root?: string;
  mode?: RsbuildMode;
  config?: string;
  envDir?: string;
  envMode?: string;
  environment?: string[];
  open?: boolean | string;
  host?: string;
  port?: number;
  watch?: boolean;
  zip?: boolean;
  outDir?: string;
}

let commonOptions: StartOptions = {};
let extensionRunner: ExtensionRunner | null = null;
let watchers: FSWatcher[] = [];
const PUBLIC_DIR = 'public';

// forked from https://github.com/web-infra-dev/rsbuild/blob/main/packages/core/src/cli/init.ts
async function init({
  cliOptions,
  isBuildWatch,
  isDev,
}: { cliOptions?: StartOptions; isRestart?: boolean; isBuildWatch?: boolean; isDev?: boolean }) {
  const { createRsbuild, loadConfig, loadEnv } = await import('@rsbuild/core');

  if (cliOptions) {
    commonOptions = cliOptions;
  }

  const cwd = process.cwd();
  const root = commonOptions.root ? resolve(cwd, commonOptions.root) : cwd;
  const envDirPath = commonOptions.envDir ? resolve(cwd, commonOptions.envDir) : cwd;

  const envs = loadEnv({
    cwd: envDirPath,
    mode: commonOptions.envMode,
  });

  const { content: config, filePath: configFilePath } = await loadConfig({
    cwd: root,
    path: commonOptions.config,
    envMode: commonOptions.envMode,
  });

  config.source ||= {};
  config.source.define = {
    ...envs.publicVars,
    ...config.source.define,
  };

  if (commonOptions.root) {
    config.root = root;
  }

  if (commonOptions.mode) {
    config.mode = commonOptions.mode;
  }

  if (commonOptions.open && !config.server?.open) {
    config.server ||= {};
    config.server.open = commonOptions.open;
  }

  if (commonOptions.host) {
    config.server ||= {};
    config.server.host = commonOptions.host;
  }

  if (commonOptions.port) {
    config.server ||= {};
    config.server.port = commonOptions.port;
  }

  // enable CLI shortcuts by default when using Rsbuild CLI
  if (config.dev?.cliShortcuts === undefined) {
    config.dev ||= {};
    config.dev.cliShortcuts = true;
  }

  const rsbuild = await createRsbuild({
    cwd: root,
    rsbuildConfig: config,
    environment: commonOptions.environment,
  });

  rsbuild.onCloseBuild(envs.cleanup);
  rsbuild.onCloseDevServer(envs.cleanup);

  for (const wather of watchers) {
    await wather?.close();
  }
  watchers = [];

  rsbuild.onBeforeCreateCompiler(() => {
    const restart = isDev ? restartDevServer : isBuildWatch ? restartBuild : null;
    if (!restart) return;

    const files = [...envs.filePaths];
    if (configFilePath) {
      files.push(configFilePath);
    }

    const config = rsbuild.getNormalizedConfig();
    if (config.dev?.watchFiles) {
      const watchFiles = [config.dev.watchFiles].flat().filter((item) => item.type === 'reload-server');
      for (const watchFilesConfig of watchFiles) {
        const paths = [watchFilesConfig.paths].flat();
        if (watchFilesConfig.options) {
          const customWatcher = chokidarWatchFiles({
            files: paths,
            root,
            callback: restart,
            watchOptions: watchFilesConfig.options,
          });
          customWatcher && watchers.push(customWatcher);
        } else {
          files.push(...paths);
        }
      }
    }

    const watcher = chokidarWatchFiles({ files, root, callback: restart });
    watcher && watchers.push(watcher);

    const publicWatcher = chokidarWatchFiles({
      files: [PUBLIC_DIR],
      root,
      callback: ({ rootPath, filePath }) =>
        rewritePublicFile({ rootPath, distPath: rsbuild.context.distPath, filePath }),
    });
    publicWatcher && watchers.push(publicWatcher);
  });

  return rsbuild;
}

async function startDevServer(options: StartOptions) {
  prepareEnv('dev', options);

  let webExt = null;
  if (options.open) {
    webExt = await importWebExt();
    if (!webExt) {
      console.warn(`Cannot find package 'web-ext', falling back to default open method.`);
    }
  }

  const rsbuild = await init({
    cliOptions: {
      ...options,
      open: webExt ? false : options.open,
    },
    isDev: true,
  });

  if (options.open && webExt) {
    rsbuild.onDevCompileDone(async () => {
      if (extensionRunner !== null) return;
      // run after manifest.json written in @web-extend/rsbuild-plugin
      setTimeout(async () => {
        const { rootPath, distPath } = rsbuild.context;
        const config = await normalizeRunnerConfig(rootPath, distPath, getBuildTarget(), {
          startUrl: typeof options.open === 'string' ? options.open : undefined,
        });

        extensionRunner = await run(webExt, config);
      }, 200);
    });

    rsbuild.onExit(() => {
      extensionRunner?.exit();
    });
  }

  const { server } = await rsbuild.startDevServer();
  onBeforeRestart(server.close);
}

const restartDevServer: WatchCallback = async ({ filePath, rootPath }) => {
  await beforeRestart({ rootPath, filePath, clear: true, id: 'server' });

  const rsbuild = await init({ isDev: true, isRestart: true });
  if (!rsbuild) return;

  if (extensionRunner) {
    rsbuild.onExit(() => {
      extensionRunner?.exit();
    });
  }
  const { server } = await rsbuild.startDevServer();
  onBeforeRestart(server.close);
};

async function startBuild(options: StartOptions) {
  prepareEnv('build', options);

  const rsbuild = await init({
    cliOptions: options,
    isBuildWatch: options.watch,
  });

  // run after manifest.json written in @web-extend/rsbuild-plugin
  rsbuild.onCloseBuild(async () => {
    const { rootPath, distPath } = rsbuild.context;

    if (options.zip) {
      await zip({
        root: rootPath,
        outDir: distPath,
      });
    }

    await cacheBuildInfo(rootPath, {
      rootPath,
      distPath,
      target: getBuildTarget(),
    });
  });

  const buildInstance = await rsbuild.build({ watch: options.watch });
  if (options.watch) {
    onBeforeRestart(buildInstance.close);
  } else {
    await buildInstance.close();
  }
}

const restartBuild: WatchCallback = async ({ rootPath, filePath }) => {
  await beforeRestart({ rootPath, filePath, clear: true, id: 'build' });

  const rsbuild = await init({ isBuildWatch: true, isRestart: true });
  if (!rsbuild) return;

  rsbuild.onCloseBuild(async () => {
    const { rootPath, distPath } = rsbuild.context;

    if (commonOptions.zip) {
      await zip({
        root: rootPath,
        outDir: distPath,
      });
    }

    await cacheBuildInfo(rootPath, {
      rootPath,
      distPath,
      target: getBuildTarget(),
    });
  });

  const buildInstance = await rsbuild.build({ watch: true });
  onBeforeRestart(buildInstance.close);
};

function prepareEnv(command: 'dev' | 'build', options: StartOptions) {
  const { target, outDir } = options;
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = command === 'build' ? 'production' : 'development';
  }

  if (target) {
    process.env.WEB_EXTEND_TARGET = target;
  }

  if (outDir) {
    process.env.WEB_EXTEND_OUT_DIR = outDir;
  }
}

function getBuildTarget() {
  const target = process.env.WEB_EXTEND_TARGET || '';
  return target as ExtensionTarget;
}

async function rewritePublicFile({
  rootPath,
  distPath,
  filePath,
}: { rootPath: string; distPath: string; filePath: string }) {
  if (!filePath) return;
  const publicPath = resolve(rootPath, PUBLIC_DIR);
  const publichFilePath = isAbsolute(filePath) ? filePath : resolve(rootPath, filePath);
  const distFilePath = resolve(distPath, relative(publicPath, publichFilePath));

  console.info(`Rewrite because ${chalk.yellow(relative(rootPath, publichFilePath))} is changed.`);
  if (!existsSync(publichFilePath)) {
    if (existsSync(distFilePath)) {
      await unlink(distFilePath);
    }
    return;
  }
  await copyFile(publichFilePath, distFilePath);
}

type Cleaner = () => Promise<unknown> | unknown;
let cleaners: Cleaner[] = [];

function onBeforeRestart(cleaner: Cleaner) {
  cleaners.push(cleaner);
}

async function beforeRestart({
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

export { startDevServer, startBuild };
