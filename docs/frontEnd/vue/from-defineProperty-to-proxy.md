# 从Object.defineProperty到Proxy

随着*vue3.0beta*版的发布，*vue*即将迎来新一轮的技术革新。对于vue源码 的学习，也成为了一个优秀的vue工程师必不可少的一部分, 而*vue*中的*响应式原理*正是其中最主要的一部分。

本文主要讲述了*Object.defineProperty*与*Proxy*的区别，以及二者在*vue* 中的应用。以下是本文的思维导图。

![total](/total.png)

## Object.defineProperty

**`Object.defineProperty()`** 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

```js
Object.defineProperty(obj, prop, descriptor)
```

- `obj` 定义的对象
- `prop` 要定义或修改的属性
- `descriptor` 要定义或修改的属性描述符

属性描述符又有*configurable*、*enumerable*、*value*、*writeable*、*get*、*set*等情况。

这里每一个都有其相应的作用，但我们这里重点关注下get与set这2个描述符。

对于其他的呢，留到下次吧。有需要可以看看[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)上关于他们的描述。

### Getter与Setter

嗯？ 怎么这里又变成了Getter与Setter呢？

当对象的属性拥有这两个*get*与*set*特性时，那在访问属性或者写入属性值时，对返回值做附加的操作。而这个操作就是*getter/setter*函数。

这里确实有点纠结，感觉可以用下面的方式方便理解

```js
var obj = {
  a: 1
  // 下面伪代码，方便理解
  /*
  a: {
  	// 读取， 如 obj.a
    get: function getter() {},
    // 设值  如 obj.a = 2
    set: function setter(val) {}
  }
  */
}
```

其实差不多就是这种概念，若有错误，欢迎指正！

好了，废话不多说了，开始正题吧。

<img src="/code.png" alt="code" style="zoom:100%;" />

在getter函数里执行*`console.log('获取name值')`*，并执行*`this._name`*。

在setter函数里执行*`console.log('设置name值')`*，并执行*`this._name = val`*。

也就是:

- 获取数据时，触发*getter函数*。
- 设置数据时，触发*setter函数*。

> 当使用getter或者set时，就不能使用value和writable描述符, 否则会抛出异常。

对于这个思路，响应式不也是这样吗？获取数据时，收集依赖，修改这个数据时，执行这些依赖。

提到响应式，自然就想起来Vue，接下来我们看看vue2是怎么实现的呢

### vue2中的Object.defineProperty

![data](/data.png)

初始化阶段会遍历data中的值，将data中每个值通过*defineReactive函数*变为响应式数据，在get 中收集依赖，在setter中执行消息通知，通知所有依赖（watcher实例），使其相关联的组件得到更新 。

```js
// 精简版defineReactive
export function defineReactive(obj, key, val) {
  if (arguments.length === 2) {
    val = obj[key];
  }
  if (typeof val === 'object') {
    new Observer(val);
  }
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      dep.depend(); // 收集依赖
      return value;
    },
    set: function reactiveSetter(newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify(); // 通知依赖
    },
  });
}

```

这里出现了一个dep，dep是啥呢？

我们都知道data中的数据，都可能被多个地方引用，这也就是所谓的*“依赖”*。

当依赖增多，就不得不考虑怎么去安放这个依赖了，也就引入了依赖管理器Dep的概念。管理器需要去新增(addSub)，删除(removeSub)、收集相关依赖(depend)，通知(notify)

```js
export default class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    //  移除依赖
    remove(this.subs, sub);
  }

  depend() {
    // 添加一个依赖 
     if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}
```

这里也就存在一个问题，*依赖*到底是什么？

依赖代表某个组件运用了某条数据，但这个机制不能放在组件里去实现，将其抽离出来，也就是形成了现在的Watcher类。

```js
export default class Watcher {
    constructor (vm,expOrFn,cb) {
      this.vm = vm;
      this.cb = cb;
      this.getter = parsePath(expOrFn)
      this.value = this.get()
    }
    get () {
     	Dep.target = this;
      const vm = this.vm
      let value = this.getter.call(vm, vm)
      Dep.target = undefined;
      return value
    }
    update () {
      const oldValue = this.value
      this.value = this.get()
      this.cb.call(this.vm, this.value, oldValue)
    }
  }
```

现在我们来分析Watcher类型

- 实例化*Watch类*， 会调用*`this.get()`*
- 在*get函数*中
  - *`Dep.target = this`*会将其赋值给Dep的静态属性，保证了同一时间只有一个watcher实例
  - *`let value = this.getter.call(vm, vm)`*调用*getter方法*获取到数据值，但在*Object.defineProperty*中的getter函数里设置了依赖收集，所以执行这个语句时，就会执行该数据的相关依赖的收集。
  - *`Dep.target = undefined;`*收集完依赖后，释放*Dep.target*，保证后续同一时间只有一个watcher实例。
