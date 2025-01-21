import { createWriteStream, existsSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import archiver from 'archiver';
import { readBuildInfo } from './cache.js';

export interface ZipOptions {
  root?: string;
  outDir?: string;
  filename?: string;
}

export async function zip({ filename, outDir, root = process.cwd() }: ZipOptions) {
  let sourceDir = outDir;
  if (!sourceDir) {
    const data = await readBuildInfo(root);
    if (data?.distPath) {
      sourceDir = data.distPath;
    } else {
      throw new Error('Argument source is missing.');
    }
  }

  const sourcePath = resolve(root, sourceDir);

  if (!existsSync(sourcePath)) {
    throw new Error(`${sourceDir} doesn't exist`);
  }

  const manifestFile = resolve(sourcePath, 'manifest.json');
  if (!existsSync(manifestFile)) {
    throw new Error(`Cannot find manifest.json in ${sourcePath}`);
  }

  const dest = filename || `${basename(sourcePath)}.zip`;
  const filePath = resolve(root, dirname(sourceDir), dest);
  const output = createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', () => {
      const total = Math.round((archive.pointer() / 1024) * 100) / 100;
      console.log(`Packaged ${basename(sourceDir)} successfully.`);
      console.log(`Output: ${filePath}`);
      console.log(`Total: ${total} kB`);
      resolve({
        output: filePath,
        total,
      });
    });
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourcePath, false);
    archive.finalize();
  });
}
