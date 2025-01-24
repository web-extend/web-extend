import { readFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';

const jsFileExts = ['.ts', '.js', '.tsx', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];

export const getSingleEntryFile = async (srcPath: string, files: string[], name: string) => {
  // // match [name].js
  // const entryFile = files.find((item) => item.isFile() && isJavaScriptFile(item.name, name));
  // if (entryFile) {
  //   return resolve(srcPath, entryFile.name);
  // }

  // // match [name]/index.js
  // const entryDir = files.find((item) => item.isDirectory() && item.name === name);
  // if (entryDir) {
  //   const subFiles = await readdir(resolve(srcPath, entryDir.name), { withFileTypes: true });
  //   const entryFile = subFiles.find((item) => item.isFile() && isJavaScriptFile(item.name, 'index'));
  //   if (entryFile) {
  //     return resolve(srcPath, entryDir.name, entryFile.name);
  //   }
  // }
  const patterns = jsFileExts.flatMap((ext) => [`${name}${ext}`, `${name}/index${ext}`]);
  const res = files.find((file) => patterns.includes(file));
  if (!res) return null;
  return resolve(srcPath, res);
};

export const getMultipleEntryFiles = async (srcPath: string, files: string[], name: string) => {
  // const entryDir = files.find((item) => item.isDirectory() && item.name === name);
  // if (!entryDir) return [];

  // const res: string[] = [];
  // const subFiles = await readdir(resolve(srcPath, entryDir.name), { withFileTypes: true });
  // for (const item of subFiles) {
  //   const subFilePath = resolve(srcPath, entryDir.name, item.name);

  //   // match [name]/*.js
  //   if (item.isFile() && isJavaScriptFile(item.name)) {
  //     res.push(subFilePath);
  //     continue;
  //   }

  //   // match [name]/*/index.js
  //   if (item.isDirectory()) {
  //     const grandChildFiles = await readdir(resolve(srcPath, entryDir.name, item.name), {
  //       withFileTypes: true,
  //     });
  //     const indexFile = grandChildFiles.find((item) => item.isFile() && isJavaScriptFile(item.name, 'index'));
  //     if (indexFile) {
  //       res.push(resolve(subFilePath, indexFile.name));
  //     }
  //   }
  // }
  const res = files.filter((item) => {
    const ext = extname(item);
    if (!jsFileExts.includes(ext)) return false;

    const slices = item.split(/[\\/]/);
    if (slices[0] === name) {
      // match [name]/*.js
      if (slices.length === 2) return true;

      // match [name]/*/index.js
      if (slices.length === 3 && basename(item, ext) === 'index') return true;
    }

    return false;
  });
  return res.map((item) => resolve(srcPath, item));
};

export const getAssetFiles = async (srcPath: string, files: string[]) => {
  // const assets = files.find((item) => item.isDirectory() && item.name === 'assets');
  // if (!assets) return [];
  // const subFiles = await readdir(resolve(srcPath, assets.name), { recursive: true });
  // return subFiles.map((item) => resolve(srcPath, assets.name, item));
  const pattern = /^assets[\\/]icon-?(\d+)\.png$/;
  const res = files.filter((item) => pattern.test(item));
  return res.map((item) => resolve(srcPath, item));
};

export async function readPackageJson(rootPath: string) {
  const filePath = resolve(rootPath, './package.json');
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}