- 当数据变化时，
  - 会调用数据的*setter函数*，在*setter*中调用*`dep.notify()`*
  - *`dep.notify()`*会遍历*subs*，也就是遍历所有依赖，并调用依赖自身(Watcher实例)的*update*方法,
  - *`update()`*中调用数据变化的更新回调函数，从而更新视图。

为了便于理解，特画出关系流程图，如下图：

<img src="/vue2.png" alt="vue2" style="zoom:100%;" />

以上，就整理出了Object.defineProperty在Vue2中的应用。

但*Object.defineProperty*并不是完美的，它存在 一些自身的问题，下面就列举下*Object.defineProperty*在vue中的缺陷

- *Object.defineProperty*无法“*友善地*”监听数组变化。(具体可参考[Vue为什么不能检测数组变动](https://segmentfault.com/a/1190000015783546))

  vue通过重写*`push() pop() shift() unshift() splice() sort() reverse()`* 8个方法，来实现vue数组的监听，但其他的方法就不能有效的实现监听。

- *Object.defineProperty*无法劫持整个对象。

  因此需要遍历对象，对其每个属性进行监听。如果对象层级复杂，操作与性能都会得到一定浪费。

> 关于Object.defineProperty不能监听数组长度的解释：
>
> [MDN-Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)中的configurable中明确标出：当且仅当该属性的 `configurable` 键值为 `true` 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除。
>
> 而数组的length的configurable为false，并且禁止修改，强行修改会抛出*“VM305:1 Uncaught TypeError: Cannot redefine property: length”*的异常。

## Proxy

**Proxy** 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）。

```js
const p = new Proxy(target, handler)
```

- `target` 要使用 `Proxy` 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- `handler` 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 `p` 的行为。

### 怎么用

![proxy](/proxy.png)

这里我们可以明显的看出来`Proxy`可以友好的修复`Object.defineProperty`中的缺陷。

除了修复问题外，`Proxy`对象，还提供 了新的劫持方案。

* **`handler.apply()`**  用于拦截函数的调用。
* **`handler.construct()`** 用于拦截[`new`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new) 命令。
* **`handler.defineProperty()`** 用于拦截对对象的 [`Object.defineProperty()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 操作。
* **`handler.deleteProperty()`** 用于拦截对对象属性的 [`delete`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/delete) 操作。
* **`handler.get()`** 用于拦截对象的读取属性操作。
* **`handler.getOwnPropertyDescriptor()`** 用于拦截 [`Object.getOwnPropertyDescriptor()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) 。
* **`handler.getPrototypeOf()`** 用于拦截获取对象原型。
* **`handler.has()`** 用于拦截 [`in`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/in) 操作符。
* **`handler.isExtensible()`** 用于拦截对对象的[Object.isExtensible()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible)。
* **`handler.ownKeys()`** 用于拦截 [`Reflect.ownKeys()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys)。
* **`handler.preventExtensions()`** 用于拦截[`Object.preventExtensions()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)。
* **`handler.set()`** 用于拦截对象的设置属性操作。
* **`handler.setPrototypeOf()`** 用于拦截 [`Object.setPrototypeOf()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf).

另外在这里，出现了*`Reflect`*这个对象。`Reflect`对象与`Proxy`对象一样，是ES6为了操作对象而提供的新API。(PS:抽离`object`中的语言内部方法（比如`Object.defineProperty`），将其放到`Reflect`对象上，未来的新方法将只部署到`Reflect`对象上。)

### vue3中的Proxy

虽说*vue3Beta版*发布了, 但真正去写vue3的人不会那么多，那好，先上图。

![vue3](/vue3.png)

这种称之为[Composition API](https://vue-composition-api-rfc.netlify.app/#summary)，未来将与vue2中*Option API*(PS：当前使用)携手共进退。

对于[Composition API](https://vue-composition-api-rfc.netlify.app/#summary)，我们也可以从初始化Proxy，get依赖收集，set触发依赖更新等角度 来看。

##### 初始化Proxy

```ts
const rawToReactive = new WeakMap<any, any>();
const reactiveToRaw = new WeakMap<any, any>();

export function reactive(target: object) {

  let observed = rawToReactive.get(target);
  if (observed !== void 0) {
    return observed;
  }
  if (reactiveToRaw.has(target)) {
    return target;
  }

  observed = new Proxy(target, handlers);
  rawToReactive.set(target, observed);
  reactiveToRaw.set(observed, target);
  return observed;
}

```

- *`rawToReactive`*用于保存*原始数据* -*响应数据*的键值对集合，*`reactiveToRaw`*用于保存*响应数据*-*原始数据*的键值对集合。

  这两个集合用于保证*原始数据*转成*响应式数据*只被转换一次，并且可以通过*原始数据*得到*响应数据*，通过*响应数据*得到*原始数据*。

- `reactive`中从 *`rawToReactive`*取目标值，判断是否已被转换成*响应式数据*，从*`reactiveToRaw`*判断是否存在目标值。

- *`  observed = new Proxy(target, handlers);`*这里将目标值转成*Proxy对象*，即*响应式数据*。（PS：*handlers*见后文）

- 将键值对保存到*`rawToReactive`*和*`reactiveToRaw`中，用于后续使用。

- 返回响应式数据 。

##### handlers过程

```ts
export const Handlers: ProxyHandler<object> = {
  get: function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver);

    track(target, 'get', key);
    return isObject(res) ? reactive(res) : res;
  },
  set: function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ) {
    const oldValue = target[key];

    const hadKey = hasOwn(target, key);
    Reflect.set(target, key, value, receiver);

    if (!hadKey) {
      trigger(target, 'add', key, value);
    } else if (value !== oldValue) {
      trigger(target, 'set', key, value, oldValue);
    }
  },
};
```

1. *`get`*函数过程
   - *`const res = Reflect.get(target, key, receiver)`*获取目标属性值
   - *`track(target, 'get', key)`*追踪目标相关副作用（依赖）
   - 判断是否是对象
     - 是对象，通过*`reactive(res)`*保持深度处理
     - 返回res
2. *`set`*函数过程
   * *`const oldValue = target[key];`*获取旧值
   * *`Reflect.set(target, key, value, receiver)`*设置新值
   * *`const hadKey = hasOwn(target, key)`*判断目标中是否存在该属性
     * 不存在，通过*`trigger(target, 'add', key, value)`*触发*“新增副作用（依赖）”*操作，并执行*“执行副作用（依赖）”*操作。
     * 如果*`value !==  oldValue`*，通过*`trigger(target, 'set', key, value, oldValue)`*触发*“执行副作用（依赖）”*操作。

##### track函数【追踪副作用（依赖）】与trigger函数【触发副作用（依赖）】

```js
export function track(target, type, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

export function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const effects = new Set();
  const computedRunners = new Set();

  depsMap.get(key).forEach((effect) => {
    if (effect !== activeEffect || !shouldTrack) {
      if (effect.options.computed) {
        computedRunners.add(effect);
      } else {
        effects.add(effect);
      }
    }
  });

  computedRunners.forEach((effect) => effect());
  effects.forEach((effect) => effect());
}
```

1.  track过程

   * *`let depsMap = targetMap.get(target)`*获取当前目标的*depsMap*(*依赖集合*)，不存在则新建

   * *`let dep = depsMap.get(key)`*获取当前*key*（*属性*）下的依赖，不存在则新建

   * *`!dep.has(activeEffect)`*判断依赖中是否存在*activeEffect*[*活跃副作用(依赖)*], 不存在则收集该依赖

     > 所有的effect都会存储于effectStack栈中，activeEffect则为最上层的数据。用于保证当前活跃副作用（依赖）只有一个，类似于vue2中的Dep.target。

2. trigger过程

   * *`const depsMap = targetMap.get(target)`*获取当前目标的*depsMap*(*依赖集合*)，不存在则返回，表示不存在依赖
   * *`const effects = new Set()`*新建一个effects集合，*`const computedRunners = new Set();`*新建一个计算属性集合
   * *`depsMap.get(key).forEach()`* 遍历当前key值的所有依赖 
     *  *`effect !== activeEffect || !shouldTrack`*判断effect（副作用）*是否为*activeEffect*（PS：避免二次处理），并且不可被追踪 
     * *`effect.options.computed`*判断是否是*computed*使用，是则将*effect【副作用（依赖）】*添加到*computedRunners*，否则将*effect【副作用（依赖）】*添加到*computedRunners*
   * 遍历*computedRunners*和*effects*，并执行每个*副作用（依赖）*

> 什么是Effect(副作用)?
>
> 一个函数执行 了某些与自身返回值无关的事。
>
> 对Vue而言，依赖于这条数据的值， 执行effect时，总会对这个值执行某个操作，导致Effect并不是一个纯函数。

为了便于理解，特画出关系流程图，如下图：

![reactivity](/proxy-reactivity.png)

## Object.defineProperty(Get/Set部分)与Proxy区别

<img src="/differences.png" alt="differences" style="zoom:200%;" />

*Proxy*虽然支持了*Object.defineProperty*上不支持的问题，但它不支持IE。而*Vue*也对其做了兼容性处理，支持Proxy的情况下使用Proxy，而IE中仍将继续使用*Object.defineProperty*。

##  结语

随着*Vue3Beta版*的发布，*Proxy*必将得到极大的推广。*Proxy*虽好，但别“上头”，考虑好兼容性问题。根据使用场景，合理选择*Object.defineProperty*或*Proxy*才是“上上之策”。

## 参考文献

- [MDN-Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

- [MDN-Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

- [MDN-Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

- [Vue为什么不能检测数组变动](https://segmentfault.com/a/1190000015783546)