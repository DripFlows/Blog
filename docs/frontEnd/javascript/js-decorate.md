# 初识ES装饰器Decorate

### 一、引言

因为最近在公司做一个SKD项目，经常发现要实现很多某些功能相近的逻辑，所以就一直在思考怎么才能减少重复的工作，提提高开发效率。一开始想到的是封装，把逻辑抽象到某个方法中，在需要使用到地方直接调用一下，但是这样又会增加代码的耦合度，并且增加依赖。后面也考虑过函数式编程的高阶函数，高阶函数比函数封装更加简便，但相对的也需要对每个函数多包装一层，开发起来也还是不够灵活。最后想起了es7新出的decorate装饰器，似乎能解决上述的问题，而且写法也比较优雅(主要是逼格高)，然后抱着学习新知识的心态，学习了一下前端装饰器。

# <img src="/Users/wuqingfu/Library/Application Support/typora-user-images/image-20200414000037489.png" alt="image-20200414000037489" style="zoom:50%;" />

### 二、什么是装饰器

鲁迅曾经说过，人靠衣装，佛靠金装，代码也要能装。

<img src="/Users/wuqingfu/Library/Application Support/typora-user-images/image-20200413235823733.png" alt="image-20200413235823733" style="zoom: 25%;" />

现在走到大街上，不管是打扮漂亮的小改改还是穿着帅气的小阁阁，或者是造型花里胡哨的shamate，都有很高的回头率，这就是装饰的作用，它可以让你即使不整形整容，也能够通过装饰来改变自身的气质。

上面扯远了，言归正传。在代码中，装饰器简单来说就是**在不改变对象结构的情况下向一个现有对象添加新的功能**。装饰类和被装饰类互相独立，不会相互耦合，装饰模式是继承的一个替代模式，装饰模式可以动态扩展一个实现类的功能。表现在实际应用中，就可以让开发者很灵活的选择是否需要在class和function中用或者不用某些公用的功能。

### 三、简单用法

*注意： 装饰器还是只是一个es7的提案，使用装饰器需要babel的支持*

因为网上有很多关于装饰器使用的文章，也都比较详细实用，所以本篇就不再做过多的赘述，仅介绍基础的使用，聊聊带过。

1. 在class中使用

```js
// demo1
@testDecorate
class MyTesDecorateClass {
  // ...
}
function testDecorate(target) {
  target.useDecorate = true;
}
MyTesDecorateClass.useDecorate // true

// demo2 demo1添加一个静态属性，如果要添加实例属性，可以通过目标类的prototype对象操作
function testDecorate(target) {
  target.prototype.useDecorate = true;
}
@testable
class MyTesDecorateClass {}
let obj = new MyTesDecorateClass();
obj.useDecorate // true
```

***Tips:修饰器对类的行为的改变，是代码编译时发生的，而不是在运行时，因为修饰器本质就是编译时执行的函数***

2. 方法中使用

```js
// demo1 方法中的简单使用
class Person {
  @readonly
  name() { return `${this.first} ${this.last}` }
}
function readonly(target, name, descriptor){
  // descriptor对象原来的值如下 - 为什么是这些值呢？先卖个关子，后面再讲。
  // {
  //   value: specifiedFunction,
  //   enumerable: false,
  //   configurable: true,
  //   writable: true
  // };
  descriptor.writable = false;
  return descriptor;
}

// demo2 叠加使用
function dec(id){
  console.log('evaluated', id);
  return (target, property, descriptor) => console.log('output', id);
}
class Example {
    @dec(1)
    @dec(2)
    method(){}
}
// 输出结果 - 小朋友，看到这个输出顺序，你是否有很多问号？带着这个问号接着往下看吧。
// evaluated 1
// evaluated 2
// output 2
// output 1
```



### 四、实际问题中的应用

有bug的代码千篇一律，优雅的设计万里挑一。接下来看看在实际项目中，使用装饰器对我们的代码有什么提升。

