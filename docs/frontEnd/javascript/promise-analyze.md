# 手写 Promise 解析

## 前言

之前完成了《[手写 Promise](http://sillyy.cn/frontEnd/javascript/promise.html)》,现在我们讨论下手写的 Promise 是如何运行的？

> [手写 Promise 源码](https://github.com/sillyY/promise/blob/master/src/index.js)

## 单 then

### How to Use

```js
const Promise = require("./index");

function execute() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    });
  });
}

execute().then(res => {
  console.log(res);
});

// => 1
```

### new Promise()

```js
class Promise {
  constructor(executor) {
    this._state = PENDING
    this._value = undefined
    this._reason = undefined
    this._onResolvedQueues = []
    this._onRejectedQueues = []

    const resolve = value => {
        if (this._state === PENDING) {
          this._state = FULFILLED
          this._value = value
          this._onResolvedQueues.forEach(fn => fn())
        }
      },
      reject = reason => {
        if (this._state === PENDING) {
          this._state = REJECTED
          this._reason = reason
          this._onRejectedQueues.forEach(fn => fn())
        }
      }

    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
    // 省略其他
  }
```

new Promise()（promise 实例 1） 中执行 executor，即这里的 setTimeout,但由于 setTimeout(PS：设为计时器 1, 方便后续多个计时器区分) 本身属于后续宏任务，所以会之后执行，即这里会先继续执行 then 函数

### then

```js
then(onFulfilled, onRejected) {
    // 省略其他
    let promise = new Promise((resolve, reject) => {
      if (this._state === FULFILLED) {
        setTimeout(() => {
          try {
            const result = onFulfilled(this._value)
            this._resolvePromsie(promise, result, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }

      if (this._state === REJECTED) {
        setTimeout(() => {
          try {
            const result = onRejected(this._reason)
            this._resolvePromsie(promise, result, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }
      if (this._state === PENDING) {
        this._onResolvedQueues.push(() => {
          setTimeout(() => {
            try {
              const result = onFulfilled(this._value)
              this._resolvePromsie(promise, result, resolve, reject)
            } catch (err) {
              reject(err)
            }
          })
        })
        this._onRejectedQueues.push(() => {
          setTimeout(() => {
            try {
              const result = onRejected(this._reason)
              this._resolvePromsie(promise, result, resolve, reject)
            } catch (err) {
              reject(err)
            }
          })
        })
      }
    })
    return promise
  }
```

- 这里再次创建了个新的 Promise 对象(PS: 设为 promise 实例 2), 然后执行里面的代码
- 根据 status（PS:这里指的是 promise 实例 1 的 status） 判断，首次运行，就是 PENDING, 故这里 this.\_onResolvedQueues 和 this.\_onRejectedQueues 添加响应的函数(PS:里面的计时器设为计时器 2)
- 返回这个 Promise

### then 后

- 上面的同步任务已完全执行，接下来就执行先加入宏任务的计时器 1，即调用`resolve(1)`
- 此时 promise1 的 status 是 PENDING, 则执行下面代码

```
this._state = FULFILLED
this._value = value
this._onResolvedQueues.forEach(fn => fn())
```

- 修改 state 和 value， 顺序调用 this.\_onResolvedQueues 的函数，即调用下面代码(计时器 2)

```
setTimeout(() => {
    try {
        const result = onFulfilled(this._value)
        this._resolvePromsie(promise, result, resolve, reject)
    } catch (err) {
        reject(err)
    }
})
```

- 这里的 onFulfilled 是 res => console.log(res)，故打印了结果 1, result 结果为 undefined
- 接下来调用 resolvePromsie 函数

### resolvePromsie

```
resolvePromsie(promise, result, resolve, reject) {
    // 防止循环引用
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

- 由于 result 为 undefined, 故直接 resolve， 即调用下面代码

```
if (this._state === PENDING) {
    this._state = FULFILLED
    this._value = value
    this._onResolvedQueues.forEach(fn => fn())
}
```

- promise 实例 2 的 state 是 PENDING,执行内部代码
- 修改 state 和 value，由于 this.\_onResolvedQueues 的长度为 0， 故到此结束

## 多个 then

### How to Use

```js
const Promise = require("./index");

function execute() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    });
  });
}

execute()
  .then(res => {
    console.log("First log");
    return res;
  })
  .then(res => {
    console.log("Second log");
    console.log(res);
  });

// First log
// Second log
// 1
```

- 这里开始是一样的，从 then 后开始不一致，由于多了一个 then，故同步任务还未结束，故继续执行 then

### then 后

这里的 promise 是 promise 实例 2，调用 then 方法，即执行下面代码

```js
then(onFulfilled, onRejected) {
    // 省略其他
    let promise = new Promise((resolve, reject) => {
      if (this._state === FULFILLED) {
        setTimeout(() => {
          try {
            const result = onFulfilled(this._value)
            this._resolvePromsie(promise, result, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }

      if (this._state === REJECTED) {
        setTimeout(() => {
          try {
            const result = onRejected(this._reason)
            this._resolvePromsie(promise, result, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }
      if (this._state === PENDING) {
        this._onResolvedQueues.push(() => {
          setTimeout(() => {
            try {
              const result = onFulfilled(this._value)
              this._resolvePromsie(promise, result, resolve, reject)
            } catch (err) {
              reject(err)
            }
          })
        })
        this._onRejectedQueues.push(() => {
          setTimeout(() => {
            try {
              const result = onRejected(this._reason)
              this._resolvePromsie(promise, result, resolve, reject)
            } catch (err) {
              reject(err)
            }
          })
        })
      }
    })
    return promise
  }
```

- 这里再次创建了个新的 Promise 对象(PS: 设为 promise 实例 3), 然后执行里面的代码
- 根据 status(PS: 这里指的是 promise 实例 2 的 status) 判断，首次运行，就是 PENDING, 故这里 this.\_onResolvedQueues 和 this.\_onRejectedQueues 添加响应的函数(PS:里面的计时器设为计时器 3)
- 返回这个 Promise

### then 后

- 上面的同步任务已完全执行，接下来就执行先加入宏任务的计时器 1，即调用`resolve(1)`
- 此时 promise 实例 1 的 status 是 PENDING, 则执行下面代码

```js
if (this._state === PENDING) {
    this._state = FULFILLED
    this._value = value
    this._onResolvedQueues.forEach(fn => fn())
}
```
- 顺序执行 promise 实例 2 中的 onResolvedQueues, 即执行下面代码
```js
setTimeout(() => {
    try {
        const result = onFulfilled(this._value)
        this._resolvePromsie(promise, result, resolve, reject)
    } catch (err) {
        reject(err)
    }
})
```
这里的 onFulfilled 是 res => { console.log("First log"); return res }，故打印了 First log, result 结果为 1
- 执行resolvePromsie

### resolvePromsie

- 由于 result 为 1, 故直接 resolve(这里的 resolve 是 promise 实例 2), 即调用下面代码

```js
if (this._state === PENDING) {
    this._state = FULFILLED
    this._value = value
    this._onResolvedQueues.forEach(fn => fn())
}
```

- promise 实例 2 的 state 是 PENDING,执行内部代码
- 修改 state 和 value
- 顺序执行 promise 实例 2 中的 onResolvedQueues, 即执行下面代码
```js
setTimeout(() => {
    try {
        const result = onFulfilled(this._value)
        this._resolvePromsie(promise, result, resolve, reject)
    } catch (err) {
        reject(err)
    }
})
```
- 这里 onFulfilled 是 res => { console.log("Second log"); console.log(res); } ,故打印了 First log   1, result 为undefined
- 由于 result 为 undefined, 故直接 resolve， 即调用下面代码

```
if (this._state === PENDING) {
    this._state = FULFILLED
    this._value = value
    this._onResolvedQueues.forEach(fn => fn())
}
```

- promise 实例 2 的 state 是 PENDING,执行内部代码
- 修改 state 和 value，由于 this.\_onResolvedQueues 的长度为 0， 故到此结束

::: danger
N个then 也只是循环上面流程  
reject 也是类似操作
:::

## Note
::: warning
1.手写的Promise不能去跟setTimeout、setInterval进行调用顺序判断  
2.手写Promise中运用了setTimeout去实现异步执行，故整个流程会异常  
3.JS标准中的Promise是底层通过别的方式实现的微任务，这里只是模拟实现Promise的方式，只为深刻了解Promise,并不能用于实际开发。
:::