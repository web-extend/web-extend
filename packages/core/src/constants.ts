import type { WebExtendMultipleEntryKey, WebExtendSingleEntryKey } from '@web-extend/manifest/types';
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

export interface EntrypointItem {
  name: string;
  value: WebExtendSingleEntryKey | WebExtendMultipleEntryKey;
  template?: 'background' | 'content' | 'devtools' | 'web' | null;
  multiple?: boolean; // default is false
}

export const ENTRYPOINT_ITEMS: EntrypointItem[] = [
  {
    name: 'background',
    value: 'background',
    template: 'background',
  },
  {
    name: 'contents',
    value: 'contents',
    template: 'web',
    multiple: true,
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
    name: 'panels',
    value: 'panels',
    template: 'web',
    multiple: true,
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
    name: 'sandboxes',
    value: 'sandboxes',
    template: 'web',
    multiple: true,
  },
  {
    name: 'sandbox',
    value: 'sandbox',
    template: 'web',
  },
  {
    name: 'icons',
    value: 'icons',
    template: null,
  },
  {
    name: 'pages',
    value: 'pages',
    template: 'web',
    multiple: true,
  },
  {
    name: 'scripting',
    value: 'scripting',
    template: null,
    multiple: true,
  },
];

export const TOOLS = [
  {
    label: 'ESLint for code linting',
    value: 'eslint',
  },
  {
    label: 'Prettier for code formatting',
    value: 'prettier',
  },
];

export const REPO = 'web-extend/examples';