#### 1. react项目开发中的请求loading问题

开发react的小伙伴可能大多数都会遇到组件loading的问题。描述一下场景，一个列表/详情/其他页面，用户点击刷新/查询之后，代码上会触发一个接口请求，为了更好的交互效果，我们通常会在界面上反馈一个loadin的效果，等到接口响应之后取消loading状态，再显示出接口返回的数据，这时候我们就需要维护一个loading的状态。这时候，如果项目中使用的是react+redux的方式开发的，就麻烦了，特别是像我这样的结构

<img src="/Users/wuqingfu/Library/Application Support/typora-user-images/image-20200414225145854.png" alt="image-20200414225145854" style="zoom:50%;" />

简直是一种折磨，看看在代码中为了一个loading的状态，需要做那几件事情：

1. 在reducers中定义一下loading这个状态!

   ```js
   const initalState = {
     loading: false
   }
   const Reducer = (
     state = initalState,
     {
       type,
       payload
     }
   ) => {
     switch (type) {
       default:
         return state
     }
   }
   ```

2. 在actions中声明一个名为’SET_LAODING_STATE‘的action

   ```js
   export const SET_LOADING_STATE = 'SET_LOADING_STATE'
   ```

   

3. 然后sagas中调用接口后再put一个SET_LAODING_STATE去修改loading状态

   ```js
   // 这个方法应该在点击的时候调用的，为了简单展示，就写到这边了～～～
   yield put({
     type: actions.SET_LOADING_STATE,
     payload: false
   })
   const data = yield call(service.getList, payload)
   yield put({
     type: actions.SET_LOADING_STATE,
     payload: false
   })
   ```

4. 最后在界面中获取loading进行显示。

   ```js
   const loading = useSelector(state => state.common.loading);
   
   export default const ListPage = () => (
   	<LoadComponent isLoading={loading}>
     	{* code *}
     </LoadComponent>
   )
   
   ```

   即使是使用dva的同学，也需要在model中写state和effect等，也是比较烦的。如果有多个界面都需要添加loading状态，那么便需要每个组件都维护一个loading，这样成本就太高了，而且也特别烦。既然那么烦，那我们为什么不把loading做成一个全局的工具呢？

   首先，来分析一下，怎么做成一个全局的工具，需要做以下工作：

   1. 首先需要实现一个loading工具 - utils/loading，需要有传入自定key和getLoadingState的能力
   2. loading工具可以需要对异步方法进行包装，实现阻塞异步请求对功能
   3. 组件内通过getLoadingState(key)，获取到对应的loading状态（如果项目中不需要一个页面多个loading，也可以不用对象和key的方式来实现）
   4. 实现一个装饰器，需要装饰loading的异步方法，使用loading装饰器，在对应的组件中使用loading状态
   
   当前，上面的步骤也不是直接想好的，而是根据下面的几个尝试一步一步的优化而来的：
   
   1. 尝试一：自己动手写一个类似于dispatch的方法，然后拦截异步，并且自主维护loading状态
   
   ```js
   // 通过这个方法，来拦截原本的dispatch，加入定制化的内容
   function * requestSipn({ payload }) {
     const {
       timeout,
     } = yield race({
       timeout: call(setTimeout, 200, {}), // 顺手做一下接口防抖
       stop: take(GLOBAL.REQUEST_FINISH),
     })
     if (timeout) {
       yield put({
         type: actions.SET_LOADING_STATE,
         payload: {
           loading: true,
         }
       })
       // 通过REQUEST_FINISH来判断是否已经请求完成
       yield take(GLOBAL.REQUEST_FINISH)
       yield put({
         type: actions.SET_LOADING_STATE,
         payload: {
           loading: false,
         }
       })
     }
   }
   // 野生dispatch
   function * dispatchSipn({ payload }) {
     // 这里面传的还是普通dispatch的参数，只不过用dispatchSipn再包装了一下
     const { type, payload } = payload
     try {
       yield put({ type: actions.REQUEST_SPIN })
       // 想法很美好，现实很残忍，代码运行到这边的时候，命运还是忍不住踹了我一jio
       // put是saga对Redux中dispatch方法的一个封装，调用put方法后，saga内部会分发action通知Store更新state，所以这边无法监听到异步任务的执行状态，所以此次尝试宣告失败
       yield put({ type, payload })
       // Tips: 如果是用dva项目的小伙伴，那么这边的方法就可以用，dva的effect中封装了type/@@end和type/@@start 的事件，可以监听某个dispatch是否开始or结束
       // yield take(`${type}/@@end`)
       // yield put({ type: actions.REQUEST_SPIN })
     } finally {
       yield put({ type: GLOBAL.REQUEST_FINISH })
     }
   }
   // 模仿一个dispatch
   yield takeLatest(GLOBAL.DISPATCH_SIPN, dispatchSipn)
   ```
   
   2. 尝试二： 把store暴露到window对象中，然后写一个utils方法，来出发dispatch方法
   
   ```js
   // store.js
   sagaMiddleware.run(rootSaga)
   window.__store__ = store
   export default store
   
   // utils/requestWraper.js
   export const requestWraper = (fn) => {
     // 通过柯理化的方式包装request
     return async (...arg) => {
       let res = null
       try {
         window.__store__.dispatch({
           type: 'REQUEST_SPIN'
         })
         res = await fn(...arg)
       } catch (error) {
         res = error
       } finally {
         window.__store__.dispatch({
           type: 'requestFinish'
         })
       }
       return res
     }
   }
   // 这是基于尝试一暴露出去的野生dispatch
   export const dispatchSipn = ({ type, payload }) => {
     window.__store__.dispatch({
       type: 'dispatchSipn',
       payload: {
         type,
         body: payload
       }
     })
   }
   
   // 用法
   export default function * watchLoadSaga() {
     yield takeLatest(actions.REQUEST_SPIN, requestWraper(asyncFunc)
   }
   ```

通过上面的展示，会发现用这种高阶函数包装的方法，也能够很快速的解决上述的场景。当然，用高阶函数灵活度还是不够，而且需要对每个方法进行包裹，所以还没有达到预期效果。所以我们只能鸡蛋里挑骨头，继续优化我们的代码了，这时候就轮到文章的主角登场了。

3. 尝试三，使用装饰器方案来替代高阶函数的方案

   ```js
   // requestWraper 和上面的一致
   @requestWraper()
   // Tips 因为js中函数存在变量提示的问题，所以装饰器只能在方法中使用
   toDoSaync ({ payload }) {
     try {
       // async to do
     } catch (err) {
       // error hint
     }
   }
   ```

   通过这个方案，是不是既实现了上面高阶函数的功能，又让代码显得更优雅了呢，并且，使用这种方式，也能解决页面中有多个loading的尴尬场景，就是利用对象，定义一个独享的key来做到分组件loading，当然，也可以通过这个例子做更进一步的拓展，比如实现截流防抖装饰器，还有其他就需要同学们自己去创新了。

   简单总结一下，通过上面的例子，可以简单的看出：***装饰器 = 高阶函数 + 函数嵌套 + 闭包***，因为装饰器本质上也是一个高阶函数，而且比高阶函数的写法更加简洁明了优雅且无侵入。

#### 2. node的RESTful API项目中的使用

通过上面loading例子，我们简单的了解了装饰器在项目中的作用，但是要求比较高的同学会说：那其实也没什么嘛，我用高阶函数也能做的到，而且改起来也不复杂。好的，那我们就带着这个问题，来看下面稍微复杂一点的node接口项目场景吧。

**项目说明**

利用node+koa2+typescript搭建的接口服务项目，通过以下四个点来举例来说明

**功能描述**

* jwt身份验证
* 请求参数验证
* 分模块路由
* 请求方式

