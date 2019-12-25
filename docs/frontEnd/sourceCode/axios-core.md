# axios 核心源码解析

## 前言

axios 自推出以来，就得到了众多开发者的喜爱。近日，看了 axios 的源码，对其核心代码进行解读。

::: tip
[NPM](https://www.npmjs.com/package/axios)  
[Github](https://github.com/axios/axios)
:::

## Axios

### 1.首先声明其构造函数

```js
// lib/core/Axios.js
function Axios(instanceConfig) {
  // 导入默认配置
  this.defaults = instanceConfig;
  // 拦截器
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}
```

### 2.get、post、put、delete 等方法

```js
// lib/core/Axios.js
utils.forEach(
  ["delete", "get", "head", "options"],
  function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, config) {
      return this.request(
        utils.merge(config || {}, {
          method: method,
          url: url
        })
      );
    };
  }
);

utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  Axios.prototype[method] = function(url, data, config) {
    return this.request(
      utils.merge(config || {}, {
        method: method,
        url: url,
        data: data
      })
    );
  };
});
```
这里我们可以看到其本质是调用了request函数

### 3.request函数
```js
// lib/core/Axios.js
Axios.prototype.request = function request(config) {
   // 参数转换
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  // 合并默认配置
  config = mergeConfig(this.defaults, config);

  // 设置method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // 设置拦截器钩子
  // chain对应then中的onResolved, onRejected
  var chain = [dispatchRequest, undefined];
  // 1. 先执行Promise.resolve()
  var promise = Promise.resolve(config);

  /*** 作为拦截器部分 ***/
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    // 2. 再执行Ppromise = promise.then(）
    // 4. then中最后执行
    // chain.shift() 返回onResolved, onRejected函数
    promise = promise.then(chain.shift(), chain.shift());
  }
  // 3. 执行 return promise
  return promise;
};
```
- 这里声明了chain(链), 代表着链式调用结构，表明执行顺序按数组内顺序执行，添加了`dispatchRequest`和`undefined` 2个值, 分别代表onResolved, onRejected函数
- 拦截器，这里大概意思就表示:
    - request(请求前），将拦截器的fulfilled和rejected添加到 onResolved, onRejected前面
    - response(请求后), 将拦截器的fulfilled和rejected添加到 onResolved, onRejected后面  
  就形成了`[fulfilled(请求前),rejected(请求前),onResolved, onRejected,fulfilled(请求后),rejected(请求后)]`,然后通过顺序调用，实现正式请求前和正式请求后拦截

```
// use
axios.request({
    method: 'get',
    url: '/user'
}).then(res=> {
    // 在onResolved返回结果后，调用请求后的nResolved, 得到这里的res
    console.log(res)
})
```


