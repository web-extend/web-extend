import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { preview } from '../src/runner';

vi.mock('web-ext', () => {
  const mockWebExt = {
    cmd: {
      run: () => {
        console.log('web-ext run');
        return {
          exit: () => {
            console.log('web-ext exit');
          },
        };
      },
    },
  };
  return {
    default: mockWebExt,
  };
});

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
