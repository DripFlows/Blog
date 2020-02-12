---
title: 谷歌浏览器开发
lang: zh-CN
author: frivolous
update: 2020/01/03
---

# 记一次谷歌浏览器截图插件开发

## 起因
因为公司有个需求，就是需要在网页上进行截图报错，既然领导任务经分配下来，那小弟当然就屁颠屁颠跑去调研了。接了任务之后，心中先预想了几种能够实现的方案。

1. 让用户用自己的截图工具（微信/qq等）截图之后提供一个上传的入口
2. 用js来做截图功能
3. 写一个截图工具

当然，身为一个前端小菜鸟，当然先去想通过前端方案去怎么实现了。第一步头脑风暴（其实是百度）了一下js怎么实现网页截图，经过头脑风暴，果然发现js本身是没有截图的api的，但是自然是难不住伟大的程序员的，看到网上其他的js截图方案，大同小异，基本都是把dom元素写入到canvas上，然后把canvas转为img，俺想，这简单啊，网上找个轮子，来自己做一下就成了，心里美滋滋的找了html2canvas插件，然后经过一番折腾之后，发现了这种方案的弊端

1. 无法截取iframe里的内容，原因是在把dom画入到canvas上的时候，js无法把iframe里的dom节点画入
2. 跨域资源图片也无法截图，原因是出于浏览器安全策略，不允许这未经许可拉取远程网站信息而导致的用户隐私泄露
3. 截图不清晰（这个点影响不算大，可以接收）

发现这个三个问题之后，回头看项目，得，这方案没法用了，项目中各种iframe嵌套（小声逼逼）。在找了下，没有找到其他更好的轮子了。于是乎，开始找产品扯皮。一顿巴拉巴拉之后（给产品洗脑安利方案一emmmmm）没成功，产品说方案一用户操作成本太高，体验不好。于是不得已抬出方案三（没做过这种插件，心里没底），然后经过一顿瞎逼分析之后，得出以下几个优劣势：

1. 需要额外的安装插件，用户的学习成本和技术支持的额外支出（比较明显的一个缺点）
2. 可拓展性强，以后还可以在此基础上拓展其它功能（可持续发展道路）
3. 可维护性，可以作为一个独立的项目
4. 逼格高（emmmm）

## 基础
1. 创建manifest.json,这是插件的元数据，插件的配置信息，任何插件都必须要有这个文件，任何插件都必须要有这个文件
```json
{
  "manifest_version": 2,
  "name": "插件名",
  "version": "1.0", // 用来判断是否需要更新
  "description": "插件描述",
  "browser_action": {
      "default_icon": "static/favicon.ico", // 插件图标
      "default_title": "插件图标上显示的内容",
      "default_popup": "pages/popup.html"
  },
  "background": { // 后台运行的js，相当于后台进程
      "scripts": ["scripts/background.js"],
      "persistent": false
  },
  "permissions": [ // 授权信息 - 那些网站或者其他tab的授权
    "tabs",
    "unlimitedStorage",
    "notifications",
    "history",
    "activeTab",
    "storage",
    "webRequestBlocking",
    "*://*/*",
    "http://*/*",
    "https://*/*"
  ],
  "web_accessible_resources": [ // 注入到网页的内容
      "scripts/inject.js"
  ],
  "content_scripts": [{ // 内容js
      "matches": ["http://*/*","https://*/*", "*://*/*"], // 匹配那些网站
      "js": ["scripts/jquery.min.js", "scripts/inject.js"],
      "run_at": "document_start"
  }]
}
```
## 项目结构
~~~bash
    ├── scripts                         脚本内容
    │   ├── background.js
    │   ├── index.js
    │   ├── inject.js
    │   ├── jquery.min.js
    │   ├── popup.js
    ├── pages                           页面内容（弹出页，背景页）
    ├── static                          静态资源文件
    ├── styles                          样式
    ├── manifest.json                   chrome插件配置
    ├── README.md                       项目描述文件
~~~

