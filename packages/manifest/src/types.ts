import type { Manifest } from 'webextension-polyfill';

export type ExtensionTarget = 'chrome-mv3' | 'firefox-mv2' | 'firefox-mv3' | 'safari-mv3' | 'edge-mv3' | 'opera-mv3';

export type { Manifest };

export interface WebExtensionManifest extends Manifest.WebExtensionManifest {
  sandbox?: ManifestSandbox;
  side_panel?: ManifestSidePanel;
  chrome_url_overrides?: ManifestChromeUrlOverrides;
}

interface ManifestChromeUrlOverrides {
  newtab?: string;
  history?: string;
  bookmarks?: string;
}

interface ManifestIcons {
  [size: number]: string;
}

interface ManifestAction {
  default_icon?: ManifestIcons;
  default_title?: string;
  default_popup?: string;
}

interface ManifestContentScript {
  matches: string[];
  exclude_matches?: string[];
  js?: string[];
  css?: string[];
  run_at?: 'document_start' | 'document_end' | 'document_idle';
  all_frames?: boolean;
  match_about_blank?: boolean;
  include_globs?: string[];
  exclude_globs?: string[];
  world?: 'ISOLATED' | 'MAIN';
}

export type ContentScriptConfig = Omit<ManifestContentScript, 'js'>;

interface ManifestSandbox {
  pages: string[];
  content_security_policy?: string;
}

interface ManifestCommandItem {
  suggested_key?: {
    default?: string;
    windows?: string;
    mac?: string;
    chromeos?: string;
    linux?: string;
  };
  description?: string;
  global?: boolean;
}

interface ManifestSidePanel {
  default_path?: string;
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

export interface CustomManifest {
  action?: ManifestAction;
  background?: {
    service_worker?: string;
    type?: 'module';
  };
  chrome_url_overrides?: ManifestChromeUrlOverrides;
  commands?: Record<string, ManifestCommandItem>;
  content_scripts?: ManifestContentScript[];
  content_security_policy?: {
    extension_pages?: string;
    sandbox?: string;
  };
  description?: string;
  default_locale?: string;
  devtools_page?: string;
  homepage_url?: string;
  host_permissions?: string[];
  icons?: ManifestIcons;
  manifest_version?: number;
  minimum_chrome_version?: string;
  name?: string;
  options_page?: string;
  options_ui?: {
    page?: string;
    open_in_tab?: boolean;
  };
  permissions?: string[];
  sandbox?: ManifestSandbox;
  side_panel?: ManifestSidePanel;
  version?: string;
  version_name?: string;
  web_accessible_resources?:
    | {
        resources: string[];
        matches?: string[];
      }
    | string[];
  [key: string]: unknown; // allow other custom fields
}
