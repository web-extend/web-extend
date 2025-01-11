import type { Dirent } from 'node:fs';
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
  | 'background'
  | 'content'
  | 'popup'
  | 'options'
  | 'devtools'
  | 'sandbox'
  | 'icons'
  | 'overrides'
  | 'sidepanel';

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
  match: (entryName: string) => boolean;
  normalize: (props: NormalizeMainfestEntryProps) => MaybePromise<void>;
  read: (manifest?: WebExtensionManifest) => MaybePromise<ManifestEntryInput | null>;
  write: (props: WriteMainfestEntryItemProps) => MaybePromise<void>;
  onAfterBuild?: (props: WriteManifestFileProps) => MaybePromise<void>;
}

export interface NormalizeManifestProps {
  rootPath: string;
  selfRootPath: string;
  mode: string | undefined;
  manifest: WebExtensionManifest;
  srcDir: string;
  target: ExtensionTarget;
}

export interface NormalizeMainfestEntryProps {
  srcPath: string;
  selfRootPath: string;
  mode: string | undefined;
  manifest: WebExtensionManifest;
  target: ExtensionTarget;
  files: Dirent[];
}

export interface WriteMainfestEntriesProps {
  normalizedManifest: WebExtensionManifest;
  manifest: WebExtensionManifest;
  rootPath: string;
  entry: ManifestEntryOutput;
}

export interface WriteMainfestEntryItemProps extends Omit<WriteMainfestEntriesProps, 'entry'> {
  name: string;
  input?: ManifestEntryItem['input'];
  output?: ManifestEntryItem['output'];
}

export interface WriteManifestFileProps {
  selfRootPath: string;
  distPath: string;
  manifest: WebExtensionManifest;
  mode: string | undefined;
}
