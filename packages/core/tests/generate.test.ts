import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { generate } from '../src/generate';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, 'main');
const contentEntryPath = resolve(rootDir, 'src', 'content');
// const iconsEntryPath = resolve(rootDir, 'src', 'assets');
const popupEntryPath = resolve(rootDir, 'src', 'popup');

describe('generate', () => {
  // beforeAll(async () => {
  //   for (const entryPath of [contentEntryPath, popupEntryPath]) {
  //     if (existsSync(entryPath)) {
  //       await rm(entryPath, { recursive: true });
  //     }
  //   }
  // });

  it('should generate entrypoints', async () => {
    expect(existsSync(contentEntryPath)).toBe(false);
    const cliOptions = {
      root: rootDir,
      entries: ['content'],
    };
    await generate(cliOptions);
    expect(existsSync(contentEntryPath)).toBe(true);
    // expect(existsSync(iconsEntryPath)).toBe(true);
    // expect(existsSync(popupEntryPath)).toBe(true);
  });
});
