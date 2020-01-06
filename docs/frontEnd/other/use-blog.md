---
title: DripFlows 博客使用规范
lang: zh-CN
author: sillyY
update: 2019/12/26
---
# DripFlows 博客使用规范

博客基于[vuepress](https://v1.vuepress.vuejs.org/zh/guide/) 搭建, 内置 vuepress 自身功能，并在此基础上新增功能，特在此说明。

## 组件

### Element 组件

目前按需引入了`Rate`,`Badge`、`Button`、`Tag`、`Checkbox`5 个组件。  
若有需求，可自行引入，引入方式如下:

```
// docs/.vuepress/enhanceApp.js

import { Rate, Badge, Button, Tag, Checkbox } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData // 站点元数据
}) => {
  Vue.use(Rate)
  Vue.use(Badge)
  Vue.use(Button)
  Vue.use(Tag)
  Vue.use(Checkbox)

  // 新增
  // 省略...
}

```

### 评论组件

评论使用[Valine](https://valine.js.org/)系统，使用方式如下:

```
<Valine />
```

### details 组件

拓展 H5 中`<details>`标签，使用方式如下:

```
<detail tab="frontEnd" :menu="['a', 'b', 'c']"/>
```

::: tip
目前只用于博客首页使用，如有需求，另行调整。
:::

## 命令

- npm run start/dev 开发模式
- npm run build 编译文档
- npm run deploy 发布

::: warning
`npm run deploy`内含 git 提交及博客发布，请放心使用
:::

<Valine />
