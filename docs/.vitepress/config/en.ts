import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  description: 'The build tool for web extensions',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/web-extend' },
      { text: 'Examples', link: 'https://github.com/web-extend/web-extend/tree/main/examples' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Guide',
          base: '/guide/',
          collapsed: false,
          items: [
            { text: 'Introduction', link: 'introduction' },
            { text: 'Quick Start', link: 'quick-start' },
            { text: 'Project Structure', link: 'project-structure' },
            { text: 'Extension Entrypoints', link: 'extension-entrypoints' },
            { text: 'Browser Compatibility', link: 'browser' },
          ],
        },
        {
          text: 'API Reference',
          base: '/api/',
          collapsed: false,
          items: [
            { text: 'web-extend CLI', link: 'web-extend' },
            { text: '@web-extend/rsbuild', link: 'rsbuild-plugin' },
          ],
        },
      ],
    },
  },
});
