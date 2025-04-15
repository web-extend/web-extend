import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Option, cancel, intro, isCancel, multiselect, note, outro, select, text } from '@clack/prompts';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

type ProjectToolType = 'eslint' | 'prettier';

export interface InitialOptions {
  projectName?: string;
  template?: string;
  entries?: string[];
  override?: boolean;
  tools?: ProjectToolType[];
}

const frameworks: Option<string>[] = [
  {
    label: chalk.yellow('Vanilla'),
    value: 'vanilla',
  },
  {
    label: chalk.cyan('React'),
    value: 'react',
  },
  {
    label: chalk.green('Vue'),
    value: 'vue',
  },
  {
    label: chalk.red('Svelte'),
    value: 'svelte',
  },
  {
    label: chalk.blueBright('Solid'),
    value: 'solid',
  },
];

const variants = [
  {
    label: 'TypeScript',
    value: 'ts',
  },
  {
    label: 'JavaScript',
    value: 'js',
    disabled: true,
  },
];

const tools: Option<ProjectToolType>[] = [
  {
    label: 'Add ESLint for code linting',
    value: 'eslint',
  },
  {
    label: 'Add Prettier for code formatting',
    value: 'prettier',
  },
];

export type EntryPointType =
  | 'background'
  | 'content'
  | 'popup'
  | 'options'
  | 'sidepanel'
  | 'devtools'
  | 'panel'
  | 'newtab'
  | 'bookmarks'
  | 'history'
  | 'sandbox';

export type EntryTemplateType = 'background' | 'content' | 'devtools' | 'web';

export const entrypoints: (Option<EntryPointType> & { template: EntryTemplateType })[] = [
  {
    label: 'background',
    value: 'background',
    template: 'background',
  },
  {
    label: 'content',
    value: 'content',
    template: 'content',
  },
  {
    label: 'popup',
    value: 'popup',
    template: 'web',
  },
  {
    label: 'options',
    value: 'options',
    template: 'web',
  },
  {
    label: 'sidepanel',
    value: 'sidepanel',
    template: 'web',
  },
  {
    label: 'devtools',
    value: 'devtools',
    template: 'devtools',
  },
  {
    label: 'panel',
    value: 'panel',
    template: 'web',
  },
  {
    label: 'newtab',
    value: 'newtab',
    template: 'web',
  },
  {
    label: 'bookmarks',
    value: 'bookmarks',
    template: 'web',
  },
  {
    label: 'history',
    value: 'history',
    template: 'web',
  },
  {
    label: 'sandbox',
    value: 'sandbox',
    template: 'web',
  },
];

const templates = frameworks.flatMap((framework) =>
  variants.filter((variant) => !variant.disabled).map((variant) => `${framework.value}-${variant.value}`),
);

export async function resolveEntryTemplate(text?: string) {
  let template = '';
  const variant = 'ts';
  if (!text) {
    const value = await select({
      message: 'Select framework',
      options: frameworks,
    });
    if (isCancel(value)) {
      cancel('Operation cancelled');
      return;
    }
    template = `${value}-${variant}`;
  } else {
    const list = text.split('-');
    template = `${list[0]}-${variant}`;
  }

  if (!templates.includes(template)) {
    throw new Error("Template doesn't exist");
  }
  return template;
}

export async function normalizeInitialOptions(options: InitialOptions) {
  console.log();
  intro(chalk.bgCyan(' Welcome to WebExtend '));

  if (!options.projectName) {
    const value = await text({ message: 'Project name or path', placeholder: 'my-extension-app' });
    if (isCancel(value)) {
      cancel('Operation cancelled');
      return;
    }
    options.projectName = value;
  }

  const root = process.cwd();
  const projectPath = resolve(root, options.projectName);
  if (existsSync(projectPath)) {
    const value = await select({
      message: `Target ${chalk.yellow(options.projectName)} is not empty, please choose`,
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
    if (isCancel(value) || !value) {
      cancel('Operation cancelled');
      return;
    }
    options.override = value;
  }

  options.template = await resolveEntryTemplate(options.template);
  if (!options.template) {
    return;
  }

  if (!options.entries?.length) {
    const value = await multiselect({
      message: 'Select entrypoints',
      options: entrypoints,
    });
    if (isCancel(value)) {
      cancel('Operation cancelled');
      return;
    }
    options.entries = value;
  }

  if (!options.tools?.length) {
    const value = await multiselect({
      message: 'Select additional tools',
      options: tools,
      required: false,
    });
    if (isCancel(value)) {
      cancel('Operation cancelled');
      return;
    }
    options.tools = value;
  }

  const nextSteps = [
    `1. ${chalk.cyan(`cd ${options.projectName}`)}`,
    `2. ${chalk.cyan('git init')} ${chalk.dim('(optional)')}`,
    `3. ${chalk.cyan('npm install')}`,
    `4. ${chalk.cyan('npm run dev')}`,
  ];
  note(nextSteps.map((step) => chalk.reset(step)).join('\n'), 'Next steps');
  outro('Done');

  return options;
}

export async function createProject(options: InitialOptions) {
  const { projectName, template } = options;
  if (!projectName || !template) return;

  const root = process.cwd();
  const templatePath = getTemplatePath(template);
  const destPath = resolve(root, projectName);

  if (!existsSync(destPath)) {
    await mkdir(destPath);
  }
  await copyTemplate(templatePath, destPath, options);
  await copyEntryFiles(resolve(templatePath, 'src'), resolve(destPath, 'src'), options.entries);
  await modifyPackageJson(destPath, options);
}

export function getTemplatePath(template: string) {
  const templatePath = resolve(__dirname, `../templates/template-${template}`);
  if (!existsSync(templatePath)) {
    throw new Error(`Cannot find template ${template}`);
  }
  return templatePath;
}

async function copyTemplate(source: string, dest: string, options: InitialOptions) {
  const files = await readdir(source, { withFileTypes: true });
  const entryNames = [...entrypoints.map((item) => item.value), 'web'];
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

async function modifyPackageJson(root: string, options: InitialOptions) {
  const { projectName, tools = [] } = options;
  const pkgPath = resolve(root, 'package.json');
  const content = await readFile(pkgPath, 'utf-8');
  const newContent = JSON.parse(content);

  if (projectName) {
    newContent.name = basename(resolve(root, projectName));
  }

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

  await writeFile(pkgPath, JSON.stringify(newContent, null, 2), 'utf-8');
}

export async function copyEntryFiles(source: string, dest: string, entries?: string[]) {
  if (!entries?.length) return;

  if (!existsSync(source)) {
    throw new Error("Source directory doesn't exist");
  }
  if (!existsSync(dest)) {
    await mkdir(dest);
  }

  const files = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const item = entrypoints.find((item) => entry.startsWith(item.value));
    if (!item) continue;

    const templateName = item.template;
    const file = files.find((item) => item.name.startsWith(templateName));
    if (!file) continue;

    const { name } = file;
    const destName = file.isFile() ? name : entry;
    await cp(resolve(source, name), resolve(dest, destName), { recursive: true });
  }
}

export async function init(cliOptions: InitialOptions) {
  const options = await normalizeInitialOptions(cliOptions);
  if (options) {
    await createProject(options);
  }
}
