import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import type { Rspack } from '@rsbuild/core';

interface DownloadRemotePluginOptions {
  cacheDir: string;
  cacheTTL: number;
}

export class DownloadRemotePlugin {
  name = 'DownloadRemotePlugin';
  options: DownloadRemotePluginOptions;

  constructor(options: Partial<DownloadRemotePluginOptions> = {}) {
    const nodeModulesPath = findNearestNodeModules() || '.';
    const cacheDir = path.join(nodeModulesPath, '.remote-cache');
    this.options = {
      cacheDir,
      cacheTTL: 24 * 60 * 60 * 1000, // 24h
      ...options,
    };

    if (!fs.existsSync(this.options.cacheDir)) {
      fs.mkdirSync(this.options.cacheDir, { recursive: true });
    }
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(this.name, (_compilation, { normalModuleFactory }) => {
      normalModuleFactory.hooks.beforeResolve.tapAsync(this.name, async (data, callback) => {
        const { request } = data;
        if (this.isRemoteImport(request)) {
          const cacheKey = getCacheKey(request);
          const cachePath = path.join(this.options.cacheDir, cacheKey);
          try {
            await this.downloadWithCache(request, cachePath);
            data.request = path.resolve(process.cwd(), cachePath);
          } catch (err) {
            return callback(err as Error);
          }
        }
        callback(null);
      });
    });
  }

  isRemoteImport(request: string) {
    return /^https?:\/\//.test(request);
  }

  async downloadWithCache(remoteUrl: string, cachePath: string) {
    if (await this.isCacheValid(cachePath)) {
      // console.log(`[Cache] Using cached version of ${remoteUrl}`);
      return;
    }

    // console.log(`[Download] Fetching fresh copy of ${remoteUrl}`);
    await this.downloadFile(remoteUrl, cachePath);
  }

  async isCacheValid(cachePath: string) {
    try {
      if (!fs.existsSync(cachePath)) return false;

      const stats = fs.statSync(cachePath);
      if (Date.now() - stats.mtimeMs > this.options.cacheTTL) return false;

      return true;
    } catch (err) {
      return false;
    }
  }

  async downloadFile(url: string, savePath: string) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(savePath);
      const protocol = url.startsWith('https') ? https : http;

      protocol
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download ${url} (${response.statusCode})`));
            return;
          }

          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        })
        .on('error', (err) => {
          fs.unlink(savePath, () => reject(err));
        });
    });
  }

  cleanCache() {
    const dir = this.options.cacheDir;
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      // console.log(`[Clean] Removed cache directory: ${dir}`);
    }
  }
}

function findNearestNodeModules(startDir = process.cwd()) {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    const nodeModulesPath = path.join(dir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function getCacheKey(url: string) {
  return crypto.createHash('md5').update(url).digest('hex');
}
