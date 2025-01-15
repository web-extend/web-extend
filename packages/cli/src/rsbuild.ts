import { resolve } from 'node:path';
import type { RsbuildMode } from '@rsbuild/core';
import type { FSWatcher } from 'chokidar';
import { writeBuildInfo, type BuildInfo } from './cache.js';
import { type RestartCallback, beforeRestart, onBeforeRestart, watchFilesForRestart } from './restart.js';
import { normalizeWebExtRunConfig, importWebExt, type TargetType } from './web-ext.js';
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
}

interface ExtensionRunner {
  reloadAllExtensions: () => void;
  exit: () => void;
}

let commonOptions: StartOptions = {};
let extensionRunner: ExtensionRunner | null = null;
let watchers: FSWatcher[] = [];

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

  if (isBuildWatch || isDev) {
    for (const wather of watchers) {
      await wather?.close();
    }
    watchers = [];

    const restart = isDev ? restartDevServer : isBuildWatch ? restartBuild : null;
    rsbuild.onBeforeCreateCompiler(() => {
      if (!restart) return;

      const files = [...envs.filePaths];
      if (configFilePath) {
        files.push(configFilePath);
      }

      // const config = rsbuild.getNormalizedConfig();
      // if (config.dev?.watchFiles) {
      //   const watchFiles = [config.dev.watchFiles].flat().filter((item) => item.type === 'reload-server');
      //   for (const watchFilesConfig of watchFiles) {
      //     const paths = [watchFilesConfig.paths].flat();
      //     if (watchFilesConfig.options) {
      //       const watcher = watchFilesForRestart({
      //         files: paths,
      //         root,
      //         restart,
      //         watchOptions: watchFilesConfig.options,
      //         watchEvents: ['add', 'unlink'],
      //       });
      //       if (watcher) {
      //         watchers.push(watcher);
      //       }
      //     } else {
      //       files.push(...paths);
      //     }
      //   }
      // }

      const watcher = watchFilesForRestart({ files, root, restart });
      if (watcher) {
        watchers.push(watcher);
      }
    });
  }

  return rsbuild;
}

async function startDevServer(options: StartOptions) {
  prepareRun(options.target);

  let webExt = null;
  if (options.open) {
    webExt = await importWebExt();
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
      const root = rsbuild.context.rootPath;
      const config = await normalizeWebExtRunConfig(root, {
        target: getBrowserTarget(),
        startUrl: typeof options.open === 'string' ? options.open : undefined,
        sourceDir: rsbuild.context.distPath,
      });

      webExt.cmd
        .run(config, {
          shouldExitProgram: false,
        })
        .then((runner: ExtensionRunner) => {
          extensionRunner = runner;
        });
    });

    rsbuild.onExit(() => {
      extensionRunner?.exit();
    });
  }

  const { server } = await rsbuild.startDevServer();
  onBeforeRestart(server.close);
}

const restartDevServer: RestartCallback = async ({ filePath }) => {
  await beforeRestart({ filePath, clear: true, id: 'server' });

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
  prepareRun(options.target);

  const rsbuild = await init({
    cliOptions: options,
    isBuildWatch: options.watch,
  });

  // run after manifest.json written
  rsbuild.onCloseBuild(async () => {
    const { rootPath, distPath } = rsbuild.context;
    const buildInfo: BuildInfo = {
      rootPath,
      distPath,
      target: getBuildTarget(),
    };

    if (options.zip) {
      await zip({
        root: buildInfo.rootPath,
        source: buildInfo.distPath,
      });
    }

    await writeBuildInfo(buildInfo.rootPath, buildInfo);
  });

  const buildInstance = await rsbuild.build({ watch: options.watch });
  if (options.watch) {
    onBeforeRestart(buildInstance.close);
  } else {
    await buildInstance.close();
  }
}

const restartBuild: RestartCallback = async ({ filePath }) => {
  await beforeRestart({ filePath, clear: true, id: 'build' });

  const rsbuild = await init({ isBuildWatch: true, isRestart: true });
  if (!rsbuild) return;

  rsbuild.onCloseBuild(async () => {
    const { rootPath, distPath } = rsbuild.context;
    const buildInfo: BuildInfo = {
      rootPath,
      distPath,
      target: getBuildTarget(),
    };

    if (commonOptions.zip) {
      await zip({
        root: buildInfo.rootPath,
        source: buildInfo.distPath,
      });
    }

    await writeBuildInfo(buildInfo.rootPath, buildInfo);
  });

  const buildInstance = await rsbuild.build({ watch: true });
  onBeforeRestart(buildInstance.close);
};

function prepareRun(target: string | undefined) {
  if (target) {
    process.env.WEB_EXTEND_TARGET = target;
  }
}

function getBuildTarget() {
  const target = process.env.WEB_EXTEND_TARGET || '';
  return target;
}

function getBrowserTarget(): TargetType {
  const target = getBuildTarget();
  const browser = target?.includes('firefox') ? 'firefox-desktop' : 'chromium';
  return browser;
}

export { startDevServer, startBuild };
