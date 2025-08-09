import markdownItFootnote from 'markdown-it-footnote';
import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
import en from './en';
import zh from './zh';

const shared = defineConfig({
  title: 'Bext',
  base: '/web-extend/',
  head: [['link', { rel: 'icon', href: '/web-extend/favicon.ico' }]],
  lastUpdated: true,
  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/web-extend/web-extend',
      },
    ],
    search: {
      provider: 'local',
    },
  },
});

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...shared,
  locales: {
    root: { label: 'English', ...en },
    zh: { label: '简体中文', ...zh },
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
      md.use(markdownItFootnote);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
});
