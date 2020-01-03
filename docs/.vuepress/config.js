module.exports = {
  title: "DripFlows",
  description: "待补充",
  head: [
    [
      "link",
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        href: `/favicon.ico`
      }
    ]
  ],
  configureWebpack: {
    resolve: {
      alias: {
        "@": "/"
      }
    }
  },
  locales: {
    "/": {
      lang: "zh-CN"
    }
  },
  themeConfig: {
    sideBar: "auto",
    sidebarDepth: 3,
    lastUpdated: "上次更新",
    nav: [
      {
        text: "首页",
        link: "/"
      },
      {
        text: "🌟博客",
        items: [
          { text: "前端", link: "/frontEnd/" },
          { text: "后端", link: "/backEnd/" },
          { text: "工具", link: "/tools/" }
        ]
      },
      {
        text: "💻项目",
        link: "/project/",
        items: []
      },
      { text: "💡Todo", link: "/todo/" },
      { text: "Github", link: "https://github.com/DripFlows" }
    ],
    sidebar: {
      "/frontEnd/": getBlogSidebar("前端"),
      "/backEnd/": getBlogSidebar("后端"),
      "/tools/": getBlogSidebar("工具"),
      "/learn/": getBlogSidebar("学习"),
      "/project/": getBlogSidebar("项目")
    }
  },
  plugins: {
    "@vuepress/medium-zoom": true,
    "@vuepress/back-to-top": true
  }
};

function getBlogSidebar(type) {
  switch (type) {
    case "前端":
      return [
        ["", "欢迎"],
        {
          title: "HTML"
        },
        {
          title: "CSS",
          children: []
        },
        {
          title: "JavaScript",
          children: []
        },
        {
          title: "TypeScript",
          children: [
            ["./typescript/generic", "TS泛型积累"]
          ]
        },
        {
          title: "Node",
          children: []
        },
        {
          title: "React"
        },
        {
          title: "Vue"
        },
        {
          title: "小程序",
          children: []
        },
        {
          title: "杂类",
          children: [
            ["./other/use-blog", "DripFlows博客使用规范"],
            ["./other/start-vuepress-plugin", "vuepress-plugin开发总结"]
          ]
        },
        {
          title: "网络协议"
        },
        {
          title: "Git"
        },
        {
          title: "函数式编程"
        },
        {
          title: "算法"
        },
        {
          title: "设计模式",
          children: []
        },
        {
          title: "源码阅读",
          children: []
        }
      ];

    case "后端":
      return [
        {
          title: "服务器",
          children: []
          // collapsable: false,
        }
      ];

    case "工具":
      return [];

    case "学习":
      return [["", "学无止境"]];
  }
}
