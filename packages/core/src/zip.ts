import { createWriteStream, existsSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { readManifestFile } from '@web-extend/manifest/common';
import type { WebExtendTarget } from '@web-extend/manifest/types';
import archiver from 'archiver';
import { loadBuildResult } from './result.js';

export interface ZipOptions {
  root?: string;
  outDir?: string;
  filename?: string;
  target?: WebExtendTarget;
}

export interface ZipResult {
  output: string;
  total: number;
}

export async function zip({ filename, outDir, root = process.cwd(), target }: ZipOptions): Promise<ZipResult> {
  let distPath = outDir ? resolve(root, outDir) : undefined;

  if (!distPath) {
    const result = await loadBuildResult({ root, outDir, target });
    distPath = result.distPath;
  }

  if (!distPath) {
    throw Error('Cannot find the build artifact, please build first or specify the artifact directory.');
  }

  if (!existsSync(distPath)) {
    throw new Error(`"${relative(root, distPath)}" doesn't exist.`);
  }

  const distPathName = basename(distPath);
  const manifest = await readManifestFile(distPath);
  const filePath = resolve(dirname(distPath), filename || `${distPathName}-${manifest.version}.zip`);
  const output = createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', () => {
      const total = Math.round((archive.pointer() / 1024) * 100) / 100;
      console.log(`Packaged ${distPathName} successfully.`);
      console.log(`Output: ${filePath}`);
      console.log(`Total: ${total} kB`);
      resolve({
        output: filePath,
        total,
      });
    });
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(distPath, false);
    archive.finalize();
  });
}
