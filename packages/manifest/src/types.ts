import type { Manifest } from 'webextension-polyfill';

export type ExtensionTarget = 'chrome-mv3' | 'firefox-mv2' | 'firefox-mv3' | 'safari-mv3' | 'edge-mv3' | 'opera-mv3';

export interface WebExtensionManifest extends Manifest.WebExtensionManifest {
  sandbox?: {
    pages: string[];
    content_security_policy?: string;
  };
  side_panel?: {
    default_path?: string;
  };
  chrome_url_overrides?: {
    newtab?: string;
    history?: string;
    bookmarks?: string;
  };
}

export interface ContentScriptConfig {
  matches: string[];
  exclude_matches?: string[];
  css?: string[];
  run_at?: 'document_start' | 'document_end' | 'document_idle';
  all_frames?: boolean;
  match_about_blank?: boolean;
  include_globs?: string[];
  exclude_globs?: string[];
  world?: 'ISOLATED' | 'MAIN';
}

export type PageToOverride = 'newtab' | 'history' | 'bookmarks';

export type ManifestEntryKey =
  | 'icons'
  | 'background'
  | 'content'
  | 'popup'
  | 'options'
  | 'sidepanel'
  | 'devtools'
  | 'panel'
  | 'sandbox'
  | PageToOverride;

interface ManifestEntryItem {
  input: string[];
  output: string[];
  html?: boolean;
}

export type ManifestEntryInput = Record<string, Omit<ManifestEntryItem, 'output'>>;
export type ManifestEntryOutput = Record<string, Pick<ManifestEntryItem, 'input' | 'output'>>;

export type MaybePromise<T = unknown> = T | Promise<T>;

export interface ManifestEntryProcessor {
  key: ManifestEntryKey;
  matchDeclarativeEntryFile?: (file: string) => null | { name: string; ext: string };
  normalize?: (props: NormalizeMainfestEntryProps) => MaybePromise<void>;
  readEntry?: (props: ReadManifestEntryItemProps) => MaybePromise<ManifestEntryInput | null>;
  writeEntry?: (props: WriteMainfestEntryItemProps) => MaybePromise<void>;
  onAfterBuild?: (props: WriteManifestFileProps) => MaybePromise<void>;
}

interface ReadManifestEntryItemProps {
  manifest: WebExtensionManifest;
  context: ManifestContext;
}

export interface ManifestContext {
  target: ExtensionTarget;
  mode: string;
  rootPath: string;
  srcDir: string;
  outDir: string;
  runtime?: ManifestRuntime;
}

export interface ManifestRuntime {
  background?: string;
  contentLoad?: string;
  contentBridge?: string;
}

export interface NormalizeManifestProps {
  manifest?: WebExtensionManifest;
  context: ManifestContext;
}

export interface NormalizeMainfestEntryProps {
  manifest: WebExtensionManifest;
  files: string[];
  context: ManifestContext;
}

export interface WriteMainfestEntriesProps {
  normalizedManifest: WebExtensionManifest;
  manifest: WebExtensionManifest;
  rootPath: string;
  entry: ManifestEntryOutput;
}

export interface WriteMainfestEntryItemProps extends Omit<WriteMainfestEntriesProps, 'entry'> {
  context: ManifestContext;
  name: string;
  input?: ManifestEntryItem['input'];
  output?: ManifestEntryItem['output'];
}

export interface WriteManifestFileProps {
  distPath: string;
  manifest: WebExtensionManifest;
  mode: string | undefined;
  runtime?: ManifestRuntime;
}

export type ManifestEntries = {
  [key in ManifestEntryKey]?: ManifestEntryInput;
};
