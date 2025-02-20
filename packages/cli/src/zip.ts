import { createWriteStream, existsSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { readManifestFile } from '@web-extend/manifest';
import type { ExtensionTarget } from '@web-extend/manifest/types';
import archiver from 'archiver';
import { getCurrentBuildInfo, readBuildInfo } from './cache.js';

export interface ZipOptions {
  root?: string;
  outDir?: string;
  filename?: string;
  target?: ExtensionTarget;
}

export async function zip({ filename, outDir, root = process.cwd(), target: optionTarget }: ZipOptions) {
  const buildInfo = await readBuildInfo(root);
  if (!buildInfo?.length) {
    throw Error('Cannot find build info, please build first.');
  }

  let currentBuildInfo = getCurrentBuildInfo(buildInfo, {
    distPath: outDir ? resolve(root, outDir) : undefined,
    target: optionTarget,
  });

  if (!currentBuildInfo) {
    if (outDir || optionTarget) {
      throw Error('The argument dir or target is incorrect.');
    }
    currentBuildInfo = buildInfo[0];
  }

  const { distPath, target } = currentBuildInfo;

  if (!existsSync(distPath)) {
    throw new Error(`${distPath} doesn't exist`);
  }

  const manifest = await readManifestFile(distPath);
  const dest = filename || `${target}-${manifest.version}.zip`;
  const filePath = resolve(dirname(distPath), dest);
  const output = createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', () => {
      const total = Math.round((archive.pointer() / 1024) * 100) / 100;
      console.log(`Packaged ${basename(distPath)} successfully.`);
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
