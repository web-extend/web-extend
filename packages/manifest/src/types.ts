export type ExtensionTarget = 'chrome-mv3' | 'firefox-mv2' | 'firefox-mv3' | 'safari-mv3' | 'edge-mv3' | 'opera-mv3';

export type WebExtendEntryType = 'script' | 'style' | 'html' | 'image';

export interface WebExtendEntryDescription {
  name: string;
  import: string | string[];
  html?: string;
}

export interface WebExtendContentEntryDescription extends WebExtendEntryDescription {
  config?: ContentScriptConfig;
}

export type WebExtendEntryInput<T = WebExtendEntryDescription> = T & {
  type: WebExtendEntryType;
};

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
  contents?: WebExtendEntryInput<WebExtendContentEntryDescription>[];
  sandboxes?: WebExtendEntryInput[];
  panels?: WebExtendEntryInput[];
  pages?: WebExtendEntryInput[];
  scripting?: WebExtendEntryInput[];
}

export type WebExtendEntryKey = keyof WebExtendEntries;

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
  manifest?: ExtensionManifest;
  context?: WebExtendContext;
}

export interface NormalizeMainfestEntryProps {
  manifest: ExtensionManifest;
  context: WebExtendContext;
  entries: WebExtendEntries;
}

export interface WriteMainfestEntryItemProps {
  manifest: ExtensionManifest;
  rootPath: string;
  context: WebExtendContext;
  name: string;
  entries: WebExtendEntries;
  output?: WebExtendEntryOutput['output'];
}

export interface WriteManifestFileProps {
  distPath: string;
  manifest: ExtensionManifest;
  mode: string | undefined;
  runtime?: WebExtendRuntime;
}

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

export type WebExtendEntryDirKey = WebExtendEntryKey | 'root' | 'content' | 'sandbox' | 'panel';

export type WebExtendEntriesDir = Record<WebExtendEntryDirKey, string>;

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

export type DeclarativeEntryFileResult = {
  name: string;
  ext: string;
  path: string;
};
