export type ExtensionTarget = 'chrome-mv3' | 'firefox-mv2' | 'firefox-mv3' | 'safari-mv3' | 'edge-mv3' | 'opera-mv3';

export type WebExtendEntryKey =
  | 'icons'
  | 'background'
  | 'content'
  | 'contents'
  | 'popup'
  | 'options'
  | 'sidepanel'
  | 'devtools'
  | 'panel'
  | 'panels'
  | 'sandbox'
  | 'sandboxes'
  | 'newtab'
  | 'history'
  | 'bookmarks'
  | 'scripting'
  | 'pages';

export interface ExtensionManifest {
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
  sidebar_action?: ManifestSidebarActionType;
  version?: string;
  version_name?: string;
  web_accessible_resources?: ManifestWebAccessibleResourcesC2ItemType[] | string[];
  [key: string]: unknown; // allow other custom fields
}

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

export type ManifestEntryType = 'script' | 'style' | 'html' | 'image';

export interface WebExtendEntryDescription {
  input: string[];
  output: string[];
  entryType: ManifestEntryType; // default is 'html'
}

export type ManifestEntryInput = Record<string, Omit<WebExtendEntryDescription, 'output'>>;
export type ManifestEntryOutput = Record<string, Pick<WebExtendEntryDescription, 'input' | 'output'>>;

export type MaybePromise<T = unknown> = T | Promise<T>;

export interface ManifestEntryProcessor {
  key: WebExtendEntryKey;
  matchDeclarativeEntry: (
    file: string,
    context: WebExtendContext,
  ) => null | { name: string; ext: string; size?: number };
  normalizeEntry?: (props: NormalizeMainfestEntryProps) => MaybePromise<void>;
  readEntry?: (props: ReadManifestEntryItemProps) => MaybePromise<ManifestEntryInput | null>;
  writeEntry?: (props: WriteMainfestEntryItemProps) => MaybePromise<void>;
  onAfterBuild?: (props: WriteManifestFileProps) => MaybePromise<void>;
}

interface ReadManifestEntryItemProps {
  manifest: ExtensionManifest;
  context: WebExtendContext;
}

export interface WebExtendRuntime {
  background?: string;
  contentBridge?: string;
}

export interface NormalizeManifestProps {
  manifest?: ExtensionManifest;
  context: WebExtendContext;
}

export interface NormalizeMainfestEntryProps {
  manifest: ExtensionManifest;
  context: WebExtendContext;
}

export interface WriteMainfestEntriesProps {
  normalizedManifest: ExtensionManifest;
  manifest: ExtensionManifest;
  rootPath: string;
  entry: ManifestEntryOutput;
}

export interface WriteMainfestEntryItemProps extends Omit<WriteMainfestEntriesProps, 'entry'> {
  context: WebExtendContext;
  name: string;
  input?: WebExtendEntryDescription['input'];
  output?: WebExtendEntryDescription['output'];
}

export interface WriteManifestFileProps {
  distPath: string;
  manifest: ExtensionManifest;
  mode: string | undefined;
  runtime?: WebExtendRuntime;
}

export type WebExtendEntries = {
  [key in WebExtendEntryKey]?: ManifestEntryInput;
};

type IconPath = Record<string, string> | string;

interface ManifestSidebarActionType {
  default_title?: string;
  default_icon?: IconPath;
  browser_style?: boolean;
  default_panel: string;
  open_at_install?: boolean;
}

export type ManifestWebAccessibleResourcesC2ItemType = {
  resources: string[];
  matches?: string[];
};

export type WebExtendEntriesDir = Record<'root' | WebExtendEntryKey, string>;

export interface WebExtendContext {
  target: ExtensionTarget;
  mode: string;
  rootPath: string;
  outDir: string;
  publicDir: string;
  entriesDir: WebExtendEntriesDir;
  runtime?: WebExtendRuntime;
}

export interface WebExtendCommonConfig {
  manifest?: ExtensionManifest | ((props: { target: ExtensionTarget; mode: string }) => ExtensionManifest);
  target?: ExtensionTarget;
  /**
   * @deprecated Use `entriesDir` instead.
   */
  srcDir?: string;
  outDir?: string;
  buildDirTemplate?: string;
  publicDir?: string;
  entriesDir?: Partial<WebExtendEntriesDir> | string;
}

export type NormalizeContextOptions = Partial<Pick<WebExtendContext, 'rootPath' | 'mode' | 'runtime'>> &
  WebExtendCommonConfig;
