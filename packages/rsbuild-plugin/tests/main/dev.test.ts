import { describe, expect, it } from 'vitest';
import { initRsbuild, readManifestFile, validateDistFile } from '../helper.js';

describe('test dev for chrome', () => {
  it('should build successfully in dev mode', async () => {
    const rsbuild = await initRsbuild({
      cwd: __dirname,
      mode: 'development',
    });
    const { server } = await rsbuild.startDevServer();
    const distPath = rsbuild.context.distPath;

    return new Promise((resolve, _reject) => {
      rsbuild.onDevCompileDone(async () => {
        const manifest = await readManifestFile(distPath);
        const { manifest_version, background, content_scripts = [] } = manifest;
        expect(manifest_version).toBe(3);

        // background
        expect(background?.service_worker).toBeDefined();

        // content_scripts
        expect(content_scripts).toHaveLength(4);
        const contentCss = content_scripts.flatMap((item) => item.css || []);
        expect(contentCss).toHaveLength(0);
        const contentJs = content_scripts.flatMap((item) => item.js || []);
        expect(contentJs).toContain('content.js');
        expect(contentJs).toContain('contents/site-one.js');
        expect(contentJs).toContain('contents/site-two.js');
        expect(contentJs).toContain('content-bridge.js');

        // scripting
        expect(validateDistFile(distPath, 'scripting/injected-script.js', '.js')).toBeTruthy();
        expect(validateDistFile(distPath, 'scripting/injected-style.css', '.css')).toBeTruthy();

        server.close();
        resolve({});
      });
    });
  });
});
