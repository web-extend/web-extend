import type { ContentScriptConfig, WebExtendManifest } from './browser.js';

export type WebExtendTarget = 'chrome-mv3' | 'firefox-mv2' | 'firefox-mv3' | 'safari-mv3' | 'edge-mv3' | 'opera-mv3';

export type WebExtendEntryType = 'script' | 'style' | 'html' | 'image';

export interface WebExtendEntryInput {
  name: string;
  import: string | string[];
  html?: string;
  type?: WebExtendEntryType; // default is html
  config?: ContentScriptConfig; // only for content entry
}

export type WebExtendEntryOutput = {
  name: string;
  output: string[];
};

export interface WebExtendEntries {
  icons?: WebExtendEntryInput;
  background?: WebExtendEntryInput;
  popup?: WebExtendEntryInput;
  options?: WebExtendEntryInput;
  sidepanel?: WebExtendEntryInput;
  devtools?: WebExtendEntryInput;
  newtab?: WebExtendEntryInput;
  history?: WebExtendEntryInput;
  bookmarks?: WebExtendEntryInput;
  contents?: WebExtendEntryInput[];
  sandboxes?: WebExtendEntryInput[];
  panels?: WebExtendEntryInput[];
  pages?: WebExtendEntryInput[];
  scripting?: WebExtendEntryInput[];
}

export type WebExtendEntryKey = keyof WebExtendEntries;
export type MaybePromise<T = unknown> = T | Promise<T>;

export interface ManifestEntryProcessor {
  key: WebExtendEntryKey;
  matchDeclarativeEntry: (
    file: string,
    context: WebExtendContext,
  ) => null | { name: string; ext: string; size?: number };
  normalizeEntry?: (props: NormalizeMainfestEntryProps) => MaybePromise<void>;
  writeEntry?: (props: WriteMainfestEntryItemProps) => MaybePromise<void>;
  onAfterBuild?: (props: WriteManifestFileProps) => MaybePromise<void>;
}

export interface WebExtendRuntime {
  background?: string;
  contentBridge?: string;
}

export interface NormalizeManifestProps {
  manifest?: WebExtendManifest;
  context?: WebExtendContext;
}

export interface NormalizeMainfestEntryProps {
  manifest: WebExtendManifest;
  context: WebExtendContext;
  entries: WebExtendEntries;
}

export interface WriteMainfestEntryItemProps {
  manifest: WebExtendManifest;
  rootPath: string;
  context: WebExtendContext;
  name: string;
  entries: WebExtendEntries;
  output?: WebExtendEntryOutput['output'];
}

export interface WriteManifestFileProps {
  distPath: string;
  manifest: WebExtendManifest;
  mode: string | undefined;
  runtime?: WebExtendRuntime;
}

export type WebExtendEntryDirKey = WebExtendEntryKey | 'root' | 'content' | 'sandbox' | 'panel';

export type WebExtendEntriesDir = Record<WebExtendEntryDirKey, string>;

export interface WebExtendContext {
  target: WebExtendTarget;
  mode: string;
  rootPath: string;
  outDir: string;
  publicDir: string;
  entriesDir: WebExtendEntriesDir;
  runtime?: WebExtendRuntime;
}

export interface WebExtendCommonConfig<T = WebExtendManifest> {
  manifest?: T | ((props: { target: WebExtendTarget; mode: string }) => T);
  target?: WebExtendTarget;
  /**
   * @deprecated Use `entriesDir` instead.
   */
  srcDir?: string;
  outDir?: string;
  buildDirTemplate?: string;
  publicDir?: string;
  entriesDir?: string;
}

export type NormalizeContextOptions = Partial<Pick<WebExtendContext, 'rootPath' | 'mode' | 'runtime'>> &
  WebExtendCommonConfig;

export type DeclarativeEntryFileResult = {
  name: string;
  ext: string;
  path: string;
};
