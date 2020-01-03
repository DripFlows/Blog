console.log('CODE INJECT SUCCESS!')

// 监听消息
window.addEventListener('message', receivedMessage, false)

// 发送postmessage消息
// function sendPostMsg (info) {
//   window.postMessage(JSON.stringify(info), '*')
// }

// 监听postmessage消息
function receivedMessage (e) {
  try {
    const data = e.data
    // const { action, payload } = JSON.parse(data)
   console.log('接收到消息: ', data)
  } catch (e) {
    console.log('无法接收消息：', e.message)
  }
}

// 与html页面通讯, 为了避免污染页面消息，所以借助辅助标签 <div id="zm_help_chrome_plug"> 来实现通讯

// sendPostMsg({
//   action: 'TEST_POST'
// })