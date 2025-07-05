import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EnvironmentConfig, RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import { ManifestManager } from '@web-extend/manifest';
import { getEntryFileVariants } from '@web-extend/manifest/common';
import type { ManifestEntries, ManifestEntryOutput, WebExtensionManifest } from '@web-extend/manifest/types';
import {
  clearOutdatedHotUpdateFiles,
  getAllRsbuildEntryFiles,
  getJsDistPath,
  getRsbuildEntryFiles,
  transformManifestEntry,
} from './helper.js';
import type { EnviromentKey, NormalizeRsbuildEnvironmentProps, PluginWebExtendOptions } from './types.js';
import { getWebEnvironmentConfig } from './web.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export type { PluginWebExtendOptions } from './types.js';

async function normalizeRsbuildEnvironments(options: NormalizeRsbuildEnvironmentProps) {
  const { manifestEntries, selfRootPath } = options;
  const { background, ...webEntries } = manifestEntries;

  const environments: {
    [key in EnviromentKey]?: EnvironmentConfig;
  } = {};

  if (background) {
    environments.background = {
      source: {
        entry: transformManifestEntry(background),
      },
      output: {
        target: 'web-worker',
        distPath: {
          js: '',
        },
        filename: {
          js: getJsDistPath(background),
        },
      },
    };
  }

  const webEnv = getWebEnvironmentConfig({
    ...options,
    manifestEntries: webEntries,
  });
  if (webEnv) {
    environments.web = webEnv;
  }

  // void the empty entry error
  if (Object.keys(manifestEntries).length === 0) {
    environments.web = {
      source: {
        entry: {
          _empty: {
            import: resolve(selfRootPath, './static/empty-entry.js'),
            html: false,
          },
        },
      },
    };
  }

  return environments;
}

export const pluginWebExtend = (options: PluginWebExtendOptions = {}): RsbuildPlugin => ({
  name: 'plugin-web-extend',
  setup: (api) => {
    const manifestManager = new ManifestManager();
    let manifestEntries: ManifestEntries | null = null;

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      const rootPath = api.context.rootPath;
      const selfRootPath = __dirname;

      await manifestManager.normalize({
        mode: config.mode,
        target: options.target,
        srcDir: options.srcDir,
        outDir: options.outDir,
        publicDir: options.publicDir,
        buildDirTemplate: options.buildDirTemplate,
        rootPath,
        runtime: {
          background: resolve(selfRootPath, 'static/background-runtime.js'),
          contentBridge: resolve(selfRootPath, 'static/content-bridge.js'),
        },
        manifest: options.manifest as WebExtensionManifest,
      });

      manifestEntries = await manifestManager.readEntries();
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

                      const entry = ManifestManager.matchDeclarativeEntry(relativePath);
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
        if (liveReload && resourcePath.endsWith('hmr.js')) {
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

        if (resourcePath.includes('scripting/')) {
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
      const config = environment.config;
      const emitCss = config.output.emitCss ?? target === 'web';

      if (!emitCss || !isDev || !config.output.injectStyles) return;

      const scriptStyleImports = Object.values(manifestEntries?.scripting || {})
        .filter((entry) => entry.entryType === 'style')
        .flatMap((entry) => entry.input);
      if (!scriptStyleImports.length) return;

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
    });

    api.processAssets({ stage: 'optimize' }, async ({ assets, compilation, environment }) => {
      if (environment.name !== 'web' || !manifestEntries) return;
      const manifestEntryInput = Object.values(manifestEntries).reduce((acc, entry) => {
        for (const key in entry) {
          acc[key] = entry[key];
        }
        return acc;
      }, {});

      for (const name in assets) {
        if (!name.endsWith('.js')) continue;

        const assetName = name.replace(/\.js$/, '');
        const entryType = manifestEntryInput[assetName]?.entryType;

        if (entryType === 'image' || entryType === 'style' || assetName.includes('_empty')) {
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
