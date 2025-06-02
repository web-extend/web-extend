import type { RsbuildConfig, RsbuildContext } from '@rsbuild/core';
import type { ManifestContext, ManifestEntries, CustomMainfest } from '@web-extend/manifest/types';
import type { ExtensionTarget } from '@web-extend/manifest/types';

export type EnviromentKey = 'web' | 'content' | 'background';

export type NormalizeRsbuildEnvironmentProps = {
  config: RsbuildConfig;
  selfRootPath: string;
  manifestEntries: ManifestEntries;
  context: RsbuildContext;
  manifestContext: ManifestContext;
};

export type PluginWebExtendOptions<T = CustomMainfest> = {
  manifest?: T | ((props: { target: ExtensionTarget; mode: string }) => T);
  target?: ExtensionTarget;
  srcDir?: string;
  outDir?: string;
};
