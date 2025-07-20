import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadWebExtendConfig, loadConfig, type WebExtendConfig } from '../src/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('load config', () => {
  it('should load web-extend.config.ts', async () => {
    const root = resolve(__dirname, 'main');
    const config = await loadWebExtendConfig(root);
    expect(config.content).toBeDefined();
    expect(config.content?.manifest?.name).toBe('Test');
    expect(config.filePath).toBe(resolve(root, 'web-extend.config.ts'));
  });

  it('should load web-extend.config.js', async () => {
    const root = resolve(__dirname, 'main');
    const config = await loadConfig<WebExtendConfig>({ root, configFiles: ['web-extend.config.js'] });
    expect(config.content).toBeDefined();
    expect(config.content?.manifest?.name).toBe('Test');
    expect(config.filePath).toBe(resolve(root, 'web-extend.config.js'));
  });

  it('should be undefined when web-extend config is not found', async () => {
    const root = resolve(__dirname, 'extension');
    const config = await loadWebExtendConfig(root);
    expect(config.content).toBeUndefined();
  });
});
