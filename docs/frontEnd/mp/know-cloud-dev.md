# 云开发
云开发是基于小程序的一种新式后台开发，可使前端人员快速实现小程序开发。  
最近在使用云开发，略有收获，故在此记录一下。

## 调试
云开发主要基于wx-server-sdk这个npm模块,开发时分为2种，一种提交代码至云端，第二种本地调试。  
> 本地调试需要安装响应的npm依赖，依赖安装位置基于每一个云函数文件夹内，即存在package.json文件的文件夹内，可以把每一个云函数看做独立的项目。


## 初始化
云开发使用相应API,必须先初始化，即调用init函数
```
wx.cloud.init({
  env: 'development-x1dzi' // 初始化需注意这里的env需与云开发的环境ID保持一致
})
```
> 环境ID可以原生开发工具-云开发-窗口的右上角-当前环境:`development`(个人设置名)，点击后可以看到环境ID

## Usage
```
/**
 * Server
 **/
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: "development"
})

exports.main = (event, context) => {
   return {
    sum: event.a + event.b
  }
}

/**
 * Web
 **/
 wx.cloud.callFunction({
  // 云函数名称
  name: 'add',
  // 传给云函数的参数
  data: {
    a: 1,
    b: 2,
  },
  success: function(res) {
    console.log(res.result.sum) // 3
  },
  fail: console.error
})
```

<Valine />