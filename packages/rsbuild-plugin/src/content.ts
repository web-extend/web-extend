import type { EnvironmentConfig, Rspack } from '@rsbuild/core';
import { isDevMode, transformManifestEntry } from './helper.js';
import type { NormalizeRsbuildEnvironmentProps } from './types.js';

const hotUpdateGlobal = 'webpackHotUpdateWebExtend_content';

function getContentEnvironmentConfig({
  manifestEntries,
  manifestContext,
  context,
}: NormalizeRsbuildEnvironmentProps): EnvironmentConfig {
  const content = manifestEntries.content;
  const { mode } = manifestContext;
  return {
    source: {
      entry: transformManifestEntry(content),
    },
    output: {
      target: 'web',
      injectStyles: isDevMode(mode),
    },
    tools: {
      rspack: {
        output: {
          hotUpdateGlobal,
        },
        plugins: [
          new RspackContentRuntimePlugin({
            getPort: () => context.devServer?.port,
          }),
        ],
      },
    },
  };
}

type RspackContentRuntimePluginOptions = {
  getPort: () => number | undefined;
};

class RspackContentRuntimePlugin implements Rspack.RspackPluginInstance {
  name = 'RspackContentRuntimePlugin';
  #options: RspackContentRuntimePluginOptions | undefined;

  constructor(options: RspackContentRuntimePluginOptions) {
    this.#options = options;
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      const { RuntimeGlobals, Compilation } = compiler.webpack;
      compilation.hooks.runtimeModule.tap(this.name, (module, chunk) => {
        if (module.name === 'load_script' && module.source) {
          const originSource = module.source.source.toString('utf-8');
          const newSource = patchloadScriptCode(RuntimeGlobals.loadScript, originSource);
          module.source.source = Buffer.from(newSource, 'utf-8');
          return;
        }

        if (module.name === 'jsonp_chunk_loading' && module.source) {
          const port = this.#options?.getPort();
          const originSource = module.source.source.toString('utf-8');
          if (port) {
            const newSource = originSource.replaceAll(RuntimeGlobals.publicPath, `"http://localhost:${port}/"`);
            module.source.source = Buffer.from(newSource, 'utf-8');
          }
        }
      });

      compilation.hooks.processAssets.tap(
        {
          name: this.name,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          const { mode, entry } = compiler.options;
          if (!entry || !isDevMode(mode)) return;
          const entries = Object.keys(entry);
          const { RawSource } = compiler.webpack.sources;

          for (const name in assets) {
            const asset = assets[name];
            const entryName = entries.find((item) => name.includes(item));
            if (entryName && name.endsWith('.js')) {
              const oldContent = asset.source() as string;
              const newContent = oldContent.replaceAll(hotUpdateGlobal, `webpackHotUpdateWebExtend_${entryName}`);
              const source = new RawSource(newContent);
              compilation.updateAsset(name, source);
            }
          }
        },
      );
    });
  }
}

function patchloadScriptCode(loadScriptName: string, _: string) {
  const extensionTarget = process.env.WEB_EXTEND_TARGET || '';
  return `${loadScriptName} = async function (url, done, ...args) {
  try {
    if(${extensionTarget.includes('firefox')} && typeof browser === 'object' && browser.runtime) {
      const pathname = new URL(url).pathname; 
      url = browser.runtime.getURL(pathname);
    }
    await import(url);
    done(null);
  } catch (error) {
    done(error);
  }
};`;
}

export { getContentEnvironmentConfig };
