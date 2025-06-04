import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkbox, input, select } from '@inquirer/prompts';
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

const frameworks = [
  {
    name: chalk.yellow('Vanilla'),
    value: 'vanilla',
  },
  {
    name: chalk.cyan('React'),
    value: 'react',
  },
  {
    name: chalk.green('Vue'),
    value: 'vue',
  },
  {
    name: chalk.red('Svelte'),
    value: 'svelte',
  },
  {
    name: chalk.blueBright('Solid'),
    value: 'solid',
  },
];

const variants = [
  {
    name: 'TypeScript',
    value: 'ts',
  },
  {
    name: 'JavaScript',
    value: 'js',
    disabled: true,
  },
];

const tools: { name: string; value: ProjectToolType }[] = [
  {
    name: 'Add ESLint for code linting',
    value: 'eslint',
  },
  {
    name: 'Add Prettier for code formatting',
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

export const entrypoints: { name: string; value: EntryPointType; template: EntryTemplateType }[] = [
  {
    name: 'background',
    value: 'background',
    template: 'background',
  },
  {
    name: 'content',
    value: 'content',
    template: 'content',
  },
  {
    name: 'popup',
    value: 'popup',
    template: 'web',
  },
  {
    name: 'options',
    value: 'options',
    template: 'web',
  },
  {
    name: 'sidepanel',
    value: 'sidepanel',
    template: 'web',
  },
  {
    name: 'devtools',
    value: 'devtools',
    template: 'devtools',
  },
  {
    name: 'panel',
    value: 'panel',
    template: 'web',
  },
  {
    name: 'newtab',
    value: 'newtab',
    template: 'web',
  },
  {
    name: 'bookmarks',
    value: 'bookmarks',
    template: 'web',
  },
  {
    name: 'history',
    value: 'history',
    template: 'web',
  },
  {
    name: 'sandbox',
    value: 'sandbox',
    template: 'web',
  },
];

const templates = frameworks.flatMap((framework) =>
  variants.filter((variant) => !variant.disabled).map((variant) => `${framework.value}-${variant.value}`),
);

export async function resolveEntryTemplate(text?: string) {
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

  if (!templates.includes(template)) {
    throw new Error("Template doesn't exist");
  }
  return template;
}

export async function normalizeInitialOptions(options: InitialOptions) {
  console.log(chalk.bgCyan('\n Welcome to WebExtend \n'));

  if (!options.projectName) {
    options.projectName = await input({ message: 'Project name or path', default: 'my-extension-app' });
  }

  const root = process.cwd();
  const projectPath = resolve(root, options.projectName);
  if (existsSync(projectPath)) {
    options.override = await select({
      message: `Target directory ${options.projectName} is not empty, please choose`,
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

  options.template = await resolveEntryTemplate(options.template);

  if (!options.entries?.length) {
    options.entries = await checkbox({
      message: 'Select entrypoints',
      choices: entrypoints,
      loop: false,
      required: true,
    });
  }

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
