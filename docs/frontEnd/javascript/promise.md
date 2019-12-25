# 手写 Promise

Promise 源自 ES6，异步处理函数，是目前比较流行的 JavaScript 异步编程解决方案之一
::: tip
[Promise](http://es6.ruanyifeng.com/#docs/promise)
:::

## Promises/A+ 规范

> 为实现者提供一个健全的、可互操作的 JavaScript Promise 的开放标准。

- [原文](https://promisesaplus.com/)
- [译文](https://juejin.im/post/5c4b0423e51d4525211c0fbc)

## 开发准备

- 状态  
  Promise 存在 3 种状态， 等待状态(PENDING)，执行状态(FULFILLED), 拒绝状态(REJECTED)

- Promise 类私有属性

  - \_state 用于存储状态
  - \_value 用于储存执行状态(FULFILLED)中不可变的值
  - \_reason 用于储存拒绝状态(REJECTED)中不可变的值
  - \_onResolvedQueues 用于存储成功回调的函数
  - \_onRejectedQueues 用于存储失败回调的函数

- 示例解析

```
new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1)
    })
}).then(res => {
    console.log(res)
}, err => {
    console.log(err)
})
```

1.  `Promise` 是一个构造函数，需要 `new` 去生成一个新实例，函数参数是一个函数
2.  拥有 `then` 方法，`then` 方法参数是一个函数

## 开发

### 声明状态常量并创建一个简易的 Promise 类

```
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class Promise {
  constructor(executor) {
    this._state = PENDING;
    this._value = undefined;
    thhis._reason = undefined;
    this._onResolvedQueues = [];
    this._onRejectedQueues = [];

    const resolve = value => {
        if (this._state === PENDING) {
          this._state = FULFILLED;
          this._value = value;
          this._onResolvedQueues.forEach(fn => fn());
        }
      },
      reject = reason => {
        if (this._reason === PENDING) {
          this._state = REJECTED;
          this._reason = reason;
          this._onRejectedQueues.forEach(fn => fn());
        }
      };
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
}
```

调用 下面代码

```
new Promsie((resolve, reject) => {
    // 省略...
    resolve()
}),
```

即相当于执行`resolve()` 部分

### 开发 then 方法，then 方法参数为 onFulfilled 和 onRejected 2 个函数

- 起步阶段

```
 // 声明 isFunction
function isFunction(fn) {
    return typeof fn === 'function'
}

// Promise 类中public方法
then(onFulfilled, onRejected) {
    // 先判断onFulfilled 和 onReject 是否为函数，非函数转成相应函数
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : value => value
    onRejected = isFunction(onRejected)
        ? onRejected
        : err => {
            throw err
        }

    // 创建一个新的Promise实例，并返回它
    let promise = new Promise((resolve, reject) => {
        // TODO:省略关键代码
    })

    return promise
}
```

::: tip
“创建新的 Promise 实例，并返回” - 用于形成链式调用，即 `new Promsie().then().then(). ... (省略函数参数)`
:::

- 处理新的 Promise 实例 传参函数
  根据 Promise 实例的 state 状态，执行相应函数

```
if (this._state === FULFILLED) {
  setTimeout(() => {
    try {
      let result = onFulfilled(this._value);
      // TODO:省略resolvePromise
    } catch (err) {
      reject(err);
    }
  });
}
if (this._state === REJECTED) {
  setTimeout(() => {
    try {
      let result = onRejected(this._reason);
      // TODO:省略resolvePromise
    } catch (err) {
      reject(err);
    }
  });
}
if (this._state === PENDING) {
  this._onResolvedQueues.push(() => {
    setTimeout(() => {
      try {
        let result = onFulfilled(this._value);
        // TODO:省略resolvePromise
      } catch (err) {
        reject(err);
      }
    });
  });
  this._onRejectedQueues.push(() => {
    setTimeout(() => {
      try {
        let result = onRejected(this._reason);
        // TODO:省略resolvePromise
      } catch (err) {
        reject(err);
      }
    });
  });
}

```

::: tip

1. setTimeout 是为了保证执行函数是异步执行
2. FULFILLED(执行状态)和 REJECTED(拒绝状态）则直接运行函数
3. PENDING(等待状态) 分别收集 FULFILLED(执行状态)和 REJECTED(拒绝状态）的执行栈
   :::

::: danger
resolvePromise 函数用于处理新的实例(promise)与“父实例”处理结果(result)之间的关系
:::

- 处理 resolvePromise 函数，参数包含新的实例(promise), 父实例处理结果(result), resolve 函数，reject 函数

```
// 调用resolvePromise
resolvePromsie(promise, result, resolve, reject)
```

resolvePromise 代码如下：

```
// 声明isObject
function isObject(obj) {
    return typeof obj === 'object'
}
// Promise 类私有方法
_resolvePromsie(promise, result, resolve, reject) {
    if (promise === result) {
      return reject(new TypeError('Chaining cycle detected for promise'))
    }

    let isExecuted = false
    if (result !== null && (isFunction(result) || isObject(result))) {
      try {
        let then = result.then
        if (isFunction(then)) {
          then.call(
            result,
            value => {
              if (isExecuted) return
              isExecuted = true
              this._resolvePromsie(promise, value, resolve, reject)
            },
            err => {
              if (isExecuted) return
              isExecuted = true
              reject(err)
            }
          )
        } else {
          resolve(result)
        }
      } catch (err) {
        if (isExecuted) return
        isExecuted = true
        reject(err)
      }
    } else {
      resolve(result)
    }
  }
```

::: tip

1. 判断 result 和 promise 是否相等，防止循环引用
2. isExecuted 用于保证 当前 promise 未被调用
   :::

### 补充 Promise 其他方法

其他方法已不需要额外特别开发，通过调用现有方法即可完成，故在此仅贴出代码。

- catch

```
catch(fn) {
    return this.then(null, fn)
}
```

- Promise.resolve 与 Promise.reject

```
static resolve(value) {
    return new Promise((resolve, reject) => {
        resolve(value)
    })
}
static reject(err) {
    return new Promise((resolve, reject) => {
        reject(err)
    })
}
```

- Promise.all

```
static all(promises) {
  let arr = []
  let i = 0
  function processData(index, data) {
    arr[index] = data
    i++
    if (i == promises.length) {
      resolve(arr)
    }
  }
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(data => {
        processData(i, data)
      }, reject)
    }
  })
}
```

- Promise.race

```
static race(promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject)
    }
  })
}
```

## 测试

可以通过 promises-aplus-tests 来测试 promise 是否满足 Promises/A+ 规范

> [promises-aplus-tests](https://github.com/promises-aplus/promises-tests#readme)

::: danger
全局安装 promises-aplus-tests 后，在文件添加如下代码, 然后执行 promises-aplus-tests + 文件名
:::

```
//promise的语法糖
Promise.defer=Promise.deferred=function(){
    let dfd={};
    dfd.promise=new Promise((resolve,reject)=>{
        dfd.resolve=resolve;
        dfd.reject=reject;
    })
    return dfd;
}
```

## 参考文献
- [Promises/A+](https://promisesaplus.com/)
- [Yangfan2016](https://github.com/Yangfan2016) -[【译】 Promises/A+ 规范](https://juejin.im/post/5c4b0423e51d4525211c0fbc)
- [afan](https://juejin.im/user/5b2c66b36fb9a00e406a943f) - [根据 Promises/A+规范 手写 Promsie](https://juejin.im/post/5b5ad5755188251ad06b735c#heading-5)

> 代码仓库
[promise](https://github.com/sillyY/promise)

<Valine />