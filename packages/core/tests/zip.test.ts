import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { zip } from '../src/zip';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, 'extension');

describe('zip', () => {
  it('should zip the extension', async () => {
    const result = await zip({
      root,
      outDir: 'chrome-mv3-prod',
    });
    expect(result.output).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
    await rm(result.output, { recursive: true });
  });

  it('should throw error when the artifact directory is not specified', async () => {
    await expect(zip({ root })).rejects.toThrowError();
  });

  it('should throw error when the artifact directory is not found', async () => {
    await expect(zip({ root, outDir: 'not-found' })).rejects.toThrowError();
  });
});
