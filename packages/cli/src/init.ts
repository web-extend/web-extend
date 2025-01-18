import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkbox, input, select } from '@inquirer/prompts';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface InitialOptions {
  projectName?: string;
  template?: string;
  entries?: string[];
  override?: boolean;
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

export const entrypoints = [
  {
    name: 'background',
    value: 'background',
  },
  {
    name: 'content',
    value: 'content',
  },
  {
    name: 'popup',
    value: 'popup',
  },
  {
    name: 'options',
    value: 'options',
  },
  {
    name: 'devtools',
    value: 'devtools',
  },
  {
    name: 'sidepanel',
    value: 'sidepanel',
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
      message: 'Select a framework',
      choices: frameworks,
    });
    // const variant = await select({
    //   message: 'Select a variant',
    //   choices: variants,
    // });
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
  try {
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
      });
    }

    console.log('\nDone. Next step:');
    console.group();
    console.log(`cd ${options.projectName}`);
    console.log('npm install');
    console.log('npm run dev');
    console.groupEnd();
    return options;
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log(`${chalk.red('✕')} ${chalk.bold('Canceled')}`);
      return null;
    }
    throw error;
  }
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
  await copyTemplate(templatePath, destPath);
  await copyEntryFiles(resolve(templatePath, 'src'), resolve(destPath, 'src'), options.entries);
  await modifyPackageJson(destPath, basename(projectName));
}

export function getTemplatePath(template: string) {
  const templatePath = resolve(__dirname, `../templates/template-${template}`);
  if (!existsSync(templatePath)) {
    throw new Error(`Cannot find template ${template}`);
  }
  return templatePath;
}

async function copyTemplate(source: string, dest: string) {
  const files = await readdir(source, { withFileTypes: true });
  const ingoredEntrypoints = entrypoints.map((item) => item.value);

  for (const file of files) {
    const { name } = file;
    const srcPath = resolve(source, name);
    const destPath = resolve(dest, name);

    if (['node_modules', 'dist'].includes(name)) continue;
    if (file.isDirectory()) {
      await cp(srcPath, destPath, {
        recursive: true,
        filter: (s) => {
          if (name === 'src') {
            // exclude all entrypoints
            const entryPath = relative(srcPath, s);
            const ignored = ingoredEntrypoints.some((item) => entryPath.includes(item));
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

async function modifyPackageJson(root: string, projectName: string) {
  const pkgPath = resolve(root, 'package.json');
  const content = await readFile(pkgPath, 'utf-8');
  const newContent = JSON.parse(content);
  newContent.name = projectName;
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
    let entryName = entry;
    let custom = false;
    if (entry.startsWith('contents/')) {
      entryName = 'content';
      custom = true;
    }

    const file = files.find((item) => item.name.startsWith(entryName));
    if (!file) continue;

    const { name } = file;
    const destName = custom ? entry : name;
    await cp(resolve(source, name), resolve(dest, destName), { recursive: true });
  }
}

export async function init(cliOptions: InitialOptions) {
  const options = await normalizeInitialOptions(cliOptions);
  if (options) {
    await createProject(options);
  }
}
