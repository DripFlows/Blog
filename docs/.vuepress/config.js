module.exports = {
  title: 'DripFlows',
  description: '待补充',
  head: [
    [
      'link',
      {
        rel: 'shortcut icon',
        type: 'image/x-icon',
        href: `/favicon.ico`,
      },
    ],
  ],
  configureWebpack: {
    resolve: {
      alias: {
        '@': '/',
      },
    },
  },
  locales: {
    '/': {
      lang: 'zh-CN',
    },
  },
  themeConfig: {
    sideBar: 'auto',
    sidebarDepth: 3,
    lastUpdated: '上次更新',
    nav: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '🌟博客',
        items: [
          { text: '前端', link: '/frontEnd/' },
          { text: '后端', link: '/backEnd/' },
          { text: '工具', link: '/tools/' },
        ],
      },
      {
        text: '💻项目',
        link: '/project/',
        items: [
          {
            text: 'Chrome-helper',
            link: 'https://github.com/DripFlows/chrome-helper',
          },
        ],
      },
      {
        text: '📚推荐',
        link: '/suggestions/',
      },
      { text: '💡Todo', link: '/todo/' },
      { text: 'Github', link: 'https://github.com/DripFlows' },
    ],
    sidebar: {
      '/frontEnd/': getBlogSidebar('前端'),
      '/backEnd/': getBlogSidebar('后端'),
      '/tools/': getBlogSidebar('工具'),
      '/learn/': getBlogSidebar('学习'),
      '/project/': getBlogSidebar('项目'),
      '/suggestions/': getBlogSidebar('推荐'),
    },
  },
  plugins: {
    '@vuepress/medium-zoom': true,
    '@vuepress/back-to-top': true,
  },
};

function getBlogSidebar(type) {
  switch (type) {
    case '前端':
      return [
        ['', '欢迎'],
        // {
        //   title: "HTML"
        // },
        // {
        //   title: "CSS",
        //   children: []
        // },
        {
          title: 'JavaScript',
          children: [
            ['./javascript/svelte-counter', 'svelte尝鲜之计数器'],
            ['./javascript/js-decorate', '初识ES装饰器Decorate'],
          ],
        },
        {
          title: 'TypeScript',
          children: [['./typescript/generic', 'TS泛型积累']],
        },
        {
          title: 'Node',
          children: [['./node/node-primer', '一个前端渣渣的node开发体验']],
        },
        {
          title: "React",
          children: [
            ["./react/hook-in-project", "React Hook在项目"],
            ["./react/webpack-build-react", "用webpack搭建前端项目的一点点心得"],
          ]
        },
        {
          title: 'Vue',
          children: [
            [
              './vue/from-defineProperty-to-proxy',
              '从Object.defineProperty到Proxy',
            ],
          ],
        },
        // {
        //   title: "小程序",
        //   children: []
        // },
        {
          title: '杂类',
          children: [
            ['./other/use-blog', 'DripFlows博客使用规范'],
            ['./other/start-vuepress-plugin', 'vuepress-plugin开发总结'],
            ['./other/chrome-helper', '记一次谷歌浏览器截图插件开发'],
            ['./other/electron-record', '写一个electron的录屏工具'],
            ['./other/vscode-tree-view', 'vscode插件开发之侧边栏'],
            ['./other/blog-record', '博客记录']
          ],
        },
        // {
        //   title: "网络协议"
        // },
        // {
        //   title: "Git"
        // },
        // {
        //   title: "函数式编程"
        // },
        {
          title: "算法",
          children: [["./algorithm/one-algorithm", "渣渣的算法题之路"]]
        },
        // {
        //   title: "设计模式",
        //   children: []
        // },
        // {
        //   title: "源码阅读",
        //   children: []
        // }
      ];

    // case "后端":
    //   return [
    //     {
    //       title: "服务器",
    //       children: []
    //       // collapsable: false,
    //     }
    //   ];

    // case "工具":
    //   return [];

    // case "学习":
    //   return [["", "学无止境"]];

    case '推荐':
      return [
        ['books', '图书'],
        ['urls', '网络资源'],
        ['npms', 'NPM库'],
        ['tricks', '奇技淫巧'],
      ];
  }
}
