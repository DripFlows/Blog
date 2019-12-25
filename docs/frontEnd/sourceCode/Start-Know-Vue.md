# Vue 源码的感悟(一)

最近在看 vue 源码，虽不能全知全解，亦不能畅通全文。但也略有收获，特在此记录下看 vue 源码中的感悟。

## init

> 源自`Vue`源码下 `src/core/instance/init.js`

```
    // expose real self
    vm._self = vm

    // 初始化生命周期
    initLifecycle(vm)

    // 初始化事件
    initEvents(vm)

    // 初始化渲染器
    initRender(vm)

    // 执行beforeCreate生命周期
    callHook(vm, 'beforeCreate')

    // 初始化Inject
    initInjections(vm) // resolve injections before data/props

    //  初始化State
    initState(vm)

    // 初始化Provide
    initProvide(vm) // resolve provide after data/props

    // 执行create声明周期
    callHook(vm, 'created')
```

- 这段仅在`init`函数中定义了函数的执行顺序，将各自个逻辑交给各自函数执行，非常有效的解耦了，各自函数互不影响。维护时只需根据不同的场景处理不同的函数。
- 其次，将`vm`传递给每个函数，有效了传递了`new Vue()`这个实例，每个组件，虽由庞大的系统构成，但仍是同一个`vue`实例。

ß
## Object.create(null)
`Vue` 源码常用`Object.create(null)`来创建一个空对象，所以其实就有个疑惑了。  
为什么不使用`var obj = {}`来创建新对象？  
> `var obj = {}` 会包含Object原型链上的一些方法，比如`toString`、`hasOwnProperty`等 , 而Object.create(null) 相当于把null设为原型，故将是一个干净的对象，不包含其他原型方法。

## 

<Valine />