import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cancel, intro, isCancel, log, multiselect, note, outro, select, spinner, text } from '@clack/prompts';
import { normalizeEntriesDir } from '@web-extend/manifest/common';
import type { WebExtendEntriesDir } from '@web-extend/manifest/types';
import chalk from 'chalk';
import { downloadTemplate } from 'giget';
import { ENTRYPOINT_ITEMS, type EntrypointItem, FRAMEWORKS, REPO, TOOLS } from './constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface InitCliOptions {
  root?: string;
  projectName?: string;
  override?: boolean;
  template?: string;
  entries?: string[];
  tools?: string[];
}

interface InitOptions {
  rootPath: string;
  projectName: string;
  override?: boolean;
  destPath: string;
  templatePath: string;
  entriesDir: WebExtendEntriesDir;
  entrypoints?: EntrypointItem[];
  tools?: string[];
}

function welcome() {
  console.log();
  intro(chalk.cyan('🚀 Welcome to WebExtend!'));
}

function farewell(options: InitCliOptions) {
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

export async function normalizeTemplatePath(value?: string) {
  let template = value;
  // only support ts template
  const variant = 'ts';
  if (!template) {
    const result = await select({
      message: 'Select framework',
      options: FRAMEWORKS,
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

  const templatePath = resolve(__dirname, `../templates/template-${template}`);
  if (!existsSync(templatePath)) {
    log.error(`Cannot find template ${value || template}`);
    cancel('Operation cancelled.');
    process.exit(1);
  }

  return templatePath;
}

async function normalizeProjectName(options: { rootPath: string; projectName?: string; override?: boolean }) {
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
  }

  return { projectName, override };
}

function isEntryNameValid(entryName: string) {
  const item = ENTRYPOINT_ITEMS.find(
    (item) => entryName === item.value || (item.multiplePrefix && entryName.startsWith(`${item.multiplePrefix}/`)),
  );
  return item;
}

export async function normalizeEntrypoints(
  entries: string[] | undefined,
  entriesDir: WebExtendEntriesDir,
  options: EntrypointItem[],
) {
  let entryNames = entries;
  if (!entryNames) {
    const result = await multiselect({
      message: 'Select entrypoints',
      options: options.map((item) => ({ label: item.name, value: item.value })),
      required: true,
    });
    if (isCancel(result)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    entryNames = result;
  }

  const entrypoints: EntrypointItem[] = [];
  for (const entry of entryNames) {
    const item = isEntryNameValid(entry);
    if (!item) {
      log.warn(`"${entry}" is not supported, the entrypoint will be ignored.`);
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

    entrypoints.push({ ...item, name: entryName });
  }

  if (!entrypoints.length) {
    log.error('No valid entrypoints selected.');
    cancel('Operation cancelled.');
    process.exit(1);
  }

  return entrypoints;
}

export async function normalizeInitOptions(cliOptions: InitCliOptions) {
  const rootPath = cliOptions.root || process.cwd();

  const { projectName, override } = await normalizeProjectName({
    rootPath,
    projectName: cliOptions.projectName,
    override: cliOptions.override,
  });
  const destPath = resolve(rootPath, projectName);
  const entriesDir = normalizeEntriesDir(destPath, {});

  const options: InitOptions = {
    ...cliOptions,
    rootPath,
    projectName,
    override,
    templatePath: cliOptions.template || '',
    destPath,
    entriesDir,
  };

  if (options.templatePath && isRemoteTemplate(options.templatePath)) {
    return options;
  }
  options.templatePath = await normalizeTemplatePath(options.templatePath);

  options.entrypoints = await normalizeEntrypoints(
    cliOptions.entries,
    entriesDir,
    ENTRYPOINT_ITEMS.filter((item) => item.value !== 'page' && item.value !== 'icons'),
  );

  if (!options.tools) {
    const result = await multiselect({
      message: 'Select additional tools',
      options: TOOLS,
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

  await downloadTemplate(`gh:${REPO}/${template}`, {
    dir: destPath,
    force: true,
  });

  if (existsSync(resolve(destPath, 'package.json'))) {
    s.stop('Downloaded template');
  } else {
    s.stop('Failed to download template');
    cancel('Operation cancelled.');
    process.exit(1);
  }
}

async function createProjectFromLocalTemplate(templatePath: string, destPath: string, options: InitOptions) {
  if (!existsSync(destPath)) {
    await mkdir(destPath, { recursive: true });
  }
  await copyTemplate(templatePath, destPath, options);
  await copyEntryFiles({
    sourcePath: resolve(templatePath, 'src'),
    destPath: resolve(destPath, options.entriesDir.root),
    entrypoints: options.entrypoints || [],
  });
}

async function copyTemplate(source: string, dest: string, options: InitCliOptions) {
  const files = await readdir(source, { withFileTypes: true });
  const entryNames = [...ENTRYPOINT_ITEMS.map((item) => item.value), 'web'];
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

async function modifyPackageJson(rootPath: string, options: InitOptions) {
  const { projectName, tools = [] } = options;
  const pkgPath = resolve(rootPath, 'package.json');
  const content = await readFile(pkgPath, 'utf-8');
  const newContent = JSON.parse(content);

  if (projectName) {
    newContent.name = basename(resolve(rootPath, projectName));
  }

  if (!isRemoteTemplate(options.templatePath || '')) {
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
    await mkdir(destPath, { recursive: true });
  }

  const files = await readdir(sourcePath, { withFileTypes: true });
  for (const item of entrypoints) {
    const { name, template, value } = item;
    const sourceFile = files.find((item) => template && item.name.startsWith(template));
    if (!sourceFile) {
      log.warn(`${value}'s template is not found, the entrypoint will be ignored.`);
      continue;
    }

    const destName = sourceFile.isFile() ? `${name}${extname(sourceFile.name)}` : name;
    await cp(resolve(sourcePath, sourceFile.name), resolve(destPath, destName), { recursive: true });
  }
}

export async function init(cliOptions: InitCliOptions) {
  welcome();
  const options = await normalizeInitOptions(cliOptions);
  const { templatePath, destPath } = options;

  if (isRemoteTemplate(templatePath)) {
    await createProjectFromRemoteTemplate(templatePath, destPath);
  } else {
    await createProjectFromLocalTemplate(templatePath, destPath, options);
  }

  await modifyPackageJson(destPath, options);
  farewell(options);
}
