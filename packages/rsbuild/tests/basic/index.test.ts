import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Manifest } from 'webextension-polyfill';
import { existsFile, initRsbuild, readManifestFile } from '../helper.js';
import { config as contentConfig } from './src/content.js';
import { title as popupTitle } from './src/popup/index.js';

const __dirname = import.meta.dirname;

describe('basic for chrome', () => {
  // it('should build successfully in dev mode', async () => {
  //   const rsbuild = await initRsbuild({
  //     cwd: __dirname,
  //     mode: 'development',
  //   });
  //   const { server } = await rsbuild.startDevServer();
  //   const distPath = rsbuild.context.distPath;

  //   return new Promise((resolve, reject) => {
  //     rsbuild.onDevCompileDone(async () => {
  //       const manifest = await readManifestFile(distPath);
  //       const { manifest_version } = manifest;

  //       expect(manifest_version).toBe(3);

  //       server.close();
  //       resolve({});
  //     });
  //   });
  // });

  it('should build successfully in prod mode', async () => {
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'production',
    });
    const result = await rsbuild.build();
    result.close();

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifestFile(distPath);
    const {
      manifest_version,
      background,
      content_scripts = [],
      action,
      options_ui,
      devtools_page,
      chrome_url_overrides,
      sandbox,
      icons,
      side_panel,
    } = manifest;

    expect(manifest_version).toBe(3);

    // icons
    const iconPaths = Object.values(icons || {}) || [];
    expect(iconPaths).toHaveLength(5);
    iconPaths.forEach((iconPath) => {
      expect(existsFile(distPath, iconPath, '.png')).toBeTruthy();
    });

    // background
    expect(
      existsFile(distPath, (background as Manifest.WebExtensionManifestBackgroundC3Type)?.service_worker || '', '.js'),
    ).toBeTruthy();

    // content_scripts
    expect(content_scripts).toHaveLength(3);
    const firstContentScript = content_scripts[0];
    expect(firstContentScript.matches).toEqual(contentConfig.matches);

    for (const contentScript of content_scripts) {
      const { js = [], css = [] } = contentScript;
      js.forEach((jsPath) => {
        expect(existsFile(distPath, jsPath, '.js')).toBeTruthy();
      });
      css.forEach((cssPath) => {
        expect(existsFile(distPath, cssPath, '.css')).toBeTruthy();
      });
    }

    // popup
    expect(existsFile(distPath, action?.default_popup || '', '.html')).toBeTruthy();
    expect(action?.default_title).toBe(popupTitle);
    expect(action?.default_icon).toEqual(icons);

    // options
    expect(existsFile(distPath, options_ui?.page || '', '.html')).toBeTruthy();

    // sandbox
    expect(existsFile(distPath, sandbox?.pages[0] || '', '.html')).toBeTruthy();

    // devtools
    expect(existsFile(distPath, devtools_page || '', '.html')).toBeTruthy();

    // newtab
    expect(existsFile(distPath, chrome_url_overrides?.newtab || '', '.html')).toBeTruthy();

    // bookmarks
    // expect(existsFile(distPath, chrome_url_overrides?.bookmarks || '', '.html')).toBeTruthy();

    // history
    // expect(existsFile(distPath, chrome_url_overrides?.history || '', '.html')).toBeTruthy();

    // sidepanel
    expect(existsFile(distPath, side_panel?.default_path || '', '.html')).toBeTruthy();

    // public
    const publicPath = resolve(__dirname, 'public');
    const files = await readdir(publicPath, { recursive: true });
    for (const file of files) {
      const filePath = resolve(distPath, file);
      expect(existsSync(filePath)).toBeTruthy();
    }
  });
});
