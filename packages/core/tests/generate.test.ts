import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, it } from 'vitest';
import { resolve } from 'node:path';
import { generate } from '../src/generate';
import { rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, 'main');
const contentDir = resolve(rootDir, 'content');

describe('generate', () => {
  beforeAll(async () => {
    if (existsSync(rootDir)) {
      await rm(rootDir, { recursive: true });
    }
  });

  it('should generate entrypoints', async () => {
    const cliOptions = {
      root: rootDir,
      entries: ['background', 'content', 'popup', 'devtools'],
    };

    await generate(cliOptions);
  });
});
