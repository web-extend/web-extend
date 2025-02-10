import { describe, expect, it } from 'vitest';
import { initRsbuild, readManifestFile } from '../helper.js';
import type { Manifest } from 'webextension-polyfill';

describe('test dev for chrome', () => {
  it('should build successfully in dev mode', async () => {
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'development',
    });
    const { server } = await rsbuild.startDevServer();
    const distPath = rsbuild.context.distPath;

    return new Promise((resolve, reject) => {
      rsbuild.onDevCompileDone(async () => {
        const manifest = await readManifestFile(distPath);
        const { manifest_version, background } = manifest;
        expect(manifest_version).toBe(3);
        expect((background as Manifest.WebExtensionManifestBackgroundC3Type).service_worker).toBeDefined();

        server.close();
        resolve({});
      });
    });
  });
});
