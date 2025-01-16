import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-Hans',
  description: 'The build tool for web extensions',
  themeConfig: {
    nav: [
      { text: '指南', link: '/zh/guide/introduction' },
      { text: '示例', link: 'https://github.com/web-extend/web-extend/tree/main/examples' },
    ],

    sidebar: {
      'zh/guide': {
        base: 'zh/guide/',
        items: [
          {
            text: '开始',
            items: [
              { text: '介绍', link: 'introduction' },
              { text: '快速上手', link: 'quick-start' },
            ],
          },
        ],
      },
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },
  },
});
