import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkbox } from '@inquirer/prompts';
import { resolveSrcDir } from '@web-extend/manifest/common';
import { entrypointItems } from './constant.js';
import { checkEntrypoints, copyEntryFiles, getTemplatePath, resolveEntryTemplate } from './init.js';
import { loadWebExtendConfig } from './config.js';

export interface GenerateOptions {
  entries: string[];
  root: string;
  template?: string;
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

async function generateIcons({
  root,
  template,
  srcDir,
  size = ICON_SIZES.join(','),
}: GenerateOptions & { srcDir: string }) {
  const sharp = await import('sharp').then((mod) => mod.default);

  const templatePath = getIconTemplatePath(root, template);
  const filename = 'icon-{size}.png';

  const sizes = size
    .split(',')
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);

  for (const size of sizes) {
    const name = filename.replace('{size}', String(size));
    const destPath = resolve(root, srcDir, 'assets');
    await sharp(templatePath).resize(size).toFile(resolve(destPath, name));
  }
}

async function generateEntryFiles({ root, template, srcDir, entries }: GenerateOptions & { srcDir: string }) {
  const entrypoints = await checkEntrypoints(entries || []);
  if (!entrypoints.length) {
    throw Error('Please select an entrypoint at least.');
  }

  const finalTemplate = await resolveEntryTemplate(template);
  const templatePath = getTemplatePath(finalTemplate);
  const destPath = resolve(root, srcDir);
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
  const srcDir = webExtendConfig?.srcDir || resolveSrcDir(options.root);

  if (entries.includes('icons')) {
    await generateIcons({ ...options, srcDir });
  }

  const otherEntries = entries.filter((item) => item !== 'icons');
  if (otherEntries.length) {
    await generateEntryFiles({
      ...options,
      entries: otherEntries,
      srcDir,
    });
  }
}
