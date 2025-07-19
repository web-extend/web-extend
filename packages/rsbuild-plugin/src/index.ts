import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import { ManifestManager } from '@web-extend/manifest';
import type { WebExtendManifest } from '@web-extend/manifest/browser';
import { isDevMode } from '@web-extend/manifest/common';
import type {
  WebExtendCommonConfig,
  WebExtendEntries,
  WebExtendEntryInput,
  WebExtendEntryOutput,
} from '@web-extend/manifest/types';
import { ContentRuntimePlugin, hotUpdateGlobal } from './content.js';
import { normalizeRsbuildEnvironments } from './environments.js';
import { clearOutdatedHotUpdateFiles } from './helper.js';

export type PluginWebExtendOptions = WebExtendCommonConfig;

const __dirname = dirname(fileURLToPath(import.meta.url));

export const pluginWebExtend = (options: PluginWebExtendOptions = {}): RsbuildPlugin => ({
  name: 'plugin-web-extend',
  setup: (api) => {
    const manifestManager = new ManifestManager();
    let webExtendEntries: WebExtendEntries | null = null;

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      const rootPath = api.context.rootPath;

      await manifestManager.normalize({
        target: options.target,
        entriesDir: options.entriesDir || options.srcDir,
        outDir: options.outDir,
        publicDir: options.publicDir,
        buildDirTemplate: options.buildDirTemplate,
        rootPath,
        mode: config.mode,
        runtime: {
          background: resolve(__dirname, 'static/background-runtime.js'),
          contentBridge: resolve(__dirname, 'static/content-bridge.js'),
        },
        manifest: options.manifest as WebExtendManifest,
      });

      const { target, outDir, publicDir, mode, entriesDir } = manifestManager.context;

      webExtendEntries = manifestManager.entries;
      const environments = normalizeRsbuildEnvironments({
        entries: webExtendEntries,
        isDev: isDevMode(mode),
      });

      const entryNames = Object.values(webExtendEntries)
        .flat()
        .map((item) => item.name);
      const extraConfig: RsbuildConfig = {
        environments,
        source: {
          define: {
            'import.meta.env.WEB_EXTEND_TARGET': JSON.stringify(target),
          },
        },
        dev: {
          writeToDisk: true,
          client: {
            host: '127.0.0.1',
            port: '<port>',
            protocol: 'ws',
          },
          watchFiles: [
            {
              type: 'reload-server',
              paths: [entriesDir.root],
              options: {
                cwd: rootPath,
                ignored: (file, stats) => {
                  if (stats?.isFile()) {
                    if (stats.size === 0) return true;
                    const entry = manifestManager.matchDeclarativeEntry(file);
                    if (!entry || entryNames.includes(entry.name)) return true;
                  }
                  return false;
                },
              },
            },
          ],
        },
        server: {
          printUrls: false,
          cors: {
            origin: '*',
          },
          publicDir: {
            name: publicDir,
          },
        },
        output: {
          distPath: {
            root: outDir,
          },
        },
        tools: {
          rspack: {
            experiments: {
              buildHttp: {
                allowedUris: [/https?:\/\//],
              },
            },
          },
        },
      };

      // extraConfig must be at the end, for dev.writeToDisk
      return mergeRsbuildConfig(config, extraConfig);
    });

    api.onBeforeStartDevServer(() => {
      api.transform({ test: /\.(js|ts)$/, environments: ['web'] }, ({ resourcePath, code, environment }) => {
        // Reload the extension before reload content_scripts
        const contentEntry = webExtendEntries?.contents;
        const liveReload = environment.config.dev.liveReload;
        if (contentEntry && liveReload && resourcePath.endsWith('hmr.js')) {
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

        // Disable hot reload for scripting entry
        const scriptingEntry = webExtendEntries?.scripting || [];
        const isScriptingInput = scriptingEntry.flatMap((item) => item.import).includes(resourcePath);
        if (isScriptingInput) {
          const newCode = `${code} \n
            if(module.hot) {
              module.hot.invalidate();
            }
            `;
          return newCode;
        }

        return code;
      });
    });

    api.modifyBundlerChain(async (chain, { target, environment, isDev, CHAIN_ID, rspack }) => {
      if (!isDev || environment.name !== 'web') return;
      const config = environment.config;

      // Process content entry
      const contentEntry = webExtendEntries?.contents;
      if (contentEntry) {
        chain.output.set('hotUpdateGlobal', hotUpdateGlobal);
        chain.plugin('ContentRuntimePlugin').use(ContentRuntimePlugin, [
          {
            serverUrl: `http://localhost:${config.dev.client.port}`,
            target: manifestManager.context.target,
            contentEntryNames: contentEntry.map((item) => item.name),
          },
        ]);
      }

      // Process scripting entry
      const scriptingEntry = webExtendEntries?.scripting || [];
      const emitCss = config.output.emitCss ?? target === 'web';
      const scriptStyleImports = scriptingEntry
        .filter((entry) => entry.type === 'style')
        .flatMap((entry) => entry.import);

      if (scriptingEntry && emitCss && config.output.injectStyles && scriptStyleImports.length) {
        const cssRule = chain.module.rule(CHAIN_ID.RULE.CSS);
        const extractRule = cssRule.oneOf('css-extract-styles').resource((value) => scriptStyleImports.includes(value));
        const injectRule = cssRule.oneOf('css-inject-styles');
        const originalUses = cssRule.uses.entries();

        Object.keys(originalUses).forEach((key) => {
          const use = originalUses[key];
          if (key === CHAIN_ID.USE.STYLE) {
            extractRule.use(CHAIN_ID.USE.MINI_CSS_EXTRACT).loader(rspack.CssExtractRspackPlugin.loader);
          } else {
            extractRule
              .use(key)
              .loader(use.get('loader'))
              .options(use.get('options') || {});
          }

          injectRule
            .use(key)
            .loader(use.get('loader'))
            .options(use.get('options') || {});
        });

        const extractPluginOptions = config.tools.cssExtract.pluginOptions;
        chain.plugin(CHAIN_ID.PLUGIN.MINI_CSS_EXTRACT).use(rspack.CssExtractRspackPlugin, [
          {
            ...extractPluginOptions,
          },
        ]);

        cssRule.uses.clear();
      }
    });

    api.processAssets({ stage: 'optimize', environments: ['web'] }, async ({ assets, compilation }) => {
      if (!webExtendEntries) return;
      const manifestEntryInput: WebExtendEntryInput[] = Object.values(webExtendEntries).flat();

      for (const name in assets) {
        if (!name.endsWith('.js')) continue;

        const assetName = name.replace(/\.js$/, '');
        const entryType = manifestEntryInput.find((item) => item.name === assetName)?.type;

        if (entryType === 'image' || entryType === 'style') {
          // Remove assets that are not needed in the final build
          compilation.deleteAsset(name);
        }
      }
    });

    api.onAfterEnvironmentCompile(async ({ stats }) => {
      // @see https://rspack.dev/api/javascript-api/stats-json
      const entrypoints = stats?.toJson().entrypoints;
      if (!entrypoints) return;

      const manifestEntry: WebExtendEntryOutput[] = [];
      for (const [entryName, entrypoint] of Object.entries(entrypoints)) {
        const { assets = [], auxiliaryAssets = [] } = entrypoint;
        const output = [...assets, ...auxiliaryAssets]
          .map((item) => item.name)
          .filter((item) => !item.includes('.hot-update.'));

        manifestEntry.push({
          name: entryName,
          output,
        });
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

      // fix occasional test error
      await new Promise((resolve) => setTimeout(resolve, 5));

      await manifestManager.writeManifestFile();
      console.log('Built the extension successfully');
    });
  },
});
