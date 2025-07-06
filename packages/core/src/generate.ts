import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkbox } from '@inquirer/prompts';
import { normalizeEntriesDir } from '@web-extend/manifest/common';
import { loadWebExtendConfig } from './config.js';
import { entrypointItems } from './constant.js';
import { checkEntrypoints, copyEntryFiles, getTemplatePath, resolveEntryTemplate } from './init.js';
import type { WebExtendEntriesDir } from '@web-extend/manifest/types';

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

async function generateEntryFiles({
  root,
  template,
  entriesDir,
  entries,
}: GenerateOptions & { entriesDir: WebExtendEntriesDir }) {
  const entrypoints = await checkEntrypoints(entries || []);
  if (!entrypoints.length) {
    throw Error('Please select an entrypoint at least.');
  }

  const finalTemplate = await resolveEntryTemplate(template);
  const templatePath = getTemplatePath(finalTemplate);
  const destPath = resolve(root, entriesDir.root);
  await copyEntryFiles(resolve(templatePath, 'src'), destPath, entrypoints);
}

export async function generate(options: GenerateOptions) {
  if (!options.entries.length) {
    options.entries = await checkbox({
      message: 'Select entrypoints',
      choices: [...entrypointItems, { name: 'icons', value: 'icons' }],
      loop: false,
      required: true,
    });
  }

  const { entries = [] } = options;

  if (!entries.length) {
    throw Error('Please select an entrypoint at least.');
  }

  const { content: webExtendConfig } = await loadWebExtendConfig(options.root);
  const entriesDir = normalizeEntriesDir(options.root, webExtendConfig?.entriesDir || webExtendConfig?.srcDir);

  if (entries.includes('icons')) {
    await generateIcons({ ...options, entriesDir });
  }

  const otherEntries = entries.filter((item) => item !== 'icons');
  if (otherEntries.length) {
    await generateEntryFiles({
      ...options,
      entries: otherEntries,
      entriesDir,
    });
  }
}
