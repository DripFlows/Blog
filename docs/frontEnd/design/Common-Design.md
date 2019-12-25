# JavaScript 设计模式

最近在看`曾探`的《JavaScript 设计模式与开发实践》，从中有所收获。  
故在此记录下常用的设计模式，持续更新中...

## 单例模式

常用于创建单一的对象，创建时判断对象是否已存在，如果已存在，则返回当前对象。

### 常用场景

- 登录弹窗
- Electron 创建窗口
- 更多...

### 惰性单例

惰性单例即在需要的时候才创建对象实例。

```
var getSingle = function(fn) {
    var result;
    return function() {
        return result || result = fn.apply(this, arguments)
    }
}
```

比如：创建单例窗口

```
var createPopup = function() {
    // 创建弹窗逻辑
    ...省略
}

var createSinglePopup = getSingle(createPopup)

document.getElementById('popup').onclick = function() {
    var popup = createSinglePopup()
    popup.style.display = 'block'
}
```

## 策略模式

定义一系列的算法，把它们一个个封装起来，并且使他们可以相互替换、

### 常用场景

- if-else 可读性问题
- 表单验证问题
- 奖金计算问题
- 更多...

### 👉 解决方案

```
var S = function( salary ){     
    return salary * 4;
};
var A = function( salary ){
    return salary * 3;
};
var B = function( salary ){
     return salary * 2;
};

var calculateBonus = function( func, salary ){
     return func( salary );
};

calculateBonus( S, 10000  );    // 输出：40000
```

## 代理模式

代理模式是为一个对象提供一个代用品或占位符，以便控制对它的访问。

### 常用场景

- 虚拟代理(真正需要的时候才取创建)  
   比如: 图片预加载、HTTP 请求
- 缓存代理  
   比如: ajax 请求数据
- 更多...

### 👉 解决方案

```
var myImage = (function(){     
    var imgNode = document.createElement('img');
    document.body.appendChild(imgNode);
    return function(src){         
         imgNode.src = src;     
    }
})();

var proxyImage = (function(){     
    var img = new Image();     
    img.onload = function(){         
        myImage(this.src);     
    }     
    return function(src){         
        myImage('占位图');         
        img.src = src;     
    }
})();

proxyImage('path');

```

## 迭代器模式

迭代器模式是指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。

### 常用场景

- 迭代数组和对象
- 更多...

### 👉 解决方案

```
var each = function( ary, callback ){     
    for ( var i = 0, l = ary.length; i < l; i++ ){     
        callback.call( ary[i], i, ary[ i ] );  // 把下标和元素当作参数传给callback函数
    }
};

each( [ 1, 2, 3 ], function( i, n ){
    alert ( [ i, n ] );
});
```

## 发布-订阅模式

发布—订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。

### 常用场景

- DOM 绑定
- 订阅功能
- 更多...

### 👉 解决方案

```
var event = {
  clientList: [],
  listen: function(key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = []
    }
    this.clientList[key].push(fn) // 订阅的消息添加进缓存列表
  },
  trigger: function() {
    var key = Array.prototype.shift.call(arguments), // (1);
      fns = this.clientList[key]

    if (!fns || fns.length === 0) {
      // 如果没有绑定对应的消息
      return false
    }
    for (var i = 0, fn; (fn = fns[i++]); ) {
      fn.apply(this, arguments) // (2) // arguments 是trigger时带上的参数
    }
  }
}

var installEvent = function(obj) {
  for (var i in event) {
    obj[i] = event[i]
  }
}


// usage
var salesOffices = {}
installEvent(salesOffices)

// 小明订阅消息
salesOffices.listen('squareMeter88', function(price) {
  console.log('价格= ' + price)
})

// 小红订阅消息
salesOffices.listen('squareMeter100', function(price) {
  console.log('价格= ' + price)
})

salesOffices.trigger('squareMeter88', 2000000) // 输出：2000000
salesOffices.trigger('squareMeter100', 3000000) // 输出：3000000

```

## 命令模式

命令模式中的命令（command）指的是一个执行某些特定事情的指令。

### 常用场景

- 解耦发送者和接收者间的耦合关系
- 更多...

### 👉 解决方案

```
var MenuBar = {
  refresh: function() {
    console.log('刷新菜单界面')
  }
}

var RefreshMenuBarCommand = function(receiver) {
  return {
    execute: function() {
      receiver.refresh()
    }
  }
}

var setCommand = function(button, command) {
  button.onclick = function() {
    command.execute()
  }
}

var refreshMenuBarCommand = RefreshMenuBarCommand(MenuBar)
setCommand(button1, refreshMenuBarCommand)

```

