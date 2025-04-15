import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveSrcDir } from '@web-extend/manifest/common';
import { multiselect, isCancel, cancel } from '@clack/prompts';
import { copyEntryFiles, entrypoints, getTemplatePath, resolveEntryTemplate } from './init.js';

export interface GenerateOptions {
  entries: string[];
  root: string;
  template?: string;
  outDir?: string;
  size?: string; // just for icons
}

function getIconTemplatePath(root: string, template?: string) {
  let templatePath = '';
  if (template) {
    templatePath = resolve(root, template);
  } else {
    const name = 'icon.png';
    const srcPath = resolve(root, resolveSrcDir(root));
    templatePath = resolve(srcPath, 'assets', name);
    if (!existsSync(templatePath)) {
      templatePath = resolve(srcPath, name);
    }
  }

  if (!existsSync(templatePath)) {
    throw new Error('Cannot find the template of icons');
  }
  return templatePath;
}

const ICON_SIZES = [16, 32, 48, 128];

async function generateIcons({ root, template, outDir, size = ICON_SIZES.join(',') }: GenerateOptions) {
  const sharp = await import('sharp').then((mod) => mod.default);

  const templatePath = getIconTemplatePath(root, template);
  const filename = 'icon-{size}.png';

  const sizes = size
    .split(',')
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);

  for (const size of sizes) {
    const name = filename.replace('{size}', String(size));
    const destPath = outDir ? resolve(root, outDir) : resolve(root, resolveSrcDir(root), 'assets');
    await sharp(templatePath).resize(size).toFile(resolve(destPath, name));
  }
}

async function generateEntryFiles({ root, template, outDir, entries }: GenerateOptions) {
  const finalTemplate = await resolveEntryTemplate(template);
  if (!finalTemplate) return;
  const templatePath = getTemplatePath(finalTemplate);
  const destPath = outDir ? resolve(root, outDir) : resolve(root, resolveSrcDir(root));
  await copyEntryFiles(resolve(templatePath, 'src'), destPath, entries);
}

export async function generate(options: GenerateOptions) {
  if (!options.entries.length) {
    console.log();

    const value = await multiselect({
      message: 'Select entrypoints',
      options: [...entrypoints, { label: 'icons', value: 'icons' }],
    });
    if (isCancel(value)) {
      cancel('Operation cancelled');
      const error = new Error('Operation cancelled');
      error.name = 'ExitPromptError';
      throw error;
    }

    options.entries = value;
  }

  const { entries = [] } = options;

  if (!entries.length) {
    throw Error('Please select an entrypoint at least.');
  }

  if (entries.includes('icons')) {
    await generateIcons(options);
  }

  const otherEntries = entries.filter((item) => item !== 'icons');
  if (otherEntries.length) {
    await generateEntryFiles({
      ...options,
      entries: otherEntries,
    });
  }
}
