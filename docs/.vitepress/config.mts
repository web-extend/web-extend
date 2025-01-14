import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'WebExtend',
  description: 'The build tool for web extensions',
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      dir: 'en',
      link: '/en',
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
      dir: 'zh',
      link: '/zh/',
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/en' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/web-extend/web-extend.git' }],
  },
});
