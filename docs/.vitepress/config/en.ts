import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  description: 'The build tool for web extensions',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/start/introduction' },
      { text: 'API', link: '/api/web-extend' },
      { text: 'Examples', link: 'https://github.com/web-extend/examples' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Start',
          base: '/guide/start/',
          collapsed: false,
          items: [
            { text: 'Introduction', link: 'introduction' },
            { text: 'Quick Start', link: 'quick-start' },
            { text: 'Project Structure', link: 'project-structure' },
            { text: 'Entrypoints', link: 'entrypoints' },
            { text: 'Browsers', link: 'browsers' },
            { text: 'Remote Code', link: 'remote-code' },
          ],
        },
        {
          text: 'Migration',
          base: '/guide/migration/',
          collapsed: false,
          items: [
            {
              text: 'CRXJS',
              link: 'crxjs',
            },
            {
              text: 'vitesse-webext',
              link: 'vitesse-webext',
            },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          base: '/api/',
          collapsed: false,
          items: [
            { text: 'web-extend', link: 'web-extend' },
            { text: '@web-extend/rsbuild-plugin', link: 'rsbuild-plugin' },
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/web-extend/web-extend/blob/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present IceDream',
    },
  },
});
