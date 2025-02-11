import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import backgroundProcessor from './background.js';
import { isDevMode, readPackageJson, resolveOutDir, resolveSrcDir, resolveTarget, setTargetEnv } from './common.js';
import contentProcessor from './content.js';
import devtoolsProcessor from './devtools.js';
import panelProcessor from './panel.js';
import iconsProcessor from './icons.js';
import optionsProcessor from './options.js';
import overrideProcessors from './overrides.js';
import popupProcessor from './popup.js';
import sandboxProcessor from './sandbox.js';
import sidepanelProcessor from './sidepanel.js';
import type {
  ExtensionTarget,
  ManifestContext,
  ManifestEntries,
  ManifestEntryOutput,
  ManifestEntryProcessor,
  NormalizeManifestProps,
  WebExtensionManifest,
} from './types.js';

export { setTargetEnv, getEntryFileVariants } from './common.js';

export * from './types.js';

const entryProcessors: ManifestEntryProcessor[] = [
  backgroundProcessor,
  contentProcessor,
  popupProcessor,
  optionsProcessor,
  sidepanelProcessor,
  devtoolsProcessor,
  panelProcessor,
  sandboxProcessor,
  iconsProcessor,
  ...overrideProcessors,
];

async function normalizeManifest({ manifest = {} as WebExtensionManifest, context }: NormalizeManifestProps) {
  const { rootPath, target, mode, srcDir } = context;
  const defaultManifest = await getDefaultManifest(rootPath, target);
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
    finalManifest.version_name ??= `${finalManifest.version} (dev)`;
    finalManifest.permissions ??= [];
    finalManifest.host_permissions ??= [];

    if (!finalManifest.permissions.includes('scripting')) {
      finalManifest.permissions.push('scripting');
    }

    if (!finalManifest.host_permissions.includes('*://*/*')) {
      finalManifest.host_permissions.push('*://*/*');
    }

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
    const srcPath = resolve(rootPath, srcDir);
    const files = await readdir(srcPath, { recursive: true });
    for (const processor of entryProcessors) {
      if (!processor.normalize) continue;
      await processor.normalize({
        manifest: finalManifest,
        files,
        context,
      });
    }
  } catch (err) {
    console.error(err);
  }

  return finalManifest;
}

async function getDefaultManifest(rootPath: string, target?: ExtensionTarget) {
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
  public context = {} as ManifestContext;
  private manifest = {} as WebExtensionManifest;
  private normalizedManifest = {} as WebExtensionManifest;
  private entries: ManifestEntries | undefined;

  async normalize(
    options: Partial<ManifestContext> & {
      manifest?: WebExtensionManifest | ((props: { target: ExtensionTarget; mode: string }) => WebExtensionManifest);
      distPath?: string;
    },
  ) {
    const mode = options.mode || process.env.NODE_ENV || 'none';
    const target = resolveTarget(options.target);
    setTargetEnv(target);

    const rootPath = options.rootPath || process.cwd();
    const srcDir = resolveSrcDir(rootPath, options.srcDir);
    const outDir = resolveOutDir({
      outdir: options.outDir,
      distPath: options.distPath,
      target,
      mode,
    });

    this.context = {
      mode,
      target,
      rootPath,
      srcDir,
      outDir,
      runtime: options?.runtime,
    };

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
    const res = {} as ManifestEntries;
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
    if (!this.entries) return;
    for (const entryName in result) {
      for (const processor of entryProcessors) {
        const entry = this.entries[processor.key];
        if (!entry || !Object.hasOwn(entry, entryName) || !processor.writeEntry) continue;

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

  async writeManifestFile() {
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
    const { rootPath, outDir } = this.context;
    const publicPath = resolve(rootPath, 'public');
    const distPath = resolve(rootPath, outDir);
    if (!existsSync(publicPath) || !existsSync(distPath)) return;
    await cp(publicPath, distPath, { recursive: true, dereference: true });
  }

  static matchDeclarativeEntryFile(file: string) {
    for (const processor of entryProcessors) {
      if (!processor.matchDeclarativeEntryFile) continue;
      const item = processor.matchDeclarativeEntryFile(file);
      if (item) return item;
    }
    return null;
  }
}
