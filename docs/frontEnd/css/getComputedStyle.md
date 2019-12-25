# getComputedStyle 获取 style

获取 Dom 对象 style,常常会使用原生 JS 中的 dom.style[<属性>]来获取, 但这种方案有时候会是存在缺陷的.
所以我们往往需要去寻找替代方案.

### 问题

```
// html
    <div class="hidden">
        <div class="hidden_inner">
            隐藏部分
        </div>
    </div>

// css
.hidden {
    display: none;
}
.hidden > .hidden_inner {
    width: 200px;
    height: 200px;
}

// javascript
var w1 = document.getElementsByClassName('.hidden').style.width // => VM549:1 Uncaught TypeError: Cannot read property 'width' of undefined
var w2 = document.querySelector('.hidden').style.width // => ""
```

> 顾名思义这两种方式无法获取 `display:none` 或者 `visibility: hidden;` 的 div 的 css 属性.

### 解决方案
- 1. jQuery css方法
```
var w3 = $('.hidden').css('width') // => "1664px"
```
但如果只是为了这个去引入jQuery, 会有点浪费资源且影响性能.

- 2. getComputedStyle
好了,总算到了这次的重点.这个真的是一个神器,也是作者最近才发现的.

> 其实jQuery的css也是使用的getComputedStyle,只不过是`defaultView.getComputedStyle`.关于这点,未找到具体原因,可能只是为了一些别的考虑,毕竟无伤大雅.

## 语法
```
let style = window.getComputedStyle(element, [pseudoElt]);
```

- element  
 用于获取计算样式的Element。
- pseudoElt <el-tag type="info">可选</el-tag>  
指定一个要匹配的伪元素的字符串。必须对普通元素省略（或null）。

所以上述问题的解决方案如下:
```
var element = document.querySelector('.hidden)
var w4 = window.getComputedStyle(element).width // => "1664px"
```

## getComputedStyle 与 style的区别
- 1. 只读与可读可写  
    我们都知道style是可读可写的,而getComputedStyle是只读的,意味着我们要修改style还得借助其他手段,这个稍后再讲.
    ```
    var h1 = element.style.height  // 可读
    element.style.height = 100 + 'px'; // 可写
    ```
    
    ```
    var h2 = window.getComputedStyle(element).height // 只读
    ```
 
 - 2. 获取伪类或伪元素  
    这点才是getComputedStyle所拥有的独特之处.  
    通过设置getComputedStyle的第二个参数,可以获取获取伪类或伪元素
    ```
    var style = window.getComputedStyle(element, ':first-child')
    var style2 = window.getComputedStyle(element, '::before')
    ```

## 如何修改伪类和伪元素
- 1. class切换大法来实现伪元素样式的更改
- 2. 通过CSS styleSheet的 insertRule 方法添加
```
document.styleSheets[0].insertRule('.test::before{color:green}',0)
```
该方法其实就是类似于通过修改存放的style标签,来修改样式
- 3. 通过data-*属性值来更改伪元素的content值
```
// html 
<div class="test" data-text="TEXT" data-color="red"></div>

// css 
.test::before{
    content: attr(data-text);
}
```
通过attr设置data-*的属性值,可以修改content的值.但目前attr只支持content属性,之后可能会支持


## 参考文献
- [获取元素CSS值之getComputedStyle方法熟悉](https://www.zhangxinxu.com/wordpress/2012/05/getcomputedstyle-js-getpropertyvalue-currentstyle/) <el-tag type="success" size="mini">张鑫旭</el-tag>
- [利用javascript获取并修改伪元素的值](https://segmentfault.com/a/1190000003711146#articleHeader6) <el-tag type="success" size="mini">chitanda</el-tag>
- [getComputedStyle](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getComputedStyle) <el-tag type="success" size="mini">MDN</el-tag>
- [insertRule](https://developer.mozilla.org/zh-CN/docs/Web/API/CSSStyleSheet/insertRule) <el-tag type="success" size="mini">MDN</el-tag>

<Valine />