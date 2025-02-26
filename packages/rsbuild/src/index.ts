import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import { ManifestManager } from '@web-extend/manifest';
import { getEntryFileVariants } from '@web-extend/manifest/common';
import type { ExtensionTarget, ManifestEntryOutput, WebExtensionManifest } from '@web-extend/manifest/types';
import {
  clearOutdatedHotUpdateFiles,
  getAllRsbuildEntryFiles,
  getRsbuildEntryFiles,
  normalizeRsbuildEnvironments,
} from './helper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export type PluginWebExtendOptions<T = unknown> = {
  manifest?: T | ((props: { target: ExtensionTarget; mode: string }) => T);
  target?: ExtensionTarget;
  srcDir?: string;
  outDir?: string;
};

export const pluginWebExtend = (options: PluginWebExtendOptions = {}): RsbuildPlugin => ({
  name: 'plugin-web-extend',
  setup: (api) => {
    const manifestManager = new ManifestManager();

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      const rootPath = api.context.rootPath;
      const selfRootPath = __dirname;

      await manifestManager.normalize({
        mode: config.mode,
        target: options.target,
        srcDir: options.srcDir,
        outDir: options.outDir,
        rootPath,
        runtime: {
          background: resolve(selfRootPath, 'static/background-runtime.js'),
          contentBridge: resolve(selfRootPath, 'static/content-bridge.js'),
        },
        manifest: options.manifest as WebExtensionManifest,
      });

      const manifestEntries = await manifestManager.readEntries();
      const environments = await normalizeRsbuildEnvironments({
        manifestEntries,
        config,
        selfRootPath,
        context: api.context,
        manifestContext: manifestManager.context,
      });
      const entryPaths = getAllRsbuildEntryFiles(environments);
      const srcDir = manifestManager.context.srcDir;
      const srcPath = resolve(rootPath, srcDir);

      const extraConfig: RsbuildConfig = {
        source: {
          define: {
            'import.meta.env.WEB_EXTEND_TARGET': JSON.stringify(manifestManager.context.target),
          },
        },
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

                      const entry = ManifestManager.matchDeclarativeEntryFile(relativePath);
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
            root: manifestManager.context.outDir,
          },
        },
      };

      // extraConfig must be at the end, for dev.writeToDisk
      return mergeRsbuildConfig(config, extraConfig);
    });

    api.onBeforeStartDevServer(() => {
      api.transform({ test: /\.js$/ }, ({ resourcePath, code, environment }) => {
        const liveReload = api.getNormalizedConfig().dev.liveReload;
        const hmr = resourcePath.endsWith('hmr.js');
        if (environment.name === 'content' && liveReload && hmr) {
          const reloadExtensionCode = `
            const bridgeEl = document.getElementById('web-extend-content-bridge');
            if (bridgeEl) {
              bridgeEl.dataset.contentChanged = 'true';
            }`;
          const newCode = code.replace(
            /(window\.)?location\.reload\(\);?/g,
            `{
                ${reloadExtensionCode}
                $&
              }`,
          );
          return newCode;
        }
        return code;
      });
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

      await manifestManager.writeEntries(manifestEntry);
    });

    api.onDevCompileDone(async ({ stats }) => {
      if (stats?.hasErrors()) return;

      await manifestManager.copyPublicFiles();
      await manifestManager.writeManifestFile();

      // clear outdated hmr files
      const statsList = 'stats' in stats ? stats.stats : [stats];
      clearOutdatedHotUpdateFiles(api.context.distPath, statsList);

      console.log('Built the extension successfully');
    });

    api.onAfterBuild(async ({ stats }) => {
      if (stats?.hasErrors()) return;

      await manifestManager.writeManifestFile();
      console.log('Built the extension successfully');
    });
  },
});
