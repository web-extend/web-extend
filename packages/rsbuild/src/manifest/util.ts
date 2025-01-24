import { readFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';

const jsFileExts = ['.ts', '.js', '.tsx', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];

export const getSingleEntryFile = (key: string, files: string[], base?: string) => {
  // match [name].js or [name]/index.js
  const patterns = jsFileExts.flatMap((ext) => [`${key}${ext}`, `${key}/index${ext}`]);
  const res = files.find((file) => patterns.includes(file));
  if (!res) return null;
  if (!base) return res;
  return resolve(base, res);
};

export const getMultipleEntryFiles = (key: string, files: string[], base?: string) => {
  // match [name]/*.js or [name]/*/index.js
  const res = files.filter((item) => {
    const ext = extname(item);
    if (!jsFileExts.includes(ext)) return false;

    const slices = item.split(/[\\/]/);
    if (slices[0] === key) {
      if (slices.length === 2) return true;
      if (slices.length === 3 && basename(item, ext) === 'index') return true;
    }

    return false;
  });
  if (!base) return res;
  return res.map((item) => resolve(base, item));
};

export const getAssetFiles = (key: string, files: string[], base?: string) => {
  const pattern = /[\\/]icon-?(\d+)\.png$/;
  const res = files.filter((item) => item.startsWith(key) && pattern.test(item));
  if (!base) return res;
  return res.map((item) => resolve(base, item));
};

export async function readPackageJson(rootPath: string) {
  const filePath = resolve(rootPath, './package.json');
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}
