import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkbox, input, select } from '@inquirer/prompts';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface InitialOptions {
  projectName?: string;
  template?: string;
  entry?: string[];
}

const frameworks = [
  {
    name: 'Vanilla',
    value: 'vanilla',
  },
  {
    name: 'React',
    value: 'react',
  },
  {
    name: 'Vue',
    value: 'vue',
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
  },
];

const entrypoints = [
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

const templates = ['vanilla-js', 'vanilla-ts', 'react-js', 'react-ts', 'vue-js', 'vue-ts'];

export async function normalizeTemplate(text?: string) {
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
    // const variant = list[1] || 'js';
    template = `${framework}-${variant}`;
  }

  if (!templates.includes(template)) {
    throw new Error("Template doesn't exist");
  }
  return template;
}

export async function normalizeInitialOptions(options: InitialOptions) {
  try {
    console.log();

    if (!options.projectName) {
      options.projectName = await input({ message: 'Project name or path', default: 'my-extension-app' });
    }

    // TODO： 校验是否存在
    const root = process.cwd();
    const projectPath = resolve(root, options.projectName);
    if (existsSync(projectPath)) {
      console.log(`${options.projectName} has exist.`);
      return null;
    }

    options.template = await normalizeTemplate(options.template);

    if (!options.entry) {
      options.entry = await checkbox({
        message: 'Select entry points',
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
      console.log(`${chalk.red('✕')} ${chalk.bold('Canceled')}\n`);
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

  await mkdir(destPath);
  await copyTemplate(templatePath, destPath);
  await copyEntryFiles(resolve(templatePath, 'src'), resolve(destPath, 'src'), options.entry);
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
