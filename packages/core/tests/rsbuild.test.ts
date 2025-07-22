import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readManifestFile } from '@web-extend/manifest/common';
import { beforeAll, describe, expect, it } from 'vitest';
import { startBuild, startDevServer } from '../src/rsbuild';

const root = resolve(__dirname, 'main');

describe('rsbuild', () => {
  beforeAll(async () => {
    await rm(resolve(root, 'dist'), { recursive: true, force: true });
  });

  it('should dev successfully', async () => {
    const { server, rsbuild } = await startDevServer({
      root,
      mode: 'development',
      open: true,
    });

    return new Promise((resolve, reject) => {
      rsbuild.onDevCompileDone(async () => {
        const distPath = rsbuild.context.distPath;
        const manifest = await readManifestFile(distPath);
        expect(manifest).toBeDefined();
        await server.close();
        resolve({});
      });
    });
  });

  it('should build successfully', async () => {
    const { buildInstance, rsbuild } = await startBuild({
      root,
      mode: 'production',
      zip: true,
      // watch: true,
    });

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifestFile(distPath);
    expect(manifest).toBeDefined();
    await buildInstance.close();
  });
});
