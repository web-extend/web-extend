import { existsSync } from 'node:fs';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
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
  ExtensionManifest,
  ExtensionTarget,
  ManifestEntryOutput,
  NormalizeContextOptions,
  NormalizeManifestProps,
  WebExtendContext,
  WebExtendEntries,
} from './types.js';

async function normalizeManifest({ manifest = {} as ExtensionManifest, context }: NormalizeManifestProps) {
  const { rootPath, target, mode, entriesDir } = context;
  const defaultManifest = await initManifest(rootPath, target);
  const finalManifest = {
    ...defaultManifest,
    ...manifest,
  } as ExtensionManifest;

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
        context,
      });
    }
  } catch (err) {
    console.error(err);
  }

  polyfillManifest({ manifest: finalManifest, context });
  return finalManifest;
}

async function initManifest(rootPath: string, target?: ExtensionTarget) {
  const manifest: Partial<ExtensionManifest> = {
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
  private manifest = {} as ExtensionManifest;
  private normalizedManifest = {} as ExtensionManifest;
  private entries: WebExtendEntries | undefined;

  async normalize(options: NormalizeContextOptions) {
    this.context = normalizeContext(options);

    const { target, mode } = this.context;
    const optionManifest =
      typeof options.manifest === 'function' ? options.manifest({ target, mode }) : options.manifest;

    this.manifest = await normalizeManifest({
      manifest: optionManifest,
      context: this.context,
    });
    this.normalizedManifest = JSON.parse(JSON.stringify(this.manifest));
  }

  async readEntries() {
    const manifest = this.normalizedManifest;
    const res: WebExtendEntries = {};
    if (!this.context) return res;
    for (const processor of entryProcessors) {
      if (!processor.readEntry) continue;
      const entry = await processor.readEntry({
        manifest,
        context: this.context,
      });
      if (entry) {
        res[processor.key] = entry;
      }
    }
    this.entries = res;
    return res;
  }

  async writeEntries(result: ManifestEntryOutput) {
    if (!this.entries || !this.context) return;
    for (const entryName in result) {
      for (const processor of entryProcessors) {
        const entry = this.entries[processor.key];
        if (!processor.writeEntry || !entry) continue;
        const entries = Array.isArray(entry) ? entry : [entry];
        const item = entries.find((item) => item.name === entryName);
        
        if (item) {
          await processor.writeEntry({
            normalizedManifest: this.normalizedManifest,
            manifest: this.manifest,
            rootPath: this.context.rootPath,
            name: entryName,
            input: result[entryName].input,
            output: result[entryName].output,
            context: this.context,
          });
        }
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
