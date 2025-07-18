import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkbox, input, select } from '@inquirer/prompts';
import { normalizeEntriesDir } from '@web-extend/manifest/common';
import type { WebExtendEntriesDir } from '@web-extend/manifest/types';
import chalk from 'chalk';
import { type EntrypointItem, entryTemplates, entrypointItems, frameworks, tools } from './constants.js';
import { downloadTemplate } from 'giget';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = 'web-extend/examples';

interface InitOptions {
  projectName?: string;
  template?: string;
  entries?: string[];
  override?: boolean;
  tools?: string[];
}

function isRemoteTemplate(template: string) {
  return template.startsWith('with-');
}

export async function normalizeTemplate(text?: string) {
  let template = '';
  // only support ts template
  const variant = 'ts';
  if (!text) {
    const framework = await select({
      message: 'Select framework',
      choices: frameworks,
    });
    template = `${framework}-${variant}`;
  } else {
    const list = text.split('-');
    const framework = list[0];
    template = `${framework}-${variant}`;
  }

  if (!entryTemplates.includes(template)) {
    throw new Error("Template doesn't exist");
  }
  return template;
}

export async function normalizeInitOptions(options: InitOptions) {
  console.log(chalk.cyan('\n 🚀 Welcome to WebExtend! \n'));

  // normalize projectName
  if (!options.projectName) {
    options.projectName = await input({ message: 'Project name', default: 'my-extension-app' });
  }

  const root = process.cwd();
  const projectPath = resolve(root, options.projectName);
  if (existsSync(projectPath)) {
    options.override = await select({
      message: `${options.projectName} is not empty, please choose`,
      choices: [
        {
          name: 'Cancel operation',
          value: false,
        },
        {
          name: 'Continue and override files',
          value: true,
        },
      ],
    });
    if (!options.override) {
      const error = new Error('Cancel operation');
      error.name = 'ExitPromptError';
      throw error;
    }
  }

  // normalize template
  if (isRemoteTemplate(options.template || '')) {
    return options;
  }
  options.template = await normalizeTemplate(options.template);

  // normalize entries
  if (!options.entries?.length) {
    options.entries = await checkbox({
      message: 'Select entrypoints',
      choices: entrypointItems,
      loop: false,
      required: true,
    });
    if (options.entries.includes('page')) {
      const name = await input({ message: 'What is the name of page?', required: true });
      options.entries = options.entries.filter((item) => item !== 'page').concat(`pages/${name}`);
    }
  }

  // normalize tools
  if (!options.tools?.length) {
    options.tools = await checkbox({
      message: 'Select additional tools',
      choices: tools,
      loop: false,
    });
  }

  const pkgManager = 'npm';
  console.log('\nDone. Next steps:');
  console.group();
  console.log(`1. cd ${options.projectName}`);
  console.log(`2. git init ${chalk.dim('(optional)')}`);
  console.log(`3. ${pkgManager} install`);
  console.log(`4. ${pkgManager} run dev`);
  console.groupEnd();
  console.log();
  return options;
}

export async function createProject(options: InitOptions) {
  const { projectName, template } = options;
  if (!projectName || !template) return;

  const root = process.cwd();
  const destPath = resolve(root, projectName);

  if (isRemoteTemplate(template)) {
    await downloadTemplate(`gh:${REPO}/${template}`, {
      dir: destPath,
      force: true,
    });
  } else {
    const templatePath = getTemplatePath(template);
    if (!existsSync(destPath)) {
      await mkdir(destPath);
    }
    await copyTemplate(templatePath, destPath, options);

    const entriesDir = normalizeEntriesDir(destPath, {});
    const entrypoints = await normalizeEntrypoints(options.entries || [], entriesDir);
    await copyEntryFiles({
      sourcePath: resolve(templatePath, 'src'),
      destPath: resolve(destPath, entriesDir.root),
      entrypoints,
    });
  }
  await modifyPackageJson(destPath, options);
}

export function getTemplatePath(template: string) {
  const templatePath = resolve(__dirname, `../templates/template-${template}`);
  if (!existsSync(templatePath)) {
    throw new Error(`Cannot find template ${template}`);
  }
  return templatePath;
}

