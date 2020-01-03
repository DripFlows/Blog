// 谷歌浏览插件开发
// https://www.cnblogs.com/xbdeng/p/6081612.html
// http://chrome.cenchy.com/
// https://developer.chrome.com/extensions

$(function () {

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
      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.action) {
          default:
            break
        }
      })
    },
    // 开始截屏
    handleCaptureScreen () {
      // 获取当前窗口
      chrome.windows.getCurrent(function (win) {
        try {
          // 抓取当前tab的内容
          chrome.tabs.captureVisibleTab(win.id, {}, function (dataUrl) {
            const info = {
              action: 'CAPTURE_SCREEN',
              payload: dataUrl
            }
            popup._sendMsg(info)
          })
        } catch (e) {
          const info = {
            action: 'ERROR',
            payload: e.message
          }
          popup._sendMsg(info)
        }
      })
    }
  }

  popup._init()

})
