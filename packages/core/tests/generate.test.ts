import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { generate } from '../src/generate';
import { getEntryPath } from './helper';

const root = resolve(__dirname, 'main');
const contentEntryPath = getEntryPath(root, 'content');
const iconsEntryPath = getEntryPath(root, 'assets');
const popupEntryPath = getEntryPath(root, 'popup');

describe('generate', () => {
  beforeAll(async () => {
    for (const entryPath of [contentEntryPath, popupEntryPath]) {
      if (existsSync(entryPath)) {
        await rm(entryPath, { recursive: true });
      }
    }
  });

  it('should generate entrypoints', async () => {
    expect(existsSync(contentEntryPath)).toBe(false);
    expect(existsSync(popupEntryPath)).toBe(false);

    const cliOptions = {
      root,
      entries: ['icons', 'content', 'popup'],
    };
    await generate(cliOptions);

    expect(existsSync(contentEntryPath)).toBe(true);
    expect(existsSync(iconsEntryPath)).toBe(true);
    expect(existsSync(popupEntryPath)).toBe(true);
  });
});