async function copyTemplate(source: string, dest: string, options: InitOptions) {
  const files = await readdir(source, { withFileTypes: true });
  const entryNames = [...entrypointItems.map((item) => item.value), 'web'];
  const { tools = [] } = options;

  const ignores = ['node_modules', 'dist', '.web-extend'];
  if (!tools.includes('eslint')) {
    ignores.push('eslint.config.js');
  }
  if (!tools.includes('prettier')) {
    ignores.push('.prettierrc', '.prettierignore');
  }

  for (const file of files) {
    const { name } = file;
    const srcPath = resolve(source, name);
    const destPath = resolve(dest, name);

    if (ignores.includes(name)) continue;

    if (file.isDirectory()) {
      await cp(srcPath, destPath, {
        recursive: true,
        filter: (s) => {
          const fileRelativePath = relative(srcPath, s);
          if (name === 'src') {
            // ignore all entry files
            const ignored = entryNames.some((item) => fileRelativePath.includes(item));
            return !ignored;
          }
          return true;
        },
      });
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function modifyPackageJson(root: string, options: InitOptions) {
  const { projectName, tools = [] } = options;
  const pkgPath = resolve(root, 'package.json');
  const content = await readFile(pkgPath, 'utf-8');
  const newContent = JSON.parse(content);

  if (projectName) {
    newContent.name = basename(resolve(root, projectName));
  }

  if (!isRemoteTemplate(options.template || '')) {
    const scripts: Record<string, string | undefined> = newContent.scripts || {};
    const devDependencies: Record<string, string | undefined> = newContent.devDependencies || {};

    if (!tools.includes('eslint')) {
      scripts.lint = undefined;
      for (const key in devDependencies) {
        if (key.includes('eslint') || key === 'globals') {
          devDependencies[key] = undefined;
        }
      }
    }

    if (!tools.includes('prettier')) {
      scripts.format = undefined;
      for (const key in devDependencies) {
        if (key.includes('prettier')) {
          devDependencies[key] = undefined;
        }
      }
    }
  }
  
  await writeFile(pkgPath, JSON.stringify(newContent, null, 2), 'utf-8');
}

export async function normalizeEntrypoints(entries: string[], entriesDir: WebExtendEntriesDir) {
  const res: EntrypointItem[] = [];
  for (const entry of entries) {
    const item = entrypointItems.find(
      (item) => entry === item.value || (item.multiplePrefix && entry.startsWith(`${item.multiplePrefix}/`)),
    );
    if (!item) {
      console.warn(`Entry ${entry} is not supported, ignored`);
      continue;
    }

    let entryName = entry;
    if (entry === 'page') {
      const name = await input({ message: 'What is the name of page?', required: true });
      entryName = `${item.multiplePrefix}/${name}`;
    }

    // map entryName to entriesDir
    if (entryName in entriesDir) {
      const value = entriesDir[entryName as keyof WebExtendEntriesDir];
      entryName = value;
    } else if (item.multiplePrefix && item.multiplePrefix in entriesDir) {
      const key = entriesDir[item.multiplePrefix as keyof WebExtendEntriesDir];
      entryName = entryName.replace(item.multiplePrefix, key);
    }

    res.push({ ...item, name: entryName });
  }
  return res;
}

export async function copyEntryFiles({
  sourcePath,
  destPath,
  entrypoints,
}: { sourcePath: string; destPath: string; entrypoints?: EntrypointItem[] }) {
  if (!entrypoints?.length) return;

  if (!existsSync(sourcePath)) {
    throw new Error("Source directory doesn't exist");
  }
  if (!existsSync(destPath)) {
    await mkdir(destPath);
  }

  const files = await readdir(sourcePath, { withFileTypes: true });
  for (const item of entrypoints) {
    const { name, template } = item;
    const sourceFile = files.find((item) => item.name.startsWith(template));
    if (!sourceFile) {
      console.warn(`Template ${template} is not found`);
      continue;
    }

    const destName = sourceFile.isFile() ? `${name}${extname(sourceFile.name)}` : name;
    await cp(resolve(sourcePath, sourceFile.name), resolve(destPath, destName), { recursive: true });
  }
}

export async function init(cliOptions: InitOptions) {
  const options = await normalizeInitOptions(cliOptions);
  console.log(options);
  if (options) {
    await createProject(options);
  }
}
