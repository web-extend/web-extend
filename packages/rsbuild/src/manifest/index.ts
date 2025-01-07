import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import backgroundProcessor from './background.js';
import contentProcessor from './content.js';
import devtoolsProcessor from './devtools.js';
import { isDevMode } from './env.js';
import iconsProcessor from './icons.js';
import optionsProcessor from './options.js';
import overrideProcessor from './overrides.js';
import popupProcessor from './popup.js';
import sandboxProcessor from './sandbox.js';
import sidepanelProcessor from './sidepanel.js';
import type {
  ExtensionTarget,
  ManifestEntryInput,
  ManifestEntryProcessor,
  NormalizeManifestProps,
  WebExtensionManifest,
  WriteMainfestEntriesProps,
  WriteManifestFileProps,
} from './types.js';
import { readPackageJson } from './util.js';

export { getTarget, setTargetEnv, getOutDir, getSrcDir, setOutDirEnv } from './env.js';

const entryProcessors: ManifestEntryProcessor[] = [
  backgroundProcessor,
  contentProcessor,
  popupProcessor,
  optionsProcessor,
  devtoolsProcessor,
  sandboxProcessor,
  iconsProcessor,
  overrideProcessor,
  sidepanelProcessor,
];

export async function normalizeManifest({
  rootPath,
  selfRootPath,
  mode,
  srcDir,
  manifest = {} as WebExtensionManifest,
  target,
}: NormalizeManifestProps) {
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
    finalManifest.version_name ??= `${finalManifest.version} (development)`;
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
      await processor.merge({
        selfRootPath,
        manifest: finalManifest,
        target,
        srcPath,
        mode,
        files,
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

export async function readManifestEntries(manifest: WebExtensionManifest) {
  const res = {} as Record<ManifestEntryProcessor['key'], ManifestEntryInput | null>;
  for (const processor of entryProcessors) {
    const entry = await processor.read(manifest);
    res[processor.key] = entry;
  }
  return res;
}

export async function writeManifestEntries({ manifest, rootPath, entry }: WriteMainfestEntriesProps) {
  for (const entryName in entry) {
    const processor = entryProcessors.find((item) => item.match(entryName));
    if (!processor) continue;
    await processor.write({
      manifest,
      rootPath,
      name: entryName,
      input: entry[entryName].input,
      output: entry[entryName].output,
    });
  }
}

export async function readManifestFile(distPath: string) {
  const manifestPath = resolve(distPath, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8')) as WebExtensionManifest;
  return manifest;
}

export async function writeManifestFile({ distPath, manifest, mode }: WriteManifestFileProps) {
  if (!existsSync(distPath)) {
    await mkdir(distPath, { recursive: true });
  }

  const data = isDevMode(mode) ? JSON.stringify(manifest, null, 2) : JSON.stringify(manifest);
  await writeFile(join(distPath, 'manifest.json'), data);
}

export async function copyPublicFiles(rootPath: string, distPath: string) {
  const publicPath = resolve(rootPath, 'public');
  if (!existsSync(publicPath) || !existsSync(distPath)) return;
  await cp(publicPath, distPath, { recursive: true, dereference: true });
}
