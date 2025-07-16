import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { initRsbuild, readManifestFile, validateDistFile } from '../helper.js';
import { config as contentConfig } from './src/content.js';

const __dirname = import.meta.dirname;

describe('test build for chrome', () => {
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
      permissions,
    } = manifest;

    expect(manifest_version).toBe(3);

    // icons
    const iconPaths = Object.values(icons || {}) || [];
    expect(iconPaths).toHaveLength(5);
    iconPaths.forEach((iconPath) => {
      expect(validateDistFile(distPath, iconPath, '.png')).toBeTruthy();
    });

    // background
    expect(validateDistFile(distPath, background?.service_worker || '', '.js')).toBeTruthy();

    // content_scripts
    expect(content_scripts).toHaveLength(3);
    const firstContentScript = content_scripts[0];
    expect(firstContentScript.matches).toEqual(contentConfig.matches);
    for (const contentScript of content_scripts) {
      const { js = [], css = [] } = contentScript;
      js.forEach((jsPath) => {
        expect(validateDistFile(distPath, jsPath, '.js')).toBeTruthy();
      });
      css.forEach((cssPath) => {
        expect(validateDistFile(distPath, cssPath, '.css')).toBeTruthy();
      });
    }

    // popup
    expect(action?.default_popup).toBe('popup.html');
    expect(validateDistFile(distPath, action?.default_popup || '', '.html')).toBeTruthy();
    // expect(action?.default_title).toBe(popupTitle);
    expect(action?.default_icon).toEqual(icons);

    // options
    expect(options_ui?.page).toBe('options.html');
    expect(validateDistFile(distPath, options_ui?.page || '', '.html')).toBeTruthy();

    // sandbox
    expect(sandbox?.pages.length).toBe(2);
    expect(sandbox?.pages[0]).toBe('sandbox.html');
    expect(sandbox?.pages[1]).toBe('sandboxes/sandbox1.html');
    sandbox?.pages.forEach((page) => {
      expect(validateDistFile(distPath, page, '.html')).toBeTruthy();
    });

    // devtools
    expect(devtools_page).toBe('devtools.html');
    expect(validateDistFile(distPath, devtools_page || '', '.html')).toBeTruthy();

    // panel
    expect(validateDistFile(distPath, 'panel.html', '.html')).toBeTruthy();
    expect(validateDistFile(distPath, 'panels/panel1.html', '.html')).toBeTruthy();

    // newtab
    expect(chrome_url_overrides?.newtab).toBe('newtab.html');
    expect(validateDistFile(distPath, chrome_url_overrides?.newtab || '', '.html')).toBeTruthy();

    // bookmarks
    // expect(validateDistFile(distPath, chrome_url_overrides?.bookmarks || '', '.html')).toBeTruthy();

    // history
    // expect(validateDistFile(distPath, chrome_url_overrides?.history || '', '.html')).toBeTruthy();

    // sidepanel
    expect(side_panel?.default_path).toBe('sidepanel.html');
    expect(validateDistFile(distPath, side_panel?.default_path || '', '.html')).toBeTruthy();
    expect(permissions).toContain('sidePanel');

    // scripting
    expect(validateDistFile(distPath, 'scripting/injected-script.js', '.js')).toBeTruthy();
    expect(validateDistFile(distPath, 'scripting/injected-style.css', '.css')).toBeTruthy();

    // pages
    expect(validateDistFile(distPath, 'pages/page1.html', '.html')).toBeTruthy();
    expect(validateDistFile(distPath, 'pages/page2.html', '.html')).toBeTruthy();

    // public
    const publicPath = resolve(__dirname, 'public');
    const files = await readdir(publicPath, { recursive: true });
    for (const file of files) {
      const filePath = resolve(distPath, file);
      expect(existsSync(filePath)).toBeTruthy();
    }
  });
});
