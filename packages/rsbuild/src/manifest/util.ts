import type { Dirent } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';

function isJavaScriptFile(file: string, name?: string) {
  const ext = extname(file);
  if (name && basename(file, ext) !== name) {
    return false;
  }
  return /\.(ts|js|tsx|jsx|mjs|cjs)$/.test(ext);
}

export const getSingleEntryFile = async (srcPath: string, files: Dirent[], name: string) => {
  // match [name].js
  const entryFile = files.find((item) => item.isFile() && isJavaScriptFile(item.name, name));
  if (entryFile) {
    return resolve(srcPath, entryFile.name);
  }

  // match [name]/index.js
  const entryDir = files.find((item) => item.isDirectory() && item.name === name);
  if (entryDir) {
    const subFiles = await readdir(resolve(srcPath, entryDir.name), { withFileTypes: true });
    const entryFile = subFiles.find((item) => item.isFile() && isJavaScriptFile(item.name, 'index'));
    if (entryFile) {
      return resolve(srcPath, entryDir.name, entryFile.name);
    }
  }
  return null;
};

export const getMultipleEntryFiles = async (srcPath: string, files: Dirent[], name: string) => {
  const entryDir = files.find((item) => item.isDirectory() && item.name === name);
  if (!entryDir) return [];

  const res: string[] = [];
  const subFiles = await readdir(resolve(srcPath, entryDir.name), { withFileTypes: true });
  for (const item of subFiles) {
    const subFilePath = resolve(srcPath, entryDir.name, item.name);

    // match [name]/*.js
    if (item.isFile() && isJavaScriptFile(item.name)) {
      res.push(subFilePath);
      continue;
    }

    // match [name]/*/index.js
    if (item.isDirectory()) {
      const grandChildFiles = await readdir(resolve(srcPath, entryDir.name, item.name), {
        withFileTypes: true,
      });
      const indexFile = grandChildFiles.find((item) => item.isFile() && isJavaScriptFile(item.name, 'index'));
      if (indexFile) {
        res.push(resolve(subFilePath, indexFile.name));
      }
    }
  }
  return res;
};

export const getAssetFiles = async (srcPath: string, files: Dirent[]) => {
  const assets = files.find((item) => item.isDirectory() && item.name === 'assets');
  if (!assets) return [];
  const subFiles = await readdir(resolve(srcPath, assets.name), { recursive: true });
  return subFiles.map((item) => resolve(srcPath, assets.name, item));
};

export async function readPackageJson(rootPath: string) {
  const filePath = resolve(rootPath, './package.json');
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}