## 组合模式
组合模式将对象组合成树形结构，以表示“部分-整体”的层次结构，其次可通过对象的多态性表现，使得用户对单个对象和组合对象的使用具有一致性。

### 常用场景

- 文件系统管理
- 更多...

### 👉 解决方案
```
/********** Folder **********/
var Folder = function(name) {
  this.name = name;
  this.files = []
}

Folder.prototype.add = function(file) {
  this.files.push(file)
}

Folder.prototype.scan = function(){     
  console.log( '开始扫描文件夹: ' + this.name );     
  for ( var i = 0, file, files = this.files; file = files[ i++ ]; ){
    file.scan()
  }
}

/********** File **********/
var File = function(name) {
  this.name = name
}

File.prototype.add = function() {
  throw new Error('文件下面不能再添加文件')
}

File.prototype.scan = function() {
  console.log('开始扫码文件: ',  this.name)
}
```

## 模板方法模式
通过定义一个基方法，并定义一些步骤让子类来实现

### 常用场景
 - 项目框架搭建
 - 更多...

### 👉 解决方案
```
function Base() {}
Base.prototype.do1= function() {}

// ...省略其他方法
Base.prototype.init = function() {

  // 设置执行顺序
  this.do1()
  
  // ...
}

Var S1 = function() {}
S1.prototype = new Base()
S1.prototype.do1 = function() {} // 重写父类方法

// ...省略其他方法

var s1 = new S1()
s1.init()
```

## 享元模式
把所有内部状态相同的对象指定为同一个对象，而外部对象可以从对象上剥离下来，储存在外部

### 常用场景
- 多文件上传
- 对象池
- 更多...

### 👉 解决方案
```
// 设置享元对象
var Upload = function(uploadType) {
  this.uploadType = uploadType
}

Upload.prototype.delFile = function( id ){     
  uploadManager.setExternalState( id, this );  // (1)    
  if ( this.fileSize < 3000 ){         
    return this.dom.parentNode.removeChild( this.dom );    
  }     
  if ( window.confirm( '确定要删除该文件吗? ' + this.fileName ) ){         
    return this.dom.parentNode.removeChild( this.dom );     
  } 
};

var uploadManager = (function() {
  var uploadDatabase = {}

  return {
    add: function(id, uploadType, fileName, fileSize) {
      var flyWeightObj = UploadFactory.create(uploadType)
      var dom = document.createElement('div')
      dom.innerHTML =
        '<span>文件名称:' +
        fileName +
        ', 文件大小: ' +
        fileSize +
        '</span>' +
        '<button class="delFile">删除</button>'
      dom.querySelector('.delFile').onclick = function() {
        flyWeightObj.delFile(id)
      }
      document.body.appendChild(dom)
      uploadDatabase[id] = { fileName: fileName, fileSize: fileSize, dom: dom }
      return flyWeightObj
    },
    setExternalState: function(id, flyWeightObj) {
      var uploadData = uploadDatabase[id]
      for (var i in uploadData) {
        flyWeightObj[i] = uploadData[i]
      }
    }
  }
})()

var id = 0
window.startUpload = function(uploadType, files) {
  for (var i = 0, file; (file = files[i++]); ) {
    var uploadObj = uploadManager.add(
      ++id,
      uploadType,
      file.fileName,
      file.fileSize
    )
  }
}

```

## 职责链模式
职责链模式的定义是：使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系，将这些对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止。

### 常用场景
- 商城抽奖系统
- 更多...

### 👉 解决方案
```
var order500 = function(orderType, pay, stock) {
  if(orderType === 1 && pay === true) {
    console.log('500元定金预购，获得100元优惠券')
  }else {
    return 'nextSuccessor'
  }
}

var order200 = function(orderType, pay, stock) {
  if(orderType === 2 && pay === true) {
    console.log('200元定金预购，获得50元优惠券')
  }else {
    return 'nextSuccessor'
  }
}

var orderNormal = function(orderType, pay, stock) {
  if(stock > 0) {
    console.log('普通购买，无优惠券')
  }else {
    console.log('库存不足')
  }
}

var Chain = function(fn) {
  this.fn = fn
  this.successor = null
}
Chain.prototype.setNextSuccessor = function( successor ){     
  return this.successor = successor; 
}; 
Chain.prototype.passRequest = function(){     
  var ret = this.fn.apply( this, arguments );     
  if ( ret === 'nextSuccessor' ){         
    return this.successor && this.successor.passRequest.apply( this.successor, arguments );     
  }     
  return ret; 
};
```

## 中介者模式
解除对象和对象之间的耦合关系，增加一个中介者对象，所有的相关对象都可以通过中介者对象来通信.

### 常用场景
- 博彩系统
- Vuex 状态树
- 更多...

### 👉 解决方案
```
var goods = {
  // 手机库存
  'red|32G': 3,
  'red|16G': 0,
  'blue|32G': 1,
  'blue|16G': 6
}
var mediator = (function() {
  var colorSelect = document.getElementById('colorSelect'),
    memorySelect = document.getElementById('memorySelect'),
    numberInput = document.getElementById('numberInput'),
    colorInfo = document.getElementById('colorInfo'),
    memoryInfo = document.getElementById('memoryInfo'),
    numberInfo = document.getElementById('numberInfo'),
    nextBtn = document.getElementById('nextBtn')
  return {
    changed: function(obj) {
      var color = colorSelect.value, // 颜色
        memory = memorySelect.value, // 内存
        number = numberInput.value, // 数量
        stock = goods[color + '|' + memory] // 颜色和内存对应的手机库存数量
      if (obj === colorSelect) {
        // 如果改变的是选择颜色下拉框
        colorInfo.innerHTML = color
      } else if (obj === memorySelect) {
        memoryInfo.innerHTML = memory
      } else if (obj === numberInput) {
        numberInfo.innerHTML = number
      }
      if (!color) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '请选择手机颜色'
        return
      }
      if (!memory) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '请选择内存大小'
        return
      }
      if (((number - 0) | 0) !== number - 0) {
        // 输入购买数量是否为正整数
        nextBtn.disabled = true

        nextBtn.innerHTML = '请输入正确的购买数量'
        return
      }
      nextBtn.disabled = false
      nextBtn.innerHTML = '放入购物车'
    }
  }
})()
// 事件函数：
colorSelect.onchange = function() {
  mediator.changed(this)
}
memorySelect.onchange = function() {
  mediator.changed(this)
}
numberInput.oninput = function() {
  mediator.changed(this)
}

```

### Note
> 中介者模式与发布-订阅模式是存在区别的。  
> `中介者模式`: 对象间互相通信，但通过中间对象来通信  
> `发布-订阅模式`: 对象间不通信，中间对象对普通对象发送信息。


## 装饰者模式
不改变对象自身的基础上，在程序运行期间给对象动态的添加职能

### 常用场景
- 修饰器（Decorator）
- 更多...

### 👉 解决方案
```
Function.prototype.before = function(beforefn) {
  var __self = this // 保存原函数的引用
  return function() {
    // 返回包含了原函数和新函数的"代理"函数
    beforefn.apply(this, arguments) // 执行新函数，且保证this不被劫持，新函数接受的参数 // 也会被原封不动地传入原函数，新函数在原函数之前执行
    return __self.apply(this, arguments) // 执行原函数并返回原函数的执行结果， // 并且保证this不被劫持
  }
}

Function.prototype.after = function(afterfn) {
  var __self = this
  return function() {
    var ret = __self.apply(this, arguments)
    afterfn.apply(this, arguments)
    return ret
  }
}
```

## 状态模式
状态模式的关键是区分事物内部的状态，事物内部状态的改变往往会带来事物的行为改变。

### 常用场景
- 文件上传
- Promise中的状态`Fulfilled`, `Rejected`, `Pending`
- 更多...

### 👉 解决方案
```
var Light = function() {
  this.offLightState = new OffLightState(this) // 持有状态对象的引用
  this.weakLightState = new WeakLightState(this)
  this.strongLightState = new StrongLightState(this)
  this.superStrongLightState = new SuperStrongLightState(this)
  this.button = null
}

Light.prototype.init = function() {
  var button = document.createElement('button'),
    self = this
  this.button = document.body.appendChild(button)
  this.button.innerHTML = '开关'
  this.currState = this.offLightState // 设置默认初始状态
  this.button.onclick = function() {
    // 定义用户的请求动作
    self.currState.buttonWasPressed()
  }
}
```

## 适配器模式
适配器模式的作用是解决两个软件实体间的接口不兼容的问题。使用适配器模式之后，原本由于接口不兼容而不能工作的两个软件实体可以一起工作。

### 常用场景
- XML-JSON适配器
- 多地图兼容
- 更多...

### 👉 解决方案
```
var googleMap = {
  show: function() {
    console.log('开始渲染谷歌地图')
  }
}
var baiduMap = {
  display: function() {
    console.log('开始渲染百度地图')
  }
}
var baiduMapAdapter = {
  show: function() {
    return baiduMap.display()
  }
}
renderMap(googleMap) // 输出：开始渲染谷歌地图
renderMap(baiduMapAdapter) // 输出：开始渲染百度地图
```

<Valine />