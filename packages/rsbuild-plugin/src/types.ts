import type { RsbuildConfig, RsbuildContext } from '@rsbuild/core';
import type { WebExtendContext, ManifestEntries, WebExtendCommonConfig } from '@web-extend/manifest/types';

export type EnviromentKey = 'web' | 'background';

export type NormalizeRsbuildEnvironmentProps = {
  config: RsbuildConfig;
  selfRootPath: string;
  manifestEntries: ManifestEntries;
  context: RsbuildContext;
  manifestContext: WebExtendContext;
};

export type PluginWebExtendOptions = WebExtendCommonConfig;
