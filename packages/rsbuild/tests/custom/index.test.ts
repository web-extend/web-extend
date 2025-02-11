import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Manifest } from 'webextension-polyfill';
import { initRsbuild, readManifestFile, validateDistFile } from '../helper.js';

const __dirname = import.meta.dirname;

describe('custom', () => {
  it('should throw error when manifest.name and manifest.version are not provided', async () => {
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'production',
    });
    await expect(rsbuild.build()).rejects.toThrowError(/Required/);
  });

  it('should build successfully with custom background service worker', async () => {
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'production',
      pluginOptions: {
        manifest: {
          name: 'custom',
          version: '1.0.0',
          background: {
            service_worker: './src/custom-background.ts',
          },
          options_page: './src/options.ts',
        },
      },
    });
    await rsbuild.build();

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifestFile(distPath);
    const { background, options_page } = manifest;

    const { service_worker } = background as Manifest.WebExtensionManifestBackgroundC3Type;
    const serviceWorkerContent = await readFile(resolve(distPath, service_worker), 'utf-8');
    expect(serviceWorkerContent).toContain('custom-background');

    expect(validateDistFile(distPath, options_page || '', '.html')).toBeTruthy();
  });
});
