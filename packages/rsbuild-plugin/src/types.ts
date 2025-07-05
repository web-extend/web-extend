import type { RsbuildConfig, RsbuildContext } from '@rsbuild/core';
import type { ManifestContext, ManifestEntries, WebExtendCommonConfig } from '@web-extend/manifest/types';

export type EnviromentKey = 'web' | 'background';

export type NormalizeRsbuildEnvironmentProps = {
  config: RsbuildConfig;
  selfRootPath: string;
  manifestEntries: ManifestEntries;
  context: RsbuildContext;
  manifestContext: ManifestContext;
};

export type PluginWebExtendOptions = WebExtendCommonConfig;
