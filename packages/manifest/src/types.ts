import type { Manifest } from 'webextension-polyfill';

export type ExtensionTarget = 'chrome-mv3' | 'firefox-mv2' | 'firefox-mv3' | 'safari-mv3' | 'edge-mv3' | 'opera-mv3';

export interface WebExtensionManifest extends Manifest.WebExtensionManifest {
  // Firefox doesn't support sandbox
  sandbox?: {
    pages: string[];
    content_security_policy?: string;
  };
  // Firefox doesn't support side_panel, but supports sidebar_action
  side_panel?: {
    default_path?: string;
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
  | 'devtools'
  | 'sandbox'
  | 'sidepanel'
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
  matchDeclarativeEntryFile: (file: string) => null | { name: string; ext: string };
  matchEntryName: (name: string) => boolean;
  normalize: (props: NormalizeMainfestEntryProps) => MaybePromise<void>;
  read: (props: {
    manifest: WebExtensionManifest;
    context: ManifestContext;
  }) => MaybePromise<ManifestEntryInput | null>;
  write: (props: WriteMainfestEntryItemProps) => MaybePromise<void>;
  onAfterBuild?: (props: WriteManifestFileProps) => MaybePromise<void>;
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

export type ManifestEnties = {
  [key in ManifestEntryKey]?: ManifestEntryInput;
};
