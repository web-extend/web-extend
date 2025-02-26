import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Manifest } from 'webextension-polyfill';
import { initRsbuild, readManifestFile, validateDistFile } from '../helper.js';

const __dirname = import.meta.dirname;

describe('test build for firefox', () => {
  it('should build firefox-mv3-prod successfully', async () => {
    const defaultIcon = './src/assets/icon-128.png';
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'production',
      pluginOptions: {
        target: 'firefox-mv3',
        manifest: {
          action: {
            default_icon: defaultIcon,
          },
        },
      },
    });
    const result = await rsbuild.build();
    await result.close();

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifestFile(distPath);
    const {
      manifest_version,
      background,
      sidebar_action,
      action,
      permissions = [],
    } = manifest as Manifest.WebExtensionManifest;

    expect(manifest_version).toBe(3);

    const scripts = background && 'scripts' in background ? background.scripts : [];
    expect(validateDistFile(distPath, scripts[0] || '', '.js')).toBeTruthy();

    const sidepanel = sidebar_action?.default_panel;
    expect(validateDistFile(distPath, sidepanel || '', '.html')).toBeTruthy();
    expect(permissions).not.toContain('sidePanel');

    expect(action?.default_icon).toMatch(basename(defaultIcon, '.png'));
  });

  it('should build firefox-mv2-prod successfully', async () => {
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'production',
      pluginOptions: {
        target: 'firefox-mv2',
      },
    });
    const result = await rsbuild.build();
    await result.close();

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifestFile(distPath);
    const { manifest_version, browser_action, icons, host_permissions } = manifest as Manifest.WebExtensionManifest;

    expect(manifest_version).toBe(2);
    expect(host_permissions).toBeUndefined();
    expect(validateDistFile(distPath, browser_action?.default_popup || '', '.html')).toBeTruthy();
    expect(browser_action?.default_icon).toEqual(icons);
  });
});
