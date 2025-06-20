import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { join, resolve } from 'node:path';
import type { Rspack } from '@rsbuild/core';

interface DownloadRemotePluginOptions {
  root: string;
  cacheDir: string;
  cacheTTL: number;
}

export class DownloadRemotePlugin {
  name = 'DownloadRemotePlugin';
  options: DownloadRemotePluginOptions;

  constructor(options: Partial<DownloadRemotePluginOptions> = {}) {
    const root = options.root || process.cwd();
    const cacheDir = options.cacheDir || join('node_modules', '.remote-cache');

    this.options = {
      root,
      cacheDir,
      cacheTTL: options.cacheTTL || 24 * 60 * 60 * 1000, // 24h
    };
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(this.name, (_compilation, { normalModuleFactory }) => {
      normalModuleFactory.hooks.beforeResolve.tapAsync(this.name, async (data, callback) => {
        const { request } = data;
        if (this.isRemoteImport(request)) {
          const cacheKey = getCacheKey(request);
          const cachePath = resolve(this.options.root, this.options.cacheDir, cacheKey);
          try {
            await this.downloadWithCache(request, cachePath);
            data.request = resolve(this.options.root, cachePath);
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
      return;
    }

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
    const cachePath = resolve(this.options.root, this.options.cacheDir);
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, { recursive: true });
    }
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
    const cachePath = resolve(this.options.root, this.options.cacheDir);
    if (fs.existsSync(cachePath)) {
      fs.rmSync(cachePath, { recursive: true, force: true });
    }
  }
}

function getCacheKey(url: string) {
  return crypto.createHash('md5').update(url).digest('hex');
}
