import chalk from 'chalk';

export const frameworks = [
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
    name: chalk.magenta('Preact'),
    value: 'preact',
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

export const variants = [
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

export const entryTemplates = frameworks.flatMap((framework) =>
  variants.filter((variant) => !variant.disabled).map((variant) => `${framework.value}-${variant.value}`),
);

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

export interface EntrypointItem {
  name: string;
  value: EntryPointType;
  template: EntryTemplateType;
  multiplePrefix?: string;
}

export const entrypointItems: EntrypointItem[] = [
  {
    name: 'background',
    value: 'background',
    template: 'background',
  },
  {
    name: 'content',
    value: 'content',
    template: 'content',
    multiplePrefix: 'contents',
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
    multiplePrefix: 'panels',
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
    multiplePrefix: 'sandboxes',
  },
];

type ProjectToolType = 'eslint' | 'prettier';
export const tools: { name: string; value: ProjectToolType }[] = [
  {
    name: 'Add ESLint for code linting',
    value: 'eslint',
  },
  {
    name: 'Add Prettier for code formatting',
    value: 'prettier',
  },
];