##### 在使用装饰器之前的写法

1. 实现jwt校验中间件，因为身份校验是一个全局的校验，如果在每个请求中都写一次的话，那也太蠢了，所以直接通过实现一个koa请求中间件的方式来做身份校验

```js
public async request (ctx: ParameterizedContext, next: Function): Promise<void> {
    // 如果是接口的话，需要校验用户权限 判断请求路径是否是 localhost/api/xxxxxx
    const isApiRquest = ctx.request.url.split('/')[1] === 'api'
    const correctAuthorization = isApiRquest ? this.jwtVerify(ctx) : false
    if (isApiRquest && correctAuthorization) {
      // 处理用户请求参数
      const userParam = this.formatParams(ctx, correctAuthorization)
      // 校验用户请求参数
      const correctParam = await this.verifyParameters(userParam, ctx)
      // 参数校验通过，才到下一个中间件
      if (correctParam) await next()
    } else {
      // 不是接口请求，直接跳过此中间件
      if (!isApiRquest) await next()
    }
}
// 使用中间件，直接在全局应用一下，这样的话，就可以不用在没次请求中加上身份校验的校验，但是这也会有个问题，就是有些路由是不需要身份校验的，需要添加一个白名单。
app
  .use(requestMiddleware)
  .use(api.routes())
  .use(api.allowedMethods())
```

2. 请求方式和模块

```js
import Controller from '../controller/index';
const router = new Router();
router.post('/getList', Controller.getList);
// 请求方式 localhost[:port]/api/路由模块/getList
```

3. 请求参数校验 - 以一个列表get请求为例子

```js
// router.ts 需要先判断请求的参数
const {
  startTime,
  endTime,
  ...otherQuery
} = ctx.query;
const query = { ...ctx.query };
// 列表请求需要 开始时间-结束时间-分页数据-其他的查询参数（空值传参过滤）
const [options, skip, limit, result] = super.disposeGetListQuery(query);

// RequestControllerAbstract.ts 继承的抽象类
public disposeGetListQuery (query: GetListQuery): [object, number, number, object] {
  if (!query || typeof query !== 'object') {
    return;
  }
  const { startTime, endTime, pageSize, pageNum } = query;
  const num = Number(pageNum) || 1;
  const limit = Number(pageSize) || 20;
  const skip = (num - 1) * limit;
  const ignoreList = ['startTime', 'endTime', 'pageNum', 'pageSize'];
  // 吧其他参数包装起来-顺便过滤空值传参
  const options = {
    // 这边只做了个简单的空值过滤，实际场景中，还会有请求参数类型和格式还有值的要求，这边就不详细展开了
    ...filterNullValue(query, ignoreList)
  };
  if (startTime) {
    options['time'] = options.time || {};
    options['time']['$gte'] = Number(new Date(startTime));
  }
  if (endTime) {
    options['time'] = options.time || {};
    options['time']['$lte'] = Number(new Date(endTime));
  }
  // 定义返回数据
  const result: ListReturnData = {
    total: 0,
    pageSize: limit,
    pageNum: num,
    list: []
  };
  // 列表请求接口一般也要做好分页功能，所以这边直接把分页的内容返回过去
  return [options, skip, limit, result];
}
```

通过上面的代码可以看到，如果我需要处理这些公共的参数，那么我必须要入侵到代码里面，在业务代码中调用这些公用的方法，而且这边还没包含post请求的场景，因为get请求和post请求，传参的位置不一样，到时候就需要更多的代码来实现一个参数校验的功能。再一个就是不够灵活，如果传参内容有变化，那就需要在代码中进行改动，这样就导致我们会被这样的工作占据很多时间，不利于我们学习其他新知识（划水）或者代码优化（摸鱼）。所以呢，还需要对代码做进一步的改进，于是就引出了下面的代码。

##### 使用装饰器之后的写法

