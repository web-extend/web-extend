import { describe, expect, it } from 'vitest';
import type { Manifest } from 'webextension-polyfill';
import { existsFile, initRsbuild, readManifest } from '../helper.js';
import { basename } from 'node:path';

const __dirname = import.meta.dirname;

describe('basic for firefox', () => {
  it('should build firefox-mv3-prod successfully', async () => {
    const defaultIcon = './src/assets/icon-128.png';
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'production',
      outDir: 'dist/firefox-mv3-prod',
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
    result.close();

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifest(distPath);
    const { manifest_version, background, sidebar_action, action } = manifest as Manifest.WebExtensionManifest;

    expect(manifest_version).toBe(3);

    const scripts = background && 'scripts' in background ? background.scripts : [];
    expect(existsFile(distPath, scripts[0] || '', 'js')).toBeTruthy();

    const sidepanel = sidebar_action?.default_panel;
    expect(existsFile(distPath, sidepanel || '', 'html')).toBeTruthy();

    expect(action?.default_icon).toMatch(basename(defaultIcon));
  });

  it('should build firefox-mv2-prod successfully', async () => {
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'production',
      outDir: 'dist/firefox-mv2-prod',
      pluginOptions: {
        target: 'firefox-mv2',
      },
    });
    const result = await rsbuild.build();
    result.close();

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifest(distPath);
    const { manifest_version, browser_action, icons } = manifest as Manifest.WebExtensionManifest;

    expect(manifest_version).toBe(2);

    expect(existsFile(distPath, browser_action?.default_popup || '', 'html')).toBeTruthy();
    expect(browser_action?.default_icon).toEqual(icons);
  });
});
