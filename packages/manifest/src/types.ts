import type { Manifest } from 'webextension-polyfill';

export type ExtensionTarget = 'chrome-mv3' | 'firefox-mv2' | 'firefox-mv3' | 'safari-mv3' | 'edge-mv3' | 'opera-mv3';

export interface ManifestChromeUrlOverrides {
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

export interface ManifestContentScript {
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

export type ManifestEntryKey =
  | 'icons'
  | 'background'
  | 'content'
  | 'contents'
  | 'popup'
  | 'options'
  | 'sidepanel'
  | 'devtools'
  | 'panel'
  | 'sandbox'
  | 'sandboxes'
  | 'newtab'
  | 'history'
  | 'bookmarks'
  | 'scripting'
  | 'pages';

export interface ManifestEntryItem {
  input: string[];
  output: string[];
  entryType: 'script' | 'style' | 'html' | 'image'; // default is 'html'
}

export type ManifestEntryInput = Record<string, Omit<ManifestEntryItem, 'output'>>;
export type ManifestEntryOutput = Record<string, Pick<ManifestEntryItem, 'input' | 'output'>>;

export type MaybePromise<T = unknown> = T | Promise<T>;

export interface ManifestEntryProcessor {
  key: ManifestEntryKey;
  matchDeclarativeEntry?: (file: string) => null | { name: string; ext: string };
  normalizeEntry?: (props: NormalizeMainfestEntryProps) => MaybePromise<void>;
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
  publicDir: string;
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

type IconPath = Record<string, string> | string;

interface WebExtensionManifestSidebarActionType {
  default_title?: string;
  default_icon?: IconPath;
  browser_style?: boolean;
  default_panel: string;
  open_at_install?: boolean;
}

export interface WebExtensionManifest {
  action?: ManifestAction;
  browser_action?: ManifestAction;
  background?: {
    scripts?: string[];
    service_worker?: string;
    type?: 'module';
  };
  chrome_url_overrides?: ManifestChromeUrlOverrides;
  commands?: Record<string, ManifestCommandItem>;
  content_scripts?: ManifestContentScript[];
  content_security_policy?:
    | {
        extension_pages?: string;
        sandbox?: string;
      }
    | string;
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
  sidebar_action?: WebExtensionManifestSidebarActionType;
  version?: string;
  version_name?: string;
  web_accessible_resources?: WebExtensionManifestWebAccessibleResourcesC2ItemType[] | string[];
  [key: string]: unknown; // allow other custom fields
}

export type WebExtensionManifestWebAccessibleResourcesC2ItemType = {
  resources: string[];
  matches?: string[];
};

export interface WebExtendCommonConfig {
  manifest?: WebExtensionManifest | ((props: { target: ExtensionTarget; mode: string }) => WebExtensionManifest);
  target?: ExtensionTarget;
  srcDir?: string;
  outDir?: string;
  buildDirTemplate?: string;
  publicDir?: string;
  entriesDir?: Record<string, string>;
}
