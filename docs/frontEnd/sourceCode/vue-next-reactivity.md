# Vue 3.0的数据监听
10月05日凌晨Vue3的源代码正式发布了，由于某些原因，好几天后才看到源码。
看完reactivity模块的最大感受就是，比2.x的源码简单多了，很多地方都进行了解耦，看起来轻松多了。

> 官方仓库 [vue-next](https://github.com/vuejs/vue-next)

> 个人解析[vue3.0](https://github.com/sillyY/vue3)


## 先导知识
- [Vue Composition API RFC](https://vue-composition-api-rfc.netlify.com/#api-introduction)
- [Proxy及其API](http://es6.ruanyifeng.com/#docs/proxy)
- [Reflect及其API](http://es6.ruanyifeng.com/#docs/reflect)

## @vue/reactivity模块
该模块是Vue3的数据响应式系统，包含reactive(响应式数据)、computed(计算数据)、effect(副作用)、ref(数据容器)等几个部分。
> 目录位于 `packages/reactivity`

### How to Use
```js
const value = reactive({ num: 0 })
const cValue = computed(() => value.num * 2)
effect(() => {
  console.log(value.num)
})
value.num = 1
```

### reactivity
拆分成5个部分
- reactive  
    响应式数据，用于生成Proxy对象
- effect  
    用于创建effect对象
- handler  
    Proxy对象handler  
    包含baseHandler和collectionHandler,baseHandler包含大多数场景.
- computed  
    计算属性
- ref  
    ref对象
![reactivity](/reactivity.png)

### reactive
reactive主要用于生成Proxy对象
> 建议随代码阅读，该图片建议打开新标签页阅读

![reactive](/reactive.png)

### effect
effect生成的对象作为一个容器，保存着将要发生的变化.
本身亦属于内部实现代码，非开发者使用代码
> 建议随代码阅读

![effect](/effect.png)

### handler
本身是Proxy对象的handler, 用于存放目标target本身的get、set、deleteProperty、has、owekeys方法。
> 建议随代码阅读, 该图片建议打开新标签页阅读

![baseHandler](/baseHandler.png)

### computed
计算属性，其实也就是调用reactive、effect、和handler的方法实现。
> 建议随代码阅读

![computed](/computed.png)


### ref
ref对象，它指的不是vue2.0中的那个[ref](https://cn.vuejs.org/v2/api/#ref),它是vue3里的新产物，表示响应式对象

>建议随代码阅读

![ref](/ref.png)

## 总结
Vue3的响应式数据系统，相比较Vue2来说，通过Proxy解决了Vue2中的对象监听问题，算是有了很大的提升。其次，在源码上来说，解耦保证了其简洁、清晰、高效的特点。
但是大幅改变了Vue的写法，虽然存在兼容模式，但还是增加了开发者的学习负担。

<Valine />