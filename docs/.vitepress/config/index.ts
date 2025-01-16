import { defineConfig } from 'vitepress';
import en from './en';
import zh from './zh';

const shared = defineConfig({
  title: 'WebExtend',
  themeConfig: {
    logo: { src: '/logo.png', width: 24, height: 24 },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/web-extend/web-extend',
      },
    ],
  },
});

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...shared,

  locales: {
    root: { label: 'English', ...en },
    zh: { label: '简体中文', ...zh },
  },
});
