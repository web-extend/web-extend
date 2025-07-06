import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RsbuildConfig, RsbuildPlugin, WatchFiles } from '@rsbuild/core';
import { ManifestManager, matchDeclarativeEntry } from '@web-extend/manifest';
import { getEntryFileVariants, isDevMode } from '@web-extend/manifest/common';
import type {
  ManifestEntryOutput,
  WebExtendCommonConfig,
  WebExtendContext,
  WebExtendEntries,
  WebExtendEntryKey,
  WebExtensionManifest,
} from '@web-extend/manifest/types';
import { ContentRuntimePlugin, hotUpdateGlobal } from './content.js';
import { normalizeRsbuildEnvironments } from './environments.js';
import { clearOutdatedHotUpdateFiles, getRsbuildEntryFiles } from './helper.js';

export type PluginWebExtendOptions = WebExtendCommonConfig;

const __dirname = dirname(fileURLToPath(import.meta.url));

const getDevWatchFiles = (context: WebExtendContext, entries?: WebExtendEntries): WatchFiles[] => {
  if (!entries) return [];
  const { rootPath, entriesDir } = context;
  const entriesDirRootPath = resolve(rootPath, entriesDir.root);

  const entryPaths: string[] = [];
  for (const key in entries) {
    const entry = entries[key as WebExtendEntryKey];
    if (entry) {
      const input = Object.values(entry).flatMap((item) => item.input);
      entryPaths.push(...input);
    }
  }

  return [
    {
      type: 'reload-server',
      paths: [entriesDir.root],
      options: {
        cwd: rootPath,
        ignored: (file, stats) => {
          if (file.startsWith(entriesDirRootPath)) {
            const relativePath = relative(entriesDirRootPath, file);
            if (stats?.isFile()) {
              if (stats.size === 0) return true;

              const entry = matchDeclarativeEntry(relativePath, context);
              if (!entry) return true;

              const existsEntry = getEntryFileVariants(entry.name, entry.ext)
                .map((file) => resolve(entriesDirRootPath, file))
                .some((file) => entryPaths.includes(file));
              if (existsEntry) return true;
            }
            return false;
          }
          return true;
        },
      },
    },
  ];
};

export const pluginWebExtend = (options: PluginWebExtendOptions = {}): RsbuildPlugin => ({
  name: 'plugin-web-extend',
  setup: (api) => {
    const manifestManager = new ManifestManager();
    let webExtendEntries: WebExtendEntries | null = null;

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      const rootPath = api.context.rootPath;
      const selfRootPath = __dirname;

      await manifestManager.normalize({
        ...options,
        mode: config.mode,
        rootPath,
        runtime: {
          background: resolve(selfRootPath, 'static/background-runtime.js'),
          contentBridge: resolve(selfRootPath, 'static/content-bridge.js'),
        },
      });

      webExtendEntries = await manifestManager.readEntries();
      const environments = normalizeRsbuildEnvironments({
        entries: webExtendEntries,
        isDev: isDevMode(manifestManager.context.mode),
      });

      const extraConfig: RsbuildConfig = {
        environments,
        source: {
          define: {
            'import.meta.env.WEB_EXTEND_TARGET': JSON.stringify(manifestManager.context.target),
          },
        },
        dev: {
          writeToDisk: true,
          client: {
            host: '127.0.0.1:<port>',
            port: '<port>',
            protocol: 'ws',
          },
          watchFiles: getDevWatchFiles(manifestManager.context, webExtendEntries),
        },
        server: {
          printUrls: false,
          cors: {
            origin: '*',
          },
          publicDir: {
            name: manifestManager.context.publicDir,
          },
        },
        output: {
          distPath: {
            root: manifestManager.context.outDir,
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
        const liveReload = environment.config.dev.liveReload;
        if (webExtendEntries?.content && liveReload && resourcePath.endsWith('hmr.js')) {
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

        if (webExtendEntries?.scripting && resourcePath.includes('scripting/')) {
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
      if (!isDev) return;
      const config = environment.config;

      // process content entry
      const contentEntry = webExtendEntries?.content;
      if (contentEntry) {
        chain.output.set('hotUpdateGlobal', hotUpdateGlobal);
        chain.plugin('ContentRuntimePlugin').use(ContentRuntimePlugin, [
          {
            getPort: () => config.server.port,
            target: manifestManager.context.target,
            mode: manifestManager.context.mode,
            entry: config.source.entry || {},
          },
        ]);
      }

      // process scripting entry
      const scriptingEntry = webExtendEntries?.scripting;
      const emitCss = config.output.emitCss ?? target === 'web';
      const scriptStyleImports = Object.values(scriptingEntry || {})
        .filter((entry) => entry.entryType === 'style')
        .flatMap((entry) => entry.input);
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
      const manifestEntryInput = Object.values(webExtendEntries).reduce((acc, entry) => {
        for (const key in entry) {
          acc[key] = entry[key];
        }
        return acc;
      }, {});

      for (const name in assets) {
        if (!name.endsWith('.js')) continue;

        const assetName = name.replace(/\.js$/, '');
        const entryType = manifestEntryInput[assetName]?.entryType;

        if (entryType === 'image' || entryType === 'style') {
          // Remove assets that are not needed in the final build
          compilation.deleteAsset(name);
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

      // fix occasional test error
      await new Promise((resolve) => setTimeout(resolve, 5));

      await manifestManager.writeManifestFile();
      console.log('Built the extension successfully');
    });
  },
});
