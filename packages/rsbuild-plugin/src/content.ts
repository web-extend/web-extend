import type { EnvironmentConfig, RsbuildEntry, Rspack } from '@rsbuild/core';
import { getCssDistPath, getJsDistPath, isDevMode, transformManifestEntry } from './helper.js';
import type { NormalizeRsbuildEnvironmentProps } from './types.js';

const hotUpdateGlobal = 'webpackHotUpdateWebExtend';

function getContentEnvironmentConfig({
  manifestEntries,
  manifestContext,
  context,
}: NormalizeRsbuildEnvironmentProps): EnvironmentConfig | undefined {
  const content = manifestEntries.content;
  const { mode } = manifestContext;
  const entry = transformManifestEntry(content);
  if (!content || !entry) return;

  return {
    source: {
      entry,
    },
    output: {
      target: 'web',
      injectStyles: isDevMode(mode),
      distPath: {
        js: '',
        css: '',
      },
      filename: {
        js: getJsDistPath(content),
        css: getCssDistPath(content),
      },
    },
    tools: {
      rspack: {
        output: {
          hotUpdateGlobal,
        },
        plugins: [
          new ContentRuntimePlugin({
            getPort: () => context.devServer?.port,
            target: manifestContext.target,
            mode: manifestContext.mode,
            entry: entry || {},
          }),
        ],
      },
    },
  };
}

type RspackContentRuntimePluginOptions = {
  getPort: () => number | undefined;
  target: string;
  entry: RsbuildEntry;
  mode: string;
};

class ContentRuntimePlugin implements Rspack.RspackPluginInstance {
  name = 'ContentRuntimePlugin';
  #options: RspackContentRuntimePluginOptions | undefined;

  constructor(options: RspackContentRuntimePluginOptions) {
    this.#options = options;
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      const { RuntimeGlobals, Compilation } = compiler.webpack;
      compilation.hooks.runtimeModule.tap(this.name, (module, chunk) => {
        const entryName = chunk.getEntryOptions()?.name;
        if (!entryName || !isContentEntry(entryName)) return;

        const { target = '' } = this.#options || {};
        if (module.name === 'load_script' && module.source) {
          const originSource = module.source.source.toString('utf-8');
          const newSource = patchloadScriptCode(RuntimeGlobals.loadScript, originSource, target);
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
          const { entry } = this.#options || {};
          if (!entry) return;

          const entries = Object.keys(entry);
          const { RawSource } = compiler.webpack.sources;

          for (const name in assets) {
            const asset = assets[name];
            const entryName = entries.find((item) => name.includes(item));
            if (name.endsWith('.js') && entryName && isContentEntry(entryName) && asset) {
              const oldContent = asset.source() as string;
              const newContent = oldContent.replaceAll(hotUpdateGlobal, `${hotUpdateGlobal}_${entryName}`);
              const source = new RawSource(newContent);
              compilation.updateAsset(name, source);
            }
          }
        },
      );
    });
  }
}

function isContentEntry(entryName: string) {
  return entryName.startsWith('content');
}

function patchloadScriptCode(loadScriptName: string, loadScriptCode: string, target: string) {
  return `${loadScriptCode.replace(loadScriptName, 'let originLoadScript')}
${loadScriptName} = async function (url, done, ...args) {
  try {
    if(${target.includes('firefox')}) {
      if (typeof browser !== 'object' || !browser.runtime) {
        return originLoadScript(url, done, ...args);
      }
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