```js
// 路由
@Controller('/test') // 定义了是那个模块
class Test {
  @get('/getList/:id22') // 直接定义了接口名和参数
  @RequestHeaders(ReqHeaders) // 某些接口为了安全，会在header中一些隐私数据
  @RequestQuery(ReqQuery) // 校验请求参数
  @RequestQuery(ListReqParams) // 可以校验多个点（也可以在一个中传对象，这边写出来只是为了提升一下逼格）
  @Paging() //是否要分页
  @auth() // 请求这个接口是否需要校验身份
  async getList(ctx: ParameterizedContext, next: Function) {
    // 通过分页包装后，就可以直接在这边拿到分页参数了
    const result = {
      total: [total] 根据查询条件,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      list: [] // 通过数据库查询获取
    }
    super.handleRespose('success', ctx, result)
      }
    }
  }
}
// 请求方式 localhost[:port]/api/test/getList/111

// 补充一：如何实现授权装饰器
class Request {
  public auth() {
    return (target: any, name?: string, descriptor?: IDescriptor) => {
      if (typeof target === 'function' && name === undefined && descriptor === undefined) {
        // 装饰类
        target.prototype.baseAuthMidws = super.verifyAuthMiddleware;
      } else if (typeof target === 'object' && name && descriptor) {
        // 装饰类方法
        descriptor.value.prototype.baseAuthMidws = super.verifyAuthMiddleware;
      }
    }
  }
}
const request = new Request();
// 最终对外暴露的装饰器
export const auth = request.auth.apply(request);

// 补充二：如果动态导入路由
export default (dir: string = '../api', filePattern?: RegExp) => {
  // 根据规则，找到api/目录下的所有文件，把这些代码注册为路由文件
  util.exportFile(dir, filePattern);
  return rootRouter
}
// index.ts中
import decoratorRouter from './decorator/router'
const route = decoratorRouter();
app
  // .use(requestMiddleware) // 就不需要通过这种中间件的方式来处理权限校验了
  .use(route.routes())
  .use(route.allowedMethods())
```

可以看出，如果使用装饰器来实现功能的话，我们的代码就会变得更加灵活。业务和功能也会变得更加分离，在实现好功能代码之后，后续的开发就不需要在新路由中操心传参等功能性问题了，让我们的代码更加优质的服务于业务开发。也能够让功能和业务的逻辑更加清晰，提高我们的开发效率。

好了，通过这两个例子，大家应该能体会到装饰器在我们实际项目中的妙用了，那既然我们已经会用了，那我们不禁会想：

* 装饰器是怎么工作的？
* 为什么能实现这么花里胡哨的效果？

### 五、浅析装饰器原理

知其然，顺便知其所以然。当我们学会使用装饰器之后，我们如果要用的更好，那势必要去了解一下装饰器的基本工作原理，接下来咱们就一起来简单看看它的实现源码。

#### decorate.js：

```js
// 通过这边可以看出来，decorator其实是一个语法糖，作用于对象的属性时，实质利用了Object.defineProperty方法，这边也就能解释 三-2中的问题了

// descriptor-属性描述符。对象里目前存在的属性描述符有两种主要形式：数据描述符和存取描述符。数据描述符是一个具有值的属性，该值可能是可写的，也可能不是可写的。存取描述符是由 getter-setter 函数对描述的属性
// 
function handleDescriptor(target, key, descriptor, [decorator, ...args]) {
  // 结构属性描述符descriptor 通常用来改变默认的属性访问
  const { configurable, enumerable, writable } = descriptor;
  // 接收原本的get/set方法和值
  const originalGet = descriptor.get;
  const originalSet = descriptor.set;
  const originalValue = descriptor.value;
  const isGetter = !!originalGet;
  return {
    configurable,
    enumerable,
    get() {
      // 对函数进行装饰，也可以认为是包装，本质上就是在原来函数/类的基础上，植入了装饰器的代码
      const fn = isGetter ? originalGet.call(this) : originalValue;
      const value = decorator.call(this, fn, ...args);
      if (isGetter) {
        return value;
      } else {
        const desc = {
          configurable,
          enumerable
        };
        desc.value = value;
        desc.writable = writable;
        // es7装饰器的本质
        Object.defineProperty(this, key, desc);
        return value;
      }
    },
    set: isGetter ? originalSet : createDefaultSetter()
  };
}
export default function decorate(...args) {
  return _decorate(handleDescriptor, args);
}
```

