# 手写 call-apply-bind

## 引言

call、apply 及 bind 这三个方法，对于新手而言，基本不知道怎么去用，或许就知道改变 this 指向这个知识。但往往在面试中，call,apply 及 bind 的作用会常常被问及。所以我们现在全面分析下这三者。

## bind

### 描述

首先我们引入下 MDN 关于[Function.prototype.bind()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)的描述

> bind() 函数会创建一个新绑定函数（bound function，BF）。绑定函数是一个 exotic function object（怪异函数对象，ECMAScript 2015 中的术语），它包装了原函数对象。调用绑定函数通常会导致执行包装函数。

通俗来说，返回一个改变了 this 指向的函数

### 手写 bind

其实这里存在一个问题，如果原函数是一个构造函数，那么我们也得保证 bind 之后的函数也是构造函数

```
Function.prototype.myBind = function(context) {
    // 保存原this指向，myBind后续参数
    const that = this,
        args = Array.prototype.slice.call(arguments, 1)

    // 首先检验this是不是个函数, this指代原函数
    if(typeof this !== 'function') {
        throw new TypeError(`${this} is not a function`)
    }

    // 返回函数
    return function F() {
        // 判断是否是F的实例，从而判断原函数是否构造函数，后续会带例子分析
        // new 下 原构造函数，并把结果返回
        if(this instanceof F) return new that(...args, ...arguments)
        // 普通函数，即正常运行
        return that.apply(context, args.concat(...arguments))
    }
}
```

### 分析 bind

下面用例子来分析一下，构造函数下 bind 的运行过程，省略普通函数。

```
function Person(name) {
    this.name = name;
}
var person = new Person('小明') // 正常实例化构造函数

// step 1
var P = Person.myBind(this)
// step 2
var p = new P('小李')
```

- 1.执行 step1
  这里先把 myBind 看做普通函数，执行下 Person.myBind，返回下面的结果，即构造函数 F

```
function F() {
        // 判断是否是F的实例，从而判断原函数是否构造函数
        // new 下 原构造函数，并把结果返回
        if(this instanceof F) return new that(...args, ...arguments)
        // 普通函数，即正常运行
        return that.apply(context, args.concat(...arguments))
    }
```

- 2. 执行 step2  
     这里就相当于执行构造函数 F, 也就是实例化一个构造函数。  
     所以在函数内部可以通过`this instanceof F`来判断是否是构造函数, 这里的 this 指代实例化出来的对象 `F {}`  
     也就可以 new 原构造函数， 这里 that 指代 Person 函数

## call

### 描述

> [Function.prototype.call()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)

call() 允许为不同的对象分配和调用属于一个对象的函数/方法。

call() 提供新的 this 值给当前调用的函数/方法。你可以使用 call 来实现继承：写一个方法，然后让另外一个新的对象来继承它（而不是在新对象中再写一次这个方法）。

### 手写 call

```
 Function.prototype.myCall = function(context) {
    let result;
    const args = [...arguments].slice(1)

     // 首先检验this是不是个函数, this指代原函数
    if(typeof this !== 'function') {
        throw new TypeError(`${this} is not a function`)
    }

    // context 初始化，以及将原函数赋值到其fn属性上
    // ps： context指代上下文对象
    context = context || window
    context.fn = this;

    // 执行content的fn
    result = context.fn(args)

    // 删除context上本不存在的fn
    delete context.fn

    // 返回结果
    return result
 }
```

## apply

### 描述

> [Function.prototype.apply](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)

在调用一个存在的函数时，你可以为其指定一个 this 对象。 this 指当前对象，也就是正在调用这个函数的对象。 使用 apply， 你可以只写一次这个方法然后在另一个对象中继承它，而不用在新对象中重复写该方法。

### 手写 apply

```
 Function.prototype.myCall = function(context) {
    let result;

     // 首先检验this是不是个函数, this指代原函数
    if(typeof this !== 'function') {
        throw new TypeError(`${this} is not a function`)
    }

    // context 初始化，以及将原函数赋值到其fn属性上
    // ps： context指代上下文对象
    context = context || window
    context.fn = this;

    // 如果第二个参数（数组）存在
    // 带参数执行 : 无参数执行
    result = arguments[1] ? context.fn(...arguments[1]) : content.fn()

    // 删除context上本不存在的fn
    delete context.fn

    // 返回结果
    return result
 }
```

<Valine />
