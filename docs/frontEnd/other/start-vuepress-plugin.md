---
title: vuepress 插件开发总结
lang: zh-CN
author: sillyY
update: 2019/12/26
---
# vuepress 插件开发总结

由于某个组件库([ele-vue](http://sillyy.cn/ele-vue/))的文档缘故，故打算去开发 vuepress 的插件([vuepress-plugin-code-segment](http://sillyy.cn/vuepress-plugin-code-segment/))来帮助生产 demo 和 code。其间历时 1 个多月，总算幸不辱命。故在此记录其中艰辛。

### 收集资料阶段

开始在网上搜寻相关资料，找到 2 个库([vuepress-plugin-demo-block](https://github.com/xiguaxigua/vuepress-plugin-demo-block) 和 [vuperess-plugin-demo-code](https://github.com/BuptStEve/vuepress-plugin-demo-code)).  
本来打算直接使用的，开始尝试 demo-code 这个库，后来发现该库是加载一个组件到页面中去，故当同一个页面存在多个展示 demo，2 个组件中 data 是同一个 data，故会让开发很不舒服.  
其次尝试了 demo-block，该库检测：每有一个展示 demo，就去生成一个 demo，虽然解决了 demo-code 的问题，但其本身缺少 demo-code 的属性自定义的特点，而且作者好像不再维护.

### 开发问题

#### 1.vuepress 版本区别

v0.x 和 v1.x 之间是存在很大区别，v1.x 将模块解耦，改变成插件的模式去集成，顾名思义，就是 v0.x 版本不存在插件系统

> tip: 关于这点，我真的调研了很久，之前一直没注意 vuepress 存在 2 个版本。老实说，vuepress 相关文档真的是少，全是抄着官方文档去搭建 vuepress 博客，真的是毫无意义。

#### 2.插件 Option API

> tip: 这里是插件的 Option API，不是 vuepress 的配置 API

- extendMarkdown(Option API)  
  这个是用于修改 markdown 文件，我这次主要使用该 API，后面会着重讲。

- clientRootMixin(Option API)  
  类似于混入，该文件可以控制根组件生命周期。

- define(Option API)  
  如果想在 clientRootMixin 使用配置文件,可以在这里将 option 定义成全局配置

```
{
    define: {
      SETTINGS:  options
    }
}
```

#### 3.extendMarkdown API 和 [markdown-it](https://github.com/markdown-it/markdown-it)、[markdown-it-container](https://github.com/markdown-it/markdown-it-container)依赖

- extendMarkdown

```
module.exports = {
  extendMarkdown: md => {
    md.set({ breaks: true }) // 转换段落里的 '\n' 到 <br>。
    md.use(require('markdown-it-xxx')) // 使用某个依赖
  }
}
```

- markdown-it  
  markdown 文件的解析库，目前大部分的 markdown 库都是基于它开发的。有没有别的，抱歉，我也不知道。

- markdown-it-container  
  创建自定义结构的块容器

```
::: warning
*here be dragons*
:::
```

👇

```
<div class="warning">
<em>here be dragons</em>
</div>
```

可以识别含有指定标志(上面是 warning)的代码块,对代码块中的文档进行处理，从而生成指定的代码块。

> tip: 这里也花了好久，主要是在研究 markdown-it 和 markdown-it-container 这 2 个依赖上.

#### 4.debugger 问题

- 首先插件的开发文件是 node 环境，请记住你常常会存在修改了代码，但无效的情况.  
  因为 vuepress 的加载方式是,先加载 node 部分,再加载 web 部分.而插件的开发文件在第一次启动生成一遍,但修改该文件并不会触发热更新,因为 vuepress 只监听它的 markdown 文件.所以即使你修改了代码,但你使用加载的都是缓存里的第一次启动的代码.

解决方案:

1.设置 extraWatchFiles,这里监听插件开发文件

```
module.exports = {
  extraWatchFiles: [
    '.vuepress/foo.js', // 使用相对路径
    '/path/to/bar.js'   // 使用绝对路径
  ]
}
```

2. 设置 vuepress-cli 命令

```
{
  "scripts": {
    "start": "vuepress dev docs --no-clear-screen --no-cache --temp .temp",
  },
}
```

--no-clear-screen 不清除屏幕  
--no-cache 不缓存  
--temp .temp 指定客户端文件的临时目录。

3. 在测试 Markdown 文件中加入以下文本:

```
第001次测试(修改数字,强制触发vuepress更新)
```

- 好的一点是 clientRootMixin 里混入的文件又是在网页环境中,故这里面的代码修改会实时更新.

> tip: vuepress 的热更新真的让我蛮绝望,特别是对插件开发极其不友好,debugger 太痛苦.

#### 5.插件开发不支持本地图片(不排除可以解决的可能性,这方面资料实在太少,暂时没有解决办法.)

因为 vuepress 里的静态资源都在.vuepress/public 里,本地图片放到这里面,不就等同于用户需要放置一张一样的图片到 public 里.而外部的图片地址又无法加载进去.

> tip: 可以使用图片cdn的方式来解决吧.

<Valine />