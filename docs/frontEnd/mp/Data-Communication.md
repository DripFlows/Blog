# 小程序页面数据通信

小程序其实是由一个个页面构建而成，它与 Vue，React，Angular 等不完全相同，这种是由组件构成.组件间的通信可以通过 event，props 等解决，而页面中的通信就稍微复杂了些许。
故本文提供几种小程序页面通信方式

## localStorage

localStorage 是最容易想到一种方案，简单，持久化。

```
// pageA
wx.setStorageSync('key', 'value')

// pageB
wx.getStorageSync('key')
```

## GlobalData

小程序全局对象数据，相当于传统页面中的 window

```
// pageA
const app = getApp();
app.globalData.key = 'value'

// get
const app = getApp()
var result = app.globalData.key
```

## events

小程序 navigateTo 函数的参数存在 events 这个参数，可以通过这个参数与跳转后的下一个页面进行数据通信。

> 基础库 2.7.3 开始支持。

```
wx.navigateTo({
  url: 'test?id=1',
  events: {

    // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
    acceptDataFromOpenedPage: function(data) {
      console.log(data)
    },
    someEvent: function(data) {
      console.log(data)
    }
    ...
  },
  success: function(res) {

    // 通过eventChannel向被打开页面传送数据
    res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
  }
})

// test.js
Page({
  onLoad: function(option){
    console.log(option.query)
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('acceptDataFromOpenedPage', {data: 'test'});
    eventChannel.emit('someEvent', {data: 'test'});

    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      console.log(data)
    })
  }
})
```

## More
除此之外，还有一些pubSub(eventBus),westore(小程序官方状态库) 等等。

<Valine />
