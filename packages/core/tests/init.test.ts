import { dirname, resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { init } from '../src/init';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, 'test-projects');

describe('init', () => {
  beforeAll(async () => {
    if (existsSync(rootDir)) {
      await rm(rootDir, { recursive: true });
    }
  });

  it('should init a project', async () => {
    const cliOptions = {
      root: rootDir,
      projectName: 'test1',
      override: true,
      template: 'react',
      entries: ['background', 'content', 'popup', 'devtools'],
      tools: ['eslint', 'prettier'],
    };

    await init(cliOptions);
    const distPath = resolve(cliOptions.root, cliOptions.projectName);
    expect(existsSync(distPath)).toBe(true);
  });

  it('should init a project with remote template', async () => {
    const cliOptions = {
      root: rootDir,
      projectName: 'test2',
      override: true,
      template: 'with-react',
    };

    await init(cliOptions);
    const distPath = resolve(cliOptions.root, cliOptions.projectName);
    expect(existsSync(distPath)).toBe(true);
  });
});
