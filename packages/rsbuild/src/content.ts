import type { Rspack } from '@rsbuild/core';

const pluginName = 'RspackContentRuntimePlugin';

type PluginOptions = {
  getPort: () => number | undefined;
};

class RspackContentRuntimePlugin {
  private _options: PluginOptions | undefined;

  constructor(options: PluginOptions) {
    this._options = options;
  }

  apply(compiler: Rspack.Compiler) {
    const { RuntimeGlobals } = compiler.webpack;
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.runtimeModule.tap(pluginName, (module) => {
        if (module.name === 'load_script' && module.source) {
          const newSource = `${RuntimeGlobals.loadScript} = async function (url, done) {
            try {
              await import(url);
              done(null);
            } catch (error) {
              done(error) 
            }
          };`;
          module.source.source = Buffer.from(newSource, 'utf-8');
        }

        if (module.name === 'jsonp_chunk_loading' && module.source) {
          const port = this._options?.getPort();
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

export { RspackContentRuntimePlugin };
