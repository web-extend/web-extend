import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { preview } from '../src/runner';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, 'extension');

describe('preview', () => {
  it('should preview the extension', async () => {
    const runner = await preview({ root, outDir: 'chrome-mv3-prod' });
    expect(runner).toBeDefined();
    runner.exit();
  });

  it('should throw error when the artifact directory is not found', async () => {
    await expect(preview({ root, outDir: 'not-found' })).rejects.toThrowError();
  });
});
