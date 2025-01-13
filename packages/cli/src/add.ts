import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { copyEntryFiles, getTemplatePath, normalizeTemplate } from './init.js';

export interface GenerateOptions {
  type: string;
  root: string;
  template?: string;
  outDir?: string;
  // only vald for icons
  filename?: string;
  size?: string;
}

const getProjectSrcDir = (rootPath: string, srcDir?: string | undefined) => {
  if (srcDir) return srcDir;
  return existsSync(resolve(rootPath, 'src')) ? './src' : './';
};

function getIconTemplatePath(root: string, template?: string) {
  let templatePath = '';
  if (template) {
    templatePath = resolve(root, template);
  } else {
    const name = 'icon.png';
    const srcPath = resolve(root, getProjectSrcDir(root));
    templatePath = resolve(srcPath, 'assets', name);
    if (!existsSync(templatePath)) {
      templatePath = resolve(srcPath, name);
    }
  }

  if (!existsSync(templatePath)) {
    throw new Error(`Cannot find template ${template}`);
  }
  return templatePath;
}

const ICON_SIZES = [16, 32, 48, 64, 128];

async function generateIcons({
  root,
  template,
  outDir,
  size = ICON_SIZES.join(','),
  filename = 'icon-{size}.png',
}: GenerateOptions) {
  const templatePath = getIconTemplatePath(root, template);

  const sizes = size
    .split(',')
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);

  for (const size of sizes) {
    const name = filename.replace('{size}', String(size));
    const destPath = outDir ? resolve(root, outDir) : resolve(dirname(templatePath));
    await sharp(templatePath).resize(size).toFile(resolve(destPath, name));
  }
}

async function generateEntryFiles({ type, root, template, outDir }: GenerateOptions) {
  const finalTemplate = await normalizeTemplate(template);
  const templatePath = getTemplatePath(finalTemplate);
  const destPath = outDir ? resolve(root, outDir) : resolve(root, getProjectSrcDir(root));
  await copyEntryFiles(resolve(templatePath, 'src'), destPath, [type]);
}

export async function generate(options: GenerateOptions) {
  if (options.type === 'icons') {
    return generateIcons(options);
  }
  return generateEntryFiles(options);
}
