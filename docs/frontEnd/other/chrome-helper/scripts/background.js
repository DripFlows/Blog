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
  const { action, payload } = JSON.parse(request)
  switch (action) {
    case 'ERROR':
      console.log('错误：', payload)
      sendResponse('')
      break
    case 'INJECT_SCRIPT':
      injectScript()
      sendResponse('')
      break
    case 'CAPTURE_SCREEN':
      // console.log('截屏完成： ', payload)
      const info = {
        action: 'CAPTURE_SCREEN_RESULT',
        payload: payload
      }
      sendPostMsg(info)
      sendResponse('完成截屏')
      break
    default:
      break
  }
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
