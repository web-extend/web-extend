import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { clearDist, initRsbuild, readManifestFile } from '../helper.js';
import pkg from './package.json' with { type: 'json' };
import type { Manifest } from 'webextension-polyfill';

const __dirname = import.meta.dirname;

describe('empty', () => {
  beforeAll(async () => {
    await clearDist(resolve(__dirname, 'dist'));
  });

  it('should have default background in dev mode', async () => {
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

  it('should build successfully with empty manifest', async () => {
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'production',
    });
    await rsbuild.build();

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifestFile(distPath);
    const { manifest_version, name, version, description, author, homepage_url } = manifest;

    expect(manifest_version).toBe(3);
    expect(name).toBe(pkg.name);
    expect(version).toBe(pkg.version.split('-')[0]);
    expect(description).toBe(pkg.description);
    expect(author).toBe(pkg.author);
    expect(homepage_url).toBe(pkg.homepage);
  });
});
