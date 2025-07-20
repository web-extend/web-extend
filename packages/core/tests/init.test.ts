import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init } from '../src/init';
import { getEntryPath } from './helper';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, 'test-projects');

describe('init', () => {
  beforeAll(async () => {
    if (existsSync(root)) {
      await rm(root, { recursive: true });
    }
  });

  it('should init a project with local template', async () => {
    const cliOptions = {
      root,
      projectName: 'test1',
      override: true,
      template: 'react',
      entries: ['background', 'content', 'popup', 'contents/site-one'],
      tools: [],
    };

    await init(cliOptions);
    const distPath = resolve(cliOptions.root, cliOptions.projectName);

    expect(existsSync(distPath)).toBe(true);
    cliOptions.entries?.forEach((entry) => {
      expect(existsSync(getEntryPath(distPath, entry))).toBe(true);
    });
  });

  it('should init a project with remote template', async () => {
    const cliOptions = {
      root,
      projectName: 'test2',
      override: true,
      template: 'with-react',
    };

    await init(cliOptions);
    const distPath = resolve(cliOptions.root, cliOptions.projectName);
    expect(existsSync(distPath)).toBe(true);
  });

  it('should ignore the invalid entries', async () => {
    const cliOptions = {
      root,
      projectName: 'test3',
      override: true,
      template: 'vanilla',
      entries: ['background', 'not-valid'],
      tools: [],
    };

    await init(cliOptions);
    const distPath = resolve(cliOptions.root, cliOptions.projectName);

    expect(existsSync(distPath)).toBe(true);
    expect(existsSync(getEntryPath(distPath, cliOptions.entries[0]))).toBe(true);
    expect(existsSync(getEntryPath(distPath, cliOptions.entries[1]))).toBe(false);
  });

  it('should throw error when the template is not valid', async () => {
    const cliOptions = {
      root,
      projectName: 'test4',
      override: true,
      template: 'not-valid',
      entries: ['background', 'content', 'popup', 'devtools'],
      tools: [],
    };

    await expect(init(cliOptions)).rejects.toThrowError();
  });

  it('should throw error when the remote template is not valid', async () => {
    const cliOptions = {
      root,
      projectName: 'test5',
      override: true,
      template: 'with-not-valid',
    };

    await expect(init(cliOptions)).rejects.toThrowError();
  });

  afterAll(async () => {
    if (existsSync(root)) {
      await rm(root, { recursive: true });
    }
  });
});
