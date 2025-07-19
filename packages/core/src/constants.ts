import chalk from 'chalk';

export const FRAMEWORKS = [
  {
    label: chalk.yellow('Vanilla'),
    value: 'vanilla',
    packageName: '',
  },
  {
    label: chalk.cyan('React'),
    value: 'react',
    packageName: 'react',
  },
  {
    label: chalk.green('Vue'),
    value: 'vue',
    packageName: 'vue',
  },
  {
    label: chalk.magenta('Preact'),
    value: 'preact',
    packageName: 'preact',
  },
  {
    label: chalk.red('Svelte'),
    value: 'svelte',
    packageName: 'svelte',
  },
  {
    label: chalk.blueBright('Solid'),
    value: 'solid',
    packageName: 'solid-js',
  },
];

export const variants = [
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

// export const TEMPLATES = FRAMEWORKS.flatMap((framework) =>
//   variants.filter((variant) => !variant.disabled).map((variant) => `${framework.value}-${variant.value}`),
// );

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
  | 'sandbox'
  | 'page'
  | 'icons';

export type EntryTemplateType = 'background' | 'content' | 'devtools' | 'web';

export interface EntrypointItem {
  name: string;
  value: EntryPointType;
  template?: EntryTemplateType | null;
  multiplePrefix?: string;
}

export const ENTRYPOINT_ITEMS: EntrypointItem[] = [
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
  {
    name: 'icons',
    value: 'icons',
    template: null,
  },
  {
    name: 'page',
    value: 'page',
    template: 'web',
    multiplePrefix: 'pages',
  },
];

export const tools = [
  {
    label: 'Add ESLint for code linting',
    value: 'eslint',
  },
  {
    label: 'Add Prettier for code formatting',
    value: 'prettier',
  },
];

export const REPO = 'web-extend/examples';
