import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-Hans',
  description: '浏览器扩展构建工具',
  themeConfig: {
    nav: [
      { text: '指南', link: '/zh/guide/introduction' },
      { text: 'API', link: '/zh/api/web-extend' },
      { text: '示例', link: 'https://github.com/web-extend/examples' },
    ],

    sidebar: {
      '/zh': [
        {
          text: '指南',
          base: '/zh/guide/',
          collapsed: false,
          items: [
            { text: '介绍', link: 'introduction' },
            { text: '快速上手', link: 'quick-start' },
            { text: '项目结构', link: 'project-structure' },
            { text: '入口', link: 'entrypoints' },
            { text: '浏览器兼容性', link: 'browser' },
          ],
        },
        {
          text: 'API 参考',
          base: '/zh/api/',
          collapsed: false,
          items: [
            { text: 'web-extend CLI', link: 'web-extend' },
            { text: '@web-extend/rsbuild-plugin', link: 'rsbuild-plugin' },
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/web-extend/web-extend/blob/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    footer: {
      message: '基于 MIT 许可发布',
      copyright: `版权所有 © 2024-${new Date().getFullYear()} 冰梦`,
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },
});
