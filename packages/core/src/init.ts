import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { intro, spinner, text, isCancel, cancel, select, multiselect, note, outro } from '@clack/prompts';
import { normalizeEntriesDir } from '@web-extend/manifest/common';
import type { WebExtendEntriesDir } from '@web-extend/manifest/types';
import chalk from 'chalk';
import { downloadTemplate } from 'giget';
import { type EntrypointItem, entryTemplates, entrypointItems, frameworks, tools } from './constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = 'web-extend/examples';

interface InitOptions {
  rootPath?: string;
  projectName?: string;
  override?: boolean;
  template?: string;
  entries?: string[];
  tools?: string[];
}

function welcome() {
  console.log();
  intro(chalk.cyan('🚀 Welcome to WebExtend!'));
}

function farewell(options: InitOptions) {
  const pkgManager = 'npm';
  const nextSteps = [
    `1. ${`cd ${options.projectName}`}`,
    `2. ${'git init'} ${chalk.dim('(optional)')}`,
    `3. ${pkgManager} install`,
    `4. ${pkgManager} run dev`,
  ];
  note(nextSteps.map((step) => chalk.reset(step)).join('\n'), 'Next steps');
  outro('Done');
}

function isRemoteTemplate(template: string) {
  return template.startsWith('with-');
}

export async function normalizeTemplate(value?: string) {
  let template = value;

  // only support ts template
  const variant = 'ts';
  if (!template) {
    const result = await select({
      message: 'Select framework',
      options: frameworks.map((item) => ({ label: item.name, value: item.value })),
    });
    if (isCancel(result)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    template = `${result}-${variant}`;
  } else {
    const framework = template.split('-')[0];
    template = `${framework}-${variant}`;
  }

  if (!entryTemplates.includes(template)) {
    throw new Error("Template doesn't exist");
  }

  return template;
}

async function normalizeProjectName(options: InitOptions) {
  let projectName = options.projectName;
  let override = options.override;

  if (!projectName) {
    const result = await text({
      message: 'Project name',
      placeholder: 'my-extension-app',
      validate(value) {
        if (!value) return 'Project name is required!';
      },
    });
    if (isCancel(result)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    projectName = result;
  }

  const projectPath = resolve(options.rootPath || process.cwd(), projectName);
  if (existsSync(projectPath)) {
    const result =
      override !== undefined
        ? override
        : await select({
            message: `"${projectName}" is not empty, please choose`,
            options: [
              {
                label: 'Cancel operation',
                value: false,
              },
              {
                label: 'Continue and override files',
                value: true,
              },
            ],
          });

    if (isCancel(result) || !result) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    override = result;
  } else {
    override = true;
  }

  return { projectName, override };
}

export async function normalizeInitOptions(options: InitOptions) {
  welcome();

  if (!options.rootPath) {
    options.rootPath = process.cwd();
  }

  const { projectName, override } = await normalizeProjectName(options);
  options.projectName = projectName;
  options.override = override;

  if (options.template && isRemoteTemplate(options.template)) {
    return options;
  }
  options.template = await normalizeTemplate(options.template);

  if (!options.entries?.length) {
    const result = await multiselect({
      message: 'Select entrypoints',
      options: entrypointItems.map((item) => ({ label: item.name, value: item.value })),
      required: true,
    });
    if (isCancel(result)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    options.entries = result;
  }

  if (!options.tools?.length) {
    const result = await multiselect({
      message: 'Select additional tools',
      options: tools.map((item) => ({ label: item.name, value: item.value })),
      required: false,
    });
    if (isCancel(result)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    options.tools = result;
  }

  return options;
}

async function createProjectFromRemoteTemplate(template: string, destPath: string) {
  const s = spinner();
  s.start('Downloading template...');
  try {
    await downloadTemplate(`gh:${REPO}/${template}`, {
      dir: destPath,
      force: true,
    });
    s.stop('Downloaded template');
  } catch (error) {
    s.stop('Failed to download template');
    throw error;
  }
}

async function createProjectFromLocalTemplate(template: string, destPath: string, options: InitOptions) {
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

export async function createProject(options: InitOptions) {
  const { projectName, template } = options;
  if (!projectName || !template) return;

  const destPath = resolve(options.rootPath || process.cwd(), projectName);

  if (isRemoteTemplate(template)) {
    await createProjectFromRemoteTemplate(template, destPath);
  } else {
    await createProjectFromLocalTemplate(template, destPath, options);
  }

  await modifyPackageJson(destPath, options);
  farewell(options);
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
  await createProject(options);
}