通过上面的代码，就会发现我们用装饰器的时候就相当于给把代码再裹上一层外套，最后裹的一层一层像个洋葱，即koa2中的洋葱模型，这样就会导致三-2中输出顺序的问题了。看完上面的代码之后，接下来再一起看下 createDefaultSetter方法和_decorate方法：

```js
// createDefaultSetter 重置set方法
function createDefaultSetter(key) {
  return function set(newValue) {
    Object.defineProperty(this, key, {
      configurable: true, // 设置该属性可配置，避免封闭
      writable: true, // 设置为可写
      enumerable: true, // 设置为可被
      value: newValue
    });

    return newValue;
  };
}
```

其实createDefaultSetter就是在属性没有set的情况，创造一个set方法。而_decorate做的也是相似，类/方法本身是不支持装饰器的，通过这个把属性描述符包装进去，实现装饰器效果。

```js
// _decorate
function _decorate(handleDescriptor, entryArgs) {
  if (isDescriptor(entryArgs[entryArgs.length - 1])) {
    return handleDescriptor(...entryArgs, []);
  } else {
    return function () {
      return handleDescriptor(...Array.prototype.slice.call(arguments), entryArgs);
    };
  }
}
```

看完_decorate之后，再来看下它是怎么判断的

```js
export function isDescriptor(desc) {
  if (!desc || !desc.hasOwnProperty) {
    return false;
  }
  const keys = ['value', 'initializer', 'get', 'set'];
  for (let i = 0, l = keys.length; i < l; i++) {
    if (desc.hasOwnProperty(keys[i])) {
      return true;
    }
  }
  return false;
}
```

看完isDescriptor是不是知道了，原来它判断的代码，是不是有种俺也能写的感觉呢，哈哈哈哈，不过虽然我们都能写，但并不一定都能想到要怎么写，很多时候编程还是由思维来主导的。

#### applyDecorators

源码中是这么定义的 Helper to apply decorators to a class without transpiler support

译为：在不支持转换的情况下在class中使用装饰器

```js
const { defineProperty, getOwnPropertyDescriptor } = Object;
export default function applyDecorators(Class, props) {
  const { prototype } = Class;
  for (const key in props) {
    const decorators = props[key];
    for (let i = 0, l = decorators.length; i < l; i++) {
      const decorator = decorators[i];
      // 利用js原型链的特性来实现效果
      defineProperty(prototype, key,
        decorator(
          prototype,
          key, 
          getOwnPropertyDescriptor(prototype, key)
        )
      ); 
    }
  }
  return Class;
}
```

限于本人的技术水平，源码分析到这边就结束了。其实装饰器是一个很大的体系，还可以挖掘的点有很多，比如说属性描述符descriptor，有兴趣的小伙伴可以再继续深入了解。

### 六、结束语

*因为个人技术水平有限，所以文中可能会有些错误，欢迎各位大佬批评指正*

当我们学习一段新知识的时候，需要先在我们思维上构建一个“认知概念”，我们会先尝试去认识、了解并且使用它，然后掌握基本操作和使用，然后深入了解，最后创新和改良。因为技术有限，所以这篇文章讲到掌握基本使用方法，后续待使用得更加深入之后，再做进一步的分享吧。

矫情一句：一如编程深似海，从此飘柔是路人～～～

最后，送给大家一个表情包以做结尾

<img src="/Users/wuqingfu/Library/Application Support/typora-user-images/image-20200415235135048.png" alt="image-20200415235135048" style="zoom:50%;" />