import { resolve } from 'node:path';
import { describe, it, expect, beforeAll } from 'vitest';
import { startBuild, startDevServer } from '../src/rsbuild';
import { rm } from 'node:fs/promises';
import { readManifestFile } from '@web-extend/manifest/common';

const root = resolve(__dirname, 'main');

describe('rsbuild', () => {
  beforeAll(async () => {
    await rm(resolve(root, 'dist'), { recursive: true, force: true });
  });

  it('should dev successfully', async () => {
    const { server, rsbuild } = await startDevServer({
      root,
      mode: 'development',
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
    });
    await buildInstance.close();

    const distPath = rsbuild.context.distPath;
    const manifest = await readManifestFile(distPath);
    expect(manifest).toBeDefined();
  });
});
