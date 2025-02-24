import type { NormalizeManifestProps } from './types.js';
import { isDevMode } from './common.js';
import type { Manifest } from 'webextension-polyfill';

function polyfillManifestBetweenBrowsers({ manifest, context }: NormalizeManifestProps) {
  if (!manifest) return;
  const { target } = context;

  const { background, side_panel } = manifest;
  if (target.includes('firefox')) {
    manifest.version_name = undefined;
    manifest.sandbox = undefined;

    if (background && 'service_worker' in background) {
      (background as unknown as Manifest.WebExtensionManifestBackgroundC2Type).scripts ??= [background.service_worker];
    }

    if (manifest.chrome_url_overrides) {
      manifest.chrome_url_overrides.history = undefined;
      manifest.chrome_url_overrides.bookmarks = undefined;
    }

    if (side_panel?.default_path) {
      manifest.sidebar_action ??= {
        default_panel: side_panel.default_path,
      };
      manifest.side_panel = undefined;
    }
  }
}

function pollyfillManifestBetweenVersions({ manifest, context }: NormalizeManifestProps) {
  if (!manifest) return;
  const { mode } = context;

  if (isDevMode(mode)) {
    manifest.permissions ||= [];
    if (!manifest.permissions.includes('scripting')) {
      manifest.permissions.push('scripting');
    }

    manifest.host_permissions ||= [];
    if (!manifest.host_permissions.includes('*://*/*')) {
      manifest.host_permissions.push('*://*/*');
    }
  }

  const {
    action,
    manifest_version,
    permissions = [],
    host_permissions,
    web_accessible_resources,
    content_security_policy,
  } = manifest;

  if (manifest_version === 2) {
    if (action) {
      manifest.browser_action ??= action;
      manifest.action = undefined;
    }

    if (content_security_policy && typeof content_security_policy === 'object') {
      manifest.content_security_policy = content_security_policy.extension_pages;
    }

    if (host_permissions) {
      manifest.permissions = [...permissions, ...host_permissions];
      manifest.host_permissions = undefined;
    }

    if (web_accessible_resources && typeof web_accessible_resources[0] === 'object') {
      const resources = (
        web_accessible_resources as Manifest.WebExtensionManifestWebAccessibleResourcesC2ItemType[]
      ).flatMap(({ resources }) => resources);
      manifest.web_accessible_resources = resources;
    }
  }
}

export function polyfillManifest(options: NormalizeManifestProps) {
  polyfillManifestBetweenBrowsers(options);
  pollyfillManifestBetweenVersions(options);
}
