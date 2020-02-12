# 用js实现网页录屏模块
随着前端技术的不断发展，前端能做的事情似乎越来越多了。今天分享一个用js来实现的录屏方案。

## 使用到的API详解
### mediaDevices
1. mediaDevices提供访问连接媒体输入的设备，如照相机和麦克风，以及屏幕共享等
2. 属性
* ondevicechange 用户选择输入设备的时候触发，比如说用户有多个摄像头或者有多个麦克风这种
3. 方法：
* enumerateDevices 获取系统中可用的媒体输入和输出设备等信息
* getSupportedConstraints 不是很理解这个api，大概是获取一个音视频轨道的可支持信息。Tips原文：基于MediaTrack 支持约束字典的新对象，列出用户代理支持的约束。由于列表中仅包含用户代理支持的约束，因此这些布尔属性中的每一个都有值 
* getUserMedia(constraints) 打开系统上的相机或屏幕共享和/或麦克风，并提供 MediaStream 包含视频轨道和/或音频轨道的输入，获取的时候，浏览器会在左上角弹出授权按钮，需要授权之后，才能获取具体的值
  constraints参数说明
  ~~~js
  // 简单，是否设置音/视频
  { audio: true, video: true }
  // 制定视频(最大/小)分辨率, 或设置一个参考值
  {
    audio: true,
    // audio: { deviceId：  }
    video: {
      width: 1280,
      height: 720
      // min: 1024, ideal: 1280, max: 1920
      // 设置前置或后置摄像头 user/environment 前/后
      // deviceId 设备id, 可以通过enumerateDevices获取
    }
  }
  ~~~
* getDisplayMedia(constraints) 选择捕获的显示器或窗口,constraints与getUserMedia相同

### MediaRecorder
1. 构造函数会创建一个对指定的 MediaStream 进行录制的 MediaRecorder 对象
2. 参数：
* stream：MediaStream 将要录制的流，可以来自MediaDevices.getUserMedia，audio，video或canvas
* options(可选): 一个字典对象,它可以包含下列属性
  1. mimeType 为新构建的 MediaRecorder 指定录制容器的MIME类型. 在应用中通过调用 MediaRecorder.isTypeSupported() 来检查浏览器是否支持此种mimeType
  2. audioBitsPerSecond: 指定音频的码率
  3. videoBitsPerSecond: 指定视频的码率
  4. bitsPerSecond: 指定音频和视频的码率. 可以作为audioBitsPerSecond/videoBitsPerSecond的备选项
3. 属性
* audioBitsPerSecond 只读属性. 它返回录制器实际所使用的音频编码码率（不一定与参数中设置的值一致）
* mimeType 只读属性 返回创建MediaRecorder对象时指定的 MIME 媒体类型或者浏览器选择的MIME媒体类型
* ondataavailable/ondata 获取到可用的流信息时触发，返回一个回调函数，可以在回调中收集媒体设备获得到的可以使用的数据
* onerror 出错的时候触发
* onpause 暂停录制的时候触发
* onresume 恢复录制的时候触发
* onstart 开始的时候触发
* onstop 与暂停不同，该事件只会在结束录制的时候触发
* state 只读属性 返回当前对象的当前状态
  1. inactive 录制未发生 - 它尚未启动，或者已经停止
  2. recording 录制已启动，UA 正在捕获数据
  3. paused 录制已启动，然后暂停，但尚未停止或恢复
* stream 只读属性返 回创建时传递到构造函数的流
4. 方法
* isTypeSupported 返回一个布尔值，用于校验设置的mimeType是否支持
* pause 暂停录制 Tips: 如果当前state等于inactive的时候，会抛出异常
* requestData 用于触发ondataavailable
* resume 恢复录制
* start 开始录制
* stop 结束录制