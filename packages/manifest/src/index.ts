import { existsSync } from 'node:fs';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { WebExtendManifest } from './browser.js';
import {
  isDevMode,
  normalizeEntriesDir,
  normalizeOutDir,
  readPackageJson,
  resolveTarget,
  setTargetEnv,
} from './common.js';
import { entryProcessors } from './entries/index.js';
import { polyfillManifest } from './polyfill.js';
import type {
  WebExtendTarget,
  NormalizeContextOptions,
  NormalizeManifestProps,
  WebExtendContext,
  WebExtendEntries,
  WebExtendEntryKey,
  WebExtendEntryOutput,
} from './types.js';

async function initManifest(rootPath: string, target?: WebExtendTarget) {
  const manifest: Partial<WebExtendManifest> = {
    manifest_version: target?.includes('2') ? 2 : 3,
  };

  try {
    const pkg = await readPackageJson(rootPath);
    const { name, displayName, version, description, author, homepage } = pkg;
    const trimVersion = version?.match(/[\d\.]+/)?.[0];

    manifest.name ??= displayName || name;
    manifest.version ??= trimVersion;
    manifest.description ??= description;
    manifest.author ??= author;
    manifest.homepage_url ??= homepage;
  } catch (err) {
    console.warn('Failed to read package.json:', err instanceof Error ? err.message : err);
  }

  return manifest;
}

export const normalizeContext = (options: NormalizeContextOptions): WebExtendContext => {
  const rootPath = options.rootPath || process.cwd();
  const mode = options.mode || process.env.NODE_ENV || 'none';

  const target = resolveTarget(options.target);
  setTargetEnv(target);

  const outDir = normalizeOutDir({
    outDir: options.outDir,
    target,
    mode,
    buildDirTemplate: options.buildDirTemplate,
  });

  const publicDir = options.publicDir || 'public';

  const entriesDir = normalizeEntriesDir(rootPath, options.entriesDir);

  return {
    rootPath,
    mode,
    target,
    outDir,
    publicDir,
    entriesDir,
    runtime: options?.runtime,
  };
};

export class ManifestManager {
  public context = {} as WebExtendContext;
  public entries: WebExtendEntries = {};
  private manifest = {} as WebExtendManifest;

  async normalize(options: NormalizeContextOptions) {
    this.context = normalizeContext(options);

    const { target, mode } = this.context;
    const optionManifest =
      typeof options.manifest === 'function' ? options.manifest({ target, mode }) : options.manifest;

    await this.normalizeEntries({
      manifest: optionManifest,
    });
  }

  async normalizeEntries({ manifest = {} as WebExtendManifest }: NormalizeManifestProps) {
    const { rootPath, target, mode } = this.context;
    const defaultManifest = await initManifest(rootPath, target);
    const finalManifest = {
      ...defaultManifest,
      ...manifest,
    } as WebExtendManifest;
    const entries: WebExtendEntries = {};

    const requiredFields = ['name', 'version'];
    const invalidFields = requiredFields.filter((field) => !(field in finalManifest));
    if (invalidFields.length) {
      throw new Error(`Required fields missing or invalid in manifest: ${invalidFields.join(', ')}`);
    }

    if (isDevMode(mode)) {
      finalManifest.commands = {
        'web-extend:reload-extension': {
          suggested_key: {
            default: 'Alt+R',
            mac: 'Alt+R',
          },
          description: 'Reload the extension.',
        },
        ...(finalManifest.commands || {}),
      };
    }

    try {
      for (const processor of entryProcessors) {
        if (!processor.normalizeEntry) continue;
        await processor.normalizeEntry({
          manifest: finalManifest,
          context: this.context,
          entries,
        });
      }
    } catch (err) {
      console.error(err);
    }

    polyfillManifest({ manifest: finalManifest, context: this.context });

    this.manifest = finalManifest;
    this.entries = entries;
  }

  async writeEntries(result: WebExtendEntryOutput[]) {
    if (!this.entries || !this.context) return;
    const entries = this.entries;

    for (const item of result) {
      const { name, output } = item;
      const entryKey = Object.keys(entries).find((key) => {
        const entry = entries[key as WebExtendEntryKey];
        const entryNames = entry ? [entry].flat().map((item) => item.name) : [];
        return entryNames.includes(name);
      }) as WebExtendEntryKey | undefined;
      const processor = entryProcessors.find((item) => item.key === entryKey);

      if (entryKey && processor?.writeEntry) {
        await processor.writeEntry({
          manifest: this.manifest,
          rootPath: this.context.rootPath,
          name,
          output,
          context: this.context,
          entries,
        });
      }
    }
  }

  async writeManifestFile() {
    if (!this.context) return;
    const { rootPath, outDir, mode, runtime } = this.context;
    const distPath = resolve(rootPath, outDir);
    const manifest = this.manifest;

    if (!existsSync(distPath)) {
      await mkdir(distPath, { recursive: true });
    }

    for (const processor of entryProcessors) {
      if (processor.onAfterBuild) {
        await processor.onAfterBuild({ distPath, manifest, mode, runtime });
      }
    }

    const data = isDevMode(mode) ? JSON.stringify(manifest, null, 2) : JSON.stringify(manifest);
    await writeFile(join(distPath, 'manifest.json'), data);
  }

  async copyPublicFiles() {
    if (!this.context) return;
    const { rootPath, outDir, publicDir } = this.context;
    const publicPath = resolve(rootPath, publicDir);
    const distPath = resolve(rootPath, outDir);
    if (!existsSync(publicPath) || !existsSync(distPath)) return;
    await cp(publicPath, distPath, { recursive: true, dereference: true });
  }

  matchDeclarativeEntry(file: string) {
    if (!this.context) return;
    for (const processor of entryProcessors) {
      if (!processor.matchDeclarativeEntry) continue;
      const item = processor.matchDeclarativeEntry(file, this.context);
      if (item) return item;
    }
    return null;
  }
}
