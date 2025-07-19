import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeEntriesDir } from '@web-extend/manifest/common';
import type { WebExtendEntriesDir } from '@web-extend/manifest/types';
import { loadWebExtendConfig } from './config.js';
import { ENTRYPOINT_ITEMS, FRAMEWORKS } from './constants.js';
import { copyEntryFiles, normalizeEntrypoints, normalizeTemplatePath } from './init.js';
import { readFile } from 'node:fs/promises';

export interface GenerateOptions {
  root?: string;
  entries: string[];
  template?: string;
  size?: string[]; // just for icons
}

function getIconTemplatePath({
  rootPath,
  entriesDir,
  template,
}: { rootPath: string; entriesDir: WebExtendEntriesDir; template?: string }) {
  let templatePath = '';
  if (template) {
    templatePath = resolve(rootPath, template);
  } else {
    const templateNames = ['icon.png', 'icon-1024.png', 'icon-512.png', 'icon-128.png'];
    for (const name of templateNames) {
      const path = resolve(rootPath, entriesDir.root, entriesDir.icons, name);
      if (existsSync(path)) {
        templatePath = path;
        break;
      }
    }
  }

  if (!existsSync(templatePath)) {
    throw new Error('Cannot find the template of icons');
  }
  return templatePath;
}

const ICON_SIZES = ['16', '32', '48', '128'];

async function generateIcons({
  rootPath,
  template,
  entriesDir,
  size = ICON_SIZES,
}: { entriesDir: WebExtendEntriesDir; rootPath: string; template?: string; size?: string[] }) {
  const sharp = await import('sharp').then((mod) => mod.default);

  const templatePath = getIconTemplatePath({ rootPath, template, entriesDir });
  const filename = 'icon-{size}.png';

  const sizes = size.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0);

  for (const size of sizes) {
    const name = filename.replace('{size}', String(size));
    const destPath = resolve(rootPath, entriesDir.root, entriesDir.icons);
    const destFile = resolve(destPath, name);
    if (existsSync(destFile)) continue;
    await sharp(templatePath).resize(size).toFile(destFile);
  }
}

async function getProjectDependencies(rootPath: string) {
  const pkgPath = resolve(rootPath, 'package.json');
  if (!existsSync(pkgPath)) {
    return {};
  }
  const content = await readFile(pkgPath, 'utf-8');
  const newContent = JSON.parse(content);
  const devDependencies = newContent.devDependencies || {};
  const dependencies = newContent.dependencies || {};
  const res: Record<string, string> = { ...devDependencies, ...dependencies };
  return res;
}

async function getDefaultTemplate(rootPath: string) {
  const dependencies = await getProjectDependencies(rootPath);
  const template = FRAMEWORKS.find((item) => dependencies[item.packageName]);
  if (template) {
    return template.value;
  }
  return 'vanilla';
}

export async function generate(options: GenerateOptions) {
  const rootPath = options.root || process.cwd();

  const { content: webExtendConfig } = await loadWebExtendConfig(rootPath);
  const entriesDir = normalizeEntriesDir(rootPath, webExtendConfig?.entriesDir || webExtendConfig?.srcDir);
  const entrypoints = await normalizeEntrypoints(options.entries, entriesDir, ENTRYPOINT_ITEMS);

  const iconsEntrypoint = entrypoints.find((item) => item.value === 'icons');
  if (iconsEntrypoint) {
    await generateIcons({ ...options, entriesDir, rootPath });
  }

  const otherEntries = entrypoints.filter((item) => item.value !== 'icons');
  if (otherEntries.length) {
    const template = options.template || (await getDefaultTemplate(rootPath));
    const templatePath = await normalizeTemplatePath(template);
    await copyEntryFiles({
      sourcePath: resolve(templatePath, 'src'),
      destPath: resolve(rootPath, entriesDir.root),
      entrypoints: otherEntries,
    });
  }

  console.log('Generated successfully!');
}