## 代码示例
1. popup.html 点击图标显示的内容, 在browser_action.default_popup 设置
```html
<body>
  <ul>
    <li class="CaptureScreen">网页截图</li>
  </ul>
</body>
<script src="../scripts/index.js"></script>
```
3. scripts/index.js 入口页
```js
const $CaptureScreenBtn = $('.CaptureScreen') // 截屏按钮
const popup = {
  // 初始化
  _init () {
    this._initialEvent()
    this._initScript()
  },
  // 事件初始化
  _initialEvent () {
    $CaptureScreenBtn.click(this.handleCaptureScreen)
  },
  // 脚本初始化
  _initScript () {
    this._sendMsg({ action: 'INJECT_SCRIPT' })
  },
  // 发送消息,和html通讯
  _sendMsg (message, callback) {
    // 对runtime发送消息
    chrome.runtime.sendMessage(JSON.stringify(message), function(response) {
      if (callback) callback(response)
    })
  },
  // 接收消息
  _getMsg () {
    // 监听runtime中的信息
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      switch (request.action) {
        default:
          break
      }
    })
  },
  // 开始截屏
  handleCaptureScreen () {
    // 获取当前窗口 -> 回调函数包括当前窗口的详细信息，如窗口id等
    chrome.windows.getCurrent(function (win) {
      // 抓取当前tab的内容
      chrome.tabs.captureVisibleTab(win.id, {}, function (dataUrl) {
        const info = {
          action: 'CAPTURE_SCREEN',
          payload: dataUrl
        }
        popup._sendMsg(info)
      })
    })
  }
}
```
4. scripts/background.js 
* 后台进程，用于监听消息和转发消息
* 可以操作html
```js
// 消息群集
chrome.runtime.onMessage.addListener(onRuntimeMessage)

function sendPostMsg (info) {
  window.postMessage(JSON.stringify(info), '*')
}

// 监听runtime消息
/**
 * @param {*} request
 * @param {*} sender
 * @param {*} sendResponse
 */
function onRuntimeMessage (request, _, sendResponse) {
  // Tips: 需要sendResponse,不然可能会阻塞其他消息
  const { action, payload } = JSON.parse(request)
  sendResponse()
}

// 向网页注入js代码
function injectScript () {
  const link = 'scripts/inject.js'
  const temp = document.createElement('script')
  temp.setAttribute('type', 'text/javascript')
  // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
  temp.src = chrome.extension.getURL(link)
  temp.onload = function() {
    // 放在页面不好看，执行完后移除掉
    this.parentNode.removeChild(this)
  }
  document.head.appendChild(temp)
}
```
5. scripts/inject.js 此代码会注入到网页，所以在这边做为插件和网页的桥梁，通过postmessage来交互
```js
// 监听消息
window.addEventListener('message', receivedMessage, false)

// 发送postmessage消息
function sendPostMsg (info) {
  window.postMessage(JSON.stringify(info), '*')
}
```

## 调试
不管是撸代码的时候还是写完逻辑的时候，我们都期望能根据实际的表现来做出对应的操作，所以就涉及到调试了。Chrome直接支持javascript的调试，拥有了Chrome，就相当于拥有了一个强大的javascript调试器了。

### 调试Content Script
打开开发者工具,点击sources，找到对应的文件-> scripts/index.js，点击打开，就可以和平时调试js一样调试了

### 调试Background
由于background和content script并不在同一个运行环境中，因此上面的方法是看不到Background的javascript的。要调试Background，还需要打开插件页，也就是“chrome://extensions”。点对应的插件的“generated background page.html”，就出现了调试窗口，接下来的操作就跟前面的类似了。

### 调试Popup
虽然Popup和Background是处于同一运行环境中，但在刚才的Background的调试窗口中是看不到Popup的代码的。所以需要审核弹出内容，然后就跟之前的调试操作差不多了


### 调试inject
inject的话就会把代码注入到网页中，和conten相似的方式即可

## 总结
因为之前没有相关的开发经验，所以开始的时候会有点慌张，怕会延期耽误进度，后来开发完成之后，其实发现只要放平心态，认真仔细的阅读开发文档，做下来还是不难的。通过这次的实践，我差不多已经知道怎么去开发一款chrome插件了，当然，chrom插件的功能是非常强大的，这次用到的仅是冰山一角，要深入，还需要更加充分阅读文档和实践了。
最后，虽然只是开发一个简单的截图工具，还是花费了老大的功夫，果然一入技术深似海，从此头发是路人~~~