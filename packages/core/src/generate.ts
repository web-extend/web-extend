import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeEntriesDir } from '@web-extend/manifest/common';
import type { WebExtendEntriesDir } from '@web-extend/manifest/types';
import { loadWebExtendConfig } from './config.js';
import { ENTRYPOINT_ITEMS } from './constants.js';
import { copyEntryFiles, getTemplatePath, normalizeEntrypoints, normalizeTemplate } from './init.js';

export interface GenerateOptions {
  entries: string[];
  root: string;
  template?: string;
  size?: string[]; // just for icons
}

function getIconTemplatePath({
  root,
  entriesDir,
  template,
}: { root: string; entriesDir: WebExtendEntriesDir; template?: string }) {
  let templatePath = '';
  if (template) {
    templatePath = resolve(root, template);
  } else {
    const templateNames = ['icon.png', 'icon-1024.png', 'icon-512.png', 'icon-128.png'];
    for (const name of templateNames) {
      const path = resolve(root, entriesDir.root, entriesDir.icons, name);
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
  root,
  template,
  entriesDir,
  size = ICON_SIZES,
}: GenerateOptions & { entriesDir: WebExtendEntriesDir }) {
  const sharp = await import('sharp').then((mod) => mod.default);

  const templatePath = getIconTemplatePath({ root, template, entriesDir });
  const filename = 'icon-{size}.png';

  const sizes = size.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0);

  for (const size of sizes) {
    const name = filename.replace('{size}', String(size));
    const destPath = resolve(root, entriesDir.root, entriesDir.icons);
    const destFile = resolve(destPath, name);
    if (existsSync(destFile)) continue;
    await sharp(templatePath).resize(size).toFile(destFile);
  }
}

export async function generate(options: GenerateOptions) {
  const { content: webExtendConfig } = await loadWebExtendConfig(options.root);
  const entriesDir = normalizeEntriesDir(options.root, webExtendConfig?.entriesDir || webExtendConfig?.srcDir);
  const entrypoints = await normalizeEntrypoints(options.entries, entriesDir, ENTRYPOINT_ITEMS);

  const iconsEntrypoint = entrypoints.find((item) => item.value === 'icons');
  if (iconsEntrypoint) {
    await generateIcons({ ...options, entriesDir });
  }

  const otherEntries = entrypoints.filter((item) => item.value !== 'icons');
  if (otherEntries.length) {
    const template = await normalizeTemplate(options.template);
    const templatePath = getTemplatePath(template);

    await copyEntryFiles({
      sourcePath: resolve(templatePath, 'src'),
      destPath: resolve(options.root, entriesDir.root),
      entrypoints: otherEntries,
    });
  }
}
