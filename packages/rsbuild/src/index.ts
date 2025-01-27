import { relative, resolve } from 'node:path';
import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import {
  copyPublicFiles,
  getEntryFileVariants,
  matchDeclarativeEntryFile,
  normalizeManifest,
  readManifestEntries,
  resolveOutDir,
  resolveSrcDir,
  resolveTarget,
  setTargetEnv,
  writeManifestEntries,
  writeManifestFile,
} from './manifest/index.js';
import type { ExtensionTarget, ManifestEntryOutput, WebExtensionManifest } from './manifest/types.js';
import {
  clearOutdatedHotUpdateFiles,
  getAllRsbuildEntryFiles,
  getRsbuildEntryFiles,
  isDevMode,
  normalizeRsbuildEnvironments,
} from './rsbuild/index.js';

export type PluginWebExtendOptions<T = unknown> = {
  manifest?: T;
  target?: ExtensionTarget;
  srcDir?: string;
  outDir?: string;
};

export type { ContentScriptConfig } from './manifest/types.js';

export const pluginWebExtend = (options: PluginWebExtendOptions = {}): RsbuildPlugin => ({
  name: 'plugin-web-extend',
  setup: (api) => {
    const rootPath = api.context.rootPath;
    const selfRootPath = __dirname;
    let mode = process.env.NODE_ENV as RsbuildConfig['mode'];

    let normalizedManifest = {} as WebExtensionManifest;
    let manifest = {} as WebExtensionManifest;

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      if (config.mode) {
        mode = config.mode;
      }
      const target = resolveTarget(options.target);
      const srcDir = resolveSrcDir(rootPath, options.srcDir);
      const srcPath = resolve(rootPath, srcDir);
      const outDir = resolveOutDir({
        outdir: options.outDir,
        distPath: config.output?.distPath?.root,
        target,
        mode,
      });
      setTargetEnv(target);

      manifest = await normalizeManifest({
        rootPath,
        selfRootPath,
        manifest: options.manifest as WebExtensionManifest,
        srcDir,
        target,
        mode,
      });
      normalizedManifest = JSON.parse(JSON.stringify(manifest));

      const manifestEntries = await readManifestEntries(manifest);
      const environments = await normalizeRsbuildEnvironments({ manifestEntries, config, selfRootPath });
      const entryPaths = getAllRsbuildEntryFiles(environments);

      const extraConfig: RsbuildConfig = {
        environments,
        dev: {
          writeToDisk: true,
          client: {
            host: '127.0.0.1:<port>',
            port: '<port>',
            protocol: 'ws',
          },
          watchFiles: [
            {
              type: 'reload-server',
              paths: [srcDir],
              options: {
                cwd: rootPath,
                ignored: (file, stats) => {
                  if (file.startsWith(srcPath)) {
                    const relativePath = relative(srcPath, file);
                    if (stats?.isFile()) {
                      if (stats.size === 0) return true;

                      const entry = matchDeclarativeEntryFile(relativePath);
                      if (!entry) return true;

                      const entryFileVariants = getEntryFileVariants(entry.name, entry.ext).map((file) =>
                        resolve(srcPath, file),
                      );
                      const hasEntry = entryFileVariants.some((file) => entryPaths.includes(file));
                      if (hasEntry) return true;
                    }
                    return false;
                  }
                  return true;
                },
              },
            },
          ],
        },
        server: {
          printUrls: false,
        },
        output: {
          distPath: {
            root: outDir,
          },
        },
      };

      // extraConfig must be at the end, for dev.writeToDisk
      return mergeRsbuildConfig(config, extraConfig);
    });

    api.processAssets({ stage: 'additions' }, async ({ assets, compilation, environment, sources }) => {
      // support content hmr in dev mode
      if (isDevMode(mode) && environment.name === 'content') {
        const entries = Object.keys(environment.entry);
        for (const name in assets) {
          if (!name.endsWith('.js')) continue;
          const entryName = entries.find((item) => name.includes(item));
          if (entryName) {
            const oldContent = assets[name].source() as string;
            const newContent = oldContent.replaceAll(
              'webpackHotUpdateWebExtend_content',
              `webpackHotUpdateWebExtend_${entryName}`,
            );
            const source = new sources.RawSource(newContent);
            compilation.updateAsset(name, source);
          }
        }
      }
    });

    api.processAssets({ stage: 'optimize' }, async ({ assets, compilation, environment }) => {
      if (environment.name === 'web') {
        for (const name in assets) {
          if (name.endsWith('.js') && (name.includes('icons') || name.includes('empty'))) {
            compilation.deleteAsset(name);
          }
        }
      }
    });

    api.onAfterEnvironmentCompile(async ({ stats, environment }) => {
      // @see https://rspack.dev/api/javascript-api/stats-json
      const entrypoints = stats?.toJson().entrypoints;
      if (!entrypoints) return;

      const manifestEntry: ManifestEntryOutput = {};
      for (const [entryName, entrypoint] of Object.entries(entrypoints)) {
        const input = getRsbuildEntryFiles(environment.entry, entryName);

        const { assets = [], auxiliaryAssets = [] } = entrypoint;
        const output = [...assets, ...auxiliaryAssets]
          .map((item) => item.name)
          .filter((item) => !item.includes('.hot-update.'));

        manifestEntry[entryName] = {
          input,
          output,
        };
      }

      await writeManifestEntries({
        normalizedManifest,
        manifest,
        rootPath,
        entry: manifestEntry,
      });
    });

    api.onDevCompileDone(async ({ stats }) => {
      const distPath = api.context.distPath;
      await copyPublicFiles(rootPath, distPath);
      await writeManifestFile({ distPath, manifest, mode, selfRootPath });

      // clear outdated hmr files
      const statsList = 'stats' in stats ? stats.stats : [stats];
      clearOutdatedHotUpdateFiles(distPath, statsList);

      console.log('Built the extension successfully');
    });

    api.onAfterBuild(async () => {
      const distPath = api.context.distPath;
      await writeManifestFile({ distPath, manifest, mode, selfRootPath });

      console.log('Built the extension successfully');
    });
  },
});
