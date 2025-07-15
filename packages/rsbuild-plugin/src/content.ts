import type { Rspack } from '@rsbuild/core';

export const hotUpdateGlobal = 'webpackHotUpdateWebExtend';

type RspackContentRuntimePluginOptions = {
  getPort?: () => number | undefined;
  target?: string;
  contentEntryNames?: string[];
};

class ContentRuntimePlugin implements Rspack.RspackPluginInstance {
  name = 'ContentRuntimePlugin';
  #options: RspackContentRuntimePluginOptions;

  constructor(options: RspackContentRuntimePluginOptions = {}) {
    this.#options = options;
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      const { RuntimeGlobals, Compilation } = compiler.webpack;
      compilation.hooks.runtimeModule.tap(this.name, (module, chunk) => {
        const { contentEntryNames = [], target = '', getPort } = this.#options;
        const entryName = chunk.getEntryOptions()?.name;
        if (!entryName || !contentEntryNames.includes(entryName)) return;

        if (module.name === 'load_script' && module.source) {
          const originSource = module.source.source.toString('utf-8');
          const newSource = patchloadScriptCode(RuntimeGlobals.loadScript, originSource, target);
          module.source.source = Buffer.from(newSource, 'utf-8');
          return;
        }

        if (module.name === 'jsonp_chunk_loading' && module.source) {
          const port = getPort?.();
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
          const { RawSource } = compiler.webpack.sources;
          const contentEntryNames = this.#options.contentEntryNames || [];
          contentEntryNames.sort((a, b) => b.length - a.length);

          for (const name in assets) {
            if (!name.endsWith('.js')) continue;
            const entryName = contentEntryNames.find((item) => name.includes(item));
            if (entryName) {
              const oldContent = assets[name].source() as string;
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

export { ContentRuntimePlugin };
