import type { RsbuildConfig, RsbuildContext } from '@rsbuild/core';
import type { ManifestContext, ManifestEntries } from '@web-extend/manifest/types';

export type EnviromentKey = 'web' | 'content' | 'background';

export type NormalizeRsbuildEnvironmentProps = {
  config: RsbuildConfig;
  selfRootPath: string;
  manifestEntries: ManifestEntries;
  context: RsbuildContext;
  manifestContext: ManifestContext;
};
