export interface WebExtendManifest {
  action?: ManifestAction;
  browser_action?: ManifestAction;
  background?: {
    scripts?: string[];
    service_worker?: string;
    type?: 'module' | 'classic';
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
  matches?: string[];
  exclude_matches?: string[];
  js?: string[];
  css?: string[];
  run_at?: 'document_start' | 'document_end' | 'document_idle' | string;
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

type IconPath = Record<string, string> | string;
