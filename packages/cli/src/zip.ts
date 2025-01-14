import { createWriteStream, existsSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import archiver from 'archiver';
import { readBuildInfo } from './cache.js';

export interface ZipOptions {
  outDir?: string;
  filename?: string;
  root?: string;
  source?: string;
}

export async function zip({ filename, source, root = process.cwd(), outDir }: ZipOptions) {
  let sourceDir = source;
  if (!sourceDir) {
    const data = await readBuildInfo(root);
    if (data?.outDir) {
      sourceDir = data.outDir;
    } else {
      throw new Error('Zipped directory is not defined. Try build first.');
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
  const filePath = resolve(root, outDir || dirname(sourceDir), dest);
  const output = createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', () => {
      console.log(`Zipped ${sourceDir} successfully.`);
      resolve({});
    });
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourcePath, false);
    archive.finalize();
  });
}
