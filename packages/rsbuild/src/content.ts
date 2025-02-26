import type { Rspack } from '@rsbuild/core';

const pluginName = 'RspackContentRuntimePlugin';

type PluginOptions = {
  getPort: () => number | undefined;
  target: string;
};

class RspackContentRuntimePlugin {
  #options: PluginOptions | undefined;

  constructor(options: PluginOptions) {
    this.#options = options;
  }

  apply(compiler: Rspack.Compiler) {
    const { RuntimeGlobals } = compiler.webpack;
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.runtimeModule.tap(pluginName, (module) => {
        if (module.name === 'load_script' && module.source) {
          const target = this.#options?.target || '';
          const originSource = module.source.source.toString('utf-8');
          const newSource = patchloadScriptCode(RuntimeGlobals.loadScript, originSource, target);
          module.source.source = Buffer.from(newSource, 'utf-8');
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

export { RspackContentRuntimePlugin };
