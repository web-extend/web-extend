import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { isDevMode, readPackageJson } from './common.js';
import { normalizeContext } from './context.js';
import { entryProcessors } from './entries/index.js';
import { polyfillManifest } from './polyfill.js';
import type {
  ExtensionTarget,
  ManifestEntryOutput,
  NormalizeManifestProps,
  WebExtendContext,
  WebExtendEntries,
  WebExtensionManifest,
} from './types.js';

async function normalizeManifest({ manifest = {} as WebExtensionManifest, context }: NormalizeManifestProps) {
  const { rootPath, target, mode, entriesDir } = context;
  const defaultManifest = await initManifest(rootPath, target);
  const finalManifest = {
    ...defaultManifest,
    ...manifest,
  } as WebExtensionManifest;

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
    const files = await readdir(resolve(rootPath, entriesDir.root), { recursive: true });
    for (const processor of entryProcessors) {
      if (!processor.normalizeEntry) continue;
      await processor.normalizeEntry({
        manifest: finalManifest,
        files,
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
  const manifest: Partial<WebExtensionManifest> = {
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

export class ManifestManager {
  public context = {} as WebExtendContext;
  private manifest = {} as WebExtensionManifest;
  private normalizedManifest = {} as WebExtensionManifest;
  private entries: WebExtendEntries | undefined;

  async normalize(
    options: Partial<WebExtendContext> & {
      manifest?: WebExtensionManifest | ((props: { target: ExtensionTarget; mode: string }) => WebExtensionManifest);
      buildDirTemplate?: string;
    },
  ) {
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
    const res = {} as WebExtendEntries;
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
        const entry = this.entries[processor.key] || {};
        if (entryName in entry && processor.writeEntry) {
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
}

export function matchDeclarativeEntry(file: string, context: WebExtendContext) {
  for (const processor of entryProcessors) {
    if (!processor.matchDeclarativeEntry) continue;
    const item = processor.matchDeclarativeEntry(file, context);
    if (item) return item;
  }
  return null;
}
