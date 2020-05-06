# 一个前端渣渣的node开发体验

## 前言

​		因为最近打算自己搭建一个自己的博客系统，用来记录日常的学习和提升一下写作水平，所以能就打算自己搭建一下前后端项目。在网上找了下，也没有找到合适（现成）的项目，所以就打算自己动手来搭建一下。这篇文章主要描述如何搭建一个node的API接口服务。

## 技术栈简述

网上的node框架也挺多的，用的较多的有egg，express，koa等框架，框架间各有利弊，最后均衡下来，还是决定使用可拓展性比较强的koa2来搭建项目，加上最近在学习typescript，最后决定使用的技术栈就是 koa+typescript+mysql+mongodb来搭建项目。

### 为什么要用node

最主要的一点是其他语言咱也不会啊。。。

<img src="http://www.rsdown.cn/d/file/p/2017-04-03/024f9cb50d32b645dd7fef8be68acbf3.jpg" alt="无奈表情包" style="zoom:75%;" />

言归正传，Node.js是一个运行在服务端的框架，它底层使用的是V8引擎，它的速度非常快，并且作为一个前端的后端服务语言，还有其他吸引人的地方：

1. 异步I/O

   因为node都是I/O都是异步的，所以能很好的处理高并发场景

2. 事件驱动

3. 单线程

4. 跨平台

而且，最最最最重要的一点就是，node是由JavaScript开发的，极大的降低了前端同学的学习成本。

### Koa

​		koa是Express的原班人马打造的一个新的框架。相对于express来说koa更小，更有表现力更加健壮。当然，前面说的都是虚的，其实真正吸引我的是koa通过es6的写法，利用async函数，解决了express.js中地狱回调的问题，并且koa不像express一样自带那么多中间件，对于一个私有项目来说，无疑是极好的，还有一个特点就是koa独特的中间件流程控制，也就是大家津津乐道的koa洋葱模型。

关于洋葱模型，大概归纳起来就是两点

1. context的保存和传递
2. 中间件的管理和next的实现

![clipboard.png](https://segmentfault.com/img/bV6DZG?w=478&h=435)

​																（图片来源于网络）

![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy9NcHQ4NkVHamxwdTFsMXVDaWJsV3p4dmd1R3loUHp4V3k4REtKOGE3aWF1VVR6WG03QjduYllrNVJTNmFpYUdrbHN2MFZRQW5xOEd2R0F6OTFMelBXUk5hUS82NDA?x-oss-process=image/format,png)

上面两张图很清晰的展示了洋葱模型的工作流程，当然，具体的原理实现的话与本篇无关，就不在深入描述了，有兴趣的同学可以自己到网上搜一下哈。

### Typescript

网上特别多关于“为什么要用Typescript开发”，“Typescript开发的好处和坏处”，“为什么不用Typescript开发”等等的争论和文章，有兴趣的同学也可以去说道说道哈。

本次项目用ts主要是出于以下几点考虑：

* 本人在持续的学习ts中，“纸上得来终觉浅，绝知此事要躬行”，需要更多的ts实战才能加深对ts的了解
* 自己的项目，想用什么就用什么
* 写起来逼格会相对高一些
* Ts有诸多js中没有的东西，譬如泛型接口抽象等等
* 良好的模块管理
* 强类型语音,个人感觉比js开发服务端项目更合适
* 有良好的错误提示机制,可以避免很多开发阶段的低级错误
* 约束开发习惯，使得代码更优雅规范

最后记住一点，适合自己的才是最好的

### Mysql

MySQL 是最流行的关系型数据库管理系统，在 WEB 应用方面 MySQL 是最好的 RDBMS(Relational Database Management System：关系数据库管理系统)应用软件之一

### Mongodb

为什么用了mysql还要用mongodb呢？其实主要是因为使用的是jwt来做一个身份认证，由于用到中间件没有提供刷新过期时间的API，而又想要实现一个自动续命的功能，所以使用mongodb来辅助完成自动续命的功能。并且，一些用户身份信息或埋点信息可以存在mongo中

### PM2

PM2是node进程管理工具，可以利用它来简化很多node应用管理的繁琐任务，如性能监控、自动重启、负载均衡等，而且使用非常简单

## 项目搭建

我主要把项目分为：框架，日志，配置，路由，请求逻辑处理，数据模型化这几个模块

以下是一个项目的目录结构：

```bash
  ├── app                         编译后项目文件
  ├── node_modules                依赖包
  ├── static                      静态资源文件
  ├── logs                      	服务日志
  ├── src                         源码
  │   ├── abstract                    抽象类
  │   ├── config                      配置项
  │   ├── controller                  控制器
  │   ├── database                    数据库模块
  │   ├── middleware                  中间件模块
  │   ├── models                  		数据库表模型
  │   ├── router                      路由模块 - 接口
  │   ├── utils                       工具
  │   ├── app.ts                  koa2入口
  ├── .eslintrc.js                eslint 配置
  ├── .gitignore                  忽略提交到git目录文件
  ├── .prettierrc                 代码美化
  ├── ecosystem.config.js         pm2 配置
  ├── nodemon.json                nodemon 配置
  ├── package.json                依赖包及配置信息文件
  ├── tsconfig.json               typescript 配置
  ├── README.md                   描述文件
```



话不多说，接下来跟着代码来看项目

### 创建一个koa应用

俗话说的好：人无头不走。项目中也会有个牵着项目走的头，这就是入口app.ts，接下来咱就结合代码看看它是怎么做这个头的

```js
import Koa, { ParameterizedContext } from 'koa'
import logger from 'koa-logger'
// 实例化koa
const app = new Koa()
app.use(logger())
// 答应一下响应信息
app.use(async (ctx, next) => {
  const start = (new Date()).getDate();
  let timer: number
  try {
    await next()
    timer = (new Date()).getDate()
    const ms = timer - start
    console.log(`method: ${ctx.method}, url:${ctx.url} - ${ms}ms`)
  } catch (e) {
    timer = (new Date()).getDate()
    const ms = timer - start
    console.log(`method: ${ctx.method}, url:${ctx.url} - ${ms}ms`)
  }
})
// 监听端口并启动
app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT || 3000}`)
})
app.on('error', (error: Error, ctx: ParameterizedContext) => {
  // 项目启动错误
  ctx.body = error;
})
export default app
```

到了这一步，我们就已经可以启动一个简单的项目了

1. <code>npm run tsc</code> 编译ts文件
2. <code>node app.js</code> 启动项目

接下来在浏览器输入http://localhost:3000就能在控制台看到访问日志了。当然，做到这一步还是不够的，因为我们开发过程中总是伴随着调试，所以需要更方便的开发环境。

### 本地开发环境

本地开发使用nodemon来实现自动重启，因为node不能直接识别ts，所以需要用ts-node来运行ts文件。

```json
// nodemon.json
{
  "ext": "ts",
  "watch": [ // 需要监听变化的文件
    "src/**/*.ts",
    "config/**/*.ts",
    "router/**/*.ts",
    "public/**/*",
    "view/**/*"
  ],
  "exec": "ts-node --project tsconfig.json src/app.ts" // 使用ts-node来执行ts文件
}
// package.json
"scripts": {
  "start": "cross-env NODE_ENV=development nodemon -x"
}
```

#### 本地调试

因为有的时候需要看到请求的信息，那我们又不能在代码中添加<code>console.log(日志)</code>这样效率低又不方便，所以我们需要借助编辑器来帮我们实现debug的功能。这边简单描述一下怎么用vscode来实现debug的。

* ***tsconfig.json中开启sourceMap***
* 为ts-node注册一个vsc的debug任务，修改项目的launch.json文件，添加一个新的启动方式
* launch.json

```json
{
  "name": "Current TS File",
  "type": "node",
  "request": "launch",
  "args": [
    "${workspaceRoot}/src/app.ts" // 入口文件
  ],
  "runtimeArgs": [
    "--nolazy",
    "-r",
    "ts-node/register"
  ],
  "sourceMaps": true,
  "cwd": "${workspaceRoot}",
  "protocol": "inspector",
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

* F9 代码中断点
* F5 开始调试代码

### 引入接口路由

上面我们已经创建了一个koa应用了，接下来就使用需要引入路由了：

```js
// app.ts
import router from './router'
import requestMiddleware from './middleware/request'
app
  .use(requestMiddleware) // 使用路由中间件处理路由，一些处理接口的公用方法
  .use(router.routes())
  .use(router.allowedMethods())

// router/index.ts
import { ParameterizedContext } from 'koa'
import Router from 'koa-router'
const router = new Router()
// 接口文档 - 这边使用分模块实现路由的方式
router.use(路由模块.routes())
...
router.use(路由模块.routes())
// 测试路由连接
router.get('/test-connect', async (ctx: ParameterizedContext) => {
  await ctx.body = 'Hello Frivolous'
})
// 匹配其他未定义路由
router.get('*', async (ctx: ParameterizedContext) => {
  await ctx.render('error')
})
export default router
```

### 定义数据库模型

1. 使用sequlize作为mysql的中间件

```js
// 实例化sequelize
import { Sequelize } from 'sequelize'
const sequelizeManager = new Sequelize(db, user, pwd, Utils.mergeDefaults({
    dialect: 'mysql',
    host: host,
    port: port,
    define: {
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      freezeTableName: true,
      timestamps: true,
    },
    logging: false,
  }, options));
}
// 定义表结构
import { Model, ModelAttributes, DataTypes } from 'sequelize'
// 定义用户表模型中的字段属性
const UserModel: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    comment: 'id'
  },
  avatar: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nick_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  mobile: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING(35),
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}
// 定义表模型
sequelizeManager.define(modelName, UserModel, {
  freezeTableName: true, // model对应的表名将与model名相同
  tableName: modelName,
  timestamps: true,
  underscored: true,
  paranoid: true,
  charset: "utf8",
  collate: "utf8_general_ci",
})
```

根据上面的代码，我们就已经定义好一个user表了，其他表也可以按照这个来定义。不过这个项目除了使用mysql，也还有用到mongo，接下来看看mongodb怎么用

2. 使用mongoose作为mongodb的中间件

```js
// mongoose入口
import mongoose from 'mongoose'
const uri = `mongodb://${DB.host}:${DB.port}`
mongoose.connect('mongodb://' + DB_STR)
mongoose.connection.on('connected', () => {
  log('Mongoose connection success')
})
mongoose.connection.on('error', (err: Error) => {
  log('Mongoose connection error: ' + err.message)
})
mongoose.connection.on('disconnected', () => {
  log('Mongoose connection disconnected')
})
export default mongoose

// 定义表模型
import mongoose from '../database/mongoose'
const { Schema } = mongoose
const AccSchema = new Schema({}, {
  strict: false, // 允许传入未定义字段
  timestamps: true, // 默认会带上createTime/updateTime
  versionKey: false // 默认不带版本号
})
export default AccSchema

// 定义模型
mongoose.model('AccLog', AccSchema)
```

### 实现接口

好了，上面我们已经定义好表模型了，接下来就是激动人心的接口实现了。我们通过一个简单的埋点接口来实现一下，首先需要分析埋点工具实现的逻辑：

1. 因为埋点信息都是非关系型的，所以使用mongodb来存储埋点信息
2. 因为这个就是一个单纯的记录接口，所以需要设计的比较通用 - 即除了关键几个字段，调用方传什么就保存什么
3. 埋点行为对用户来说是无感知的，所以不设计反馈信息，如果埋点出错也是由内部处理

好了，了解这个埋点的功能之后，就开始来实现这个简单的接口了：

```js
// route.ts 定义一个addAccLog的接口
router.post('/addAccLog', AccLogController.addAccLog)
// AccLogController.ts 实现addAccLog接口
class AccLogRoute extends RequestControllerAbstract {
  constructor() {
    super()
  }
  // AccLogController.ts
  public async addAccLog(ctx: ParameterizedContext): Promise<void> {
    try {
      const data = ctx.request.body
      const store = Mongoose.model(tableName, AccSchema, tableName)
      // disposeAccInsertData 方法用来处理日志信息，有些字段嵌套太要扁平化深或者去除空值冗余字段
      const info = super.disposeAccInsertData(data.logInfo)
      // 添加日志
      const res = await store.create(info)
      // 不需要反馈
      // super.handleResponse('success', ctx, res)
    } catch (e) {
      // 错误处理 - 比如说打个点，记录埋点出错的信息，看看是什么原因导致出错的（根据实际的需求来做）
      // ...
    }
  }
  // ...
}
export default new AccLogRoute()
```

说到这边，不得不提一句哈，就是路由可以引入装饰器写法，这样能减少重复工作和提高效率，有兴趣的同学可以看我上一篇博客哈。这边贴一下装饰器写法的代码：

```js
@Controller('/AccLogController')
class AccLogRoute {
  @post('/addAccLog')
  @RequestBody({}) 
  async addAccLog(ctx: ParameterizedContext, next: Function) {
    const res = await store.create(info)
    handleResponse('success', ctx, res)
  }
}
```

这一对比，是不是看出装饰器的好处了呢。

### jwt身份验证

这边使用jsonwebtoken来做jwt校验

```js
import { sign, decode, verify } from 'jsonwebtoken'
import { ParameterizedContext } from 'koa'
import { sign, decode, verify } from 'jsonwebtoken'
import uuid from 'node-uuid'

import IController from '../interface/controller'
import config from '../config'
import rsaUtil from '../util/rsaUtil'
import cacheUtil from '../util/cacheUtil'

interface ICode {
  success: string,
  unknown: string,
  error: string,
  authorization: string,
}

interface IPayload {
  iss: number | string; // 用户id
  login_id: number | string; // 登录日志id
  sub?: string;
  aud?: string;
  nbf?: string;
  jti?: string;
  [key: string]: any;
}

abstract class AController implements IController {
  // 服务器响应状态
  // code 状态码参考 https://www.cnblogs.com/zqsb/p/11212362.html
  static STATE = {
    success: { code: 200, message: '操作成功！' },
    unknown: { code: -100, message: '未知错误！' },
    error: { code: 400, message: '操作失败！' },
    authorization: { code: 401, message: '身份认证失败！' },
  }

  /**
   * @description 响应事件
   * @param {keyof ICode} type
   * @param {ParameterizedContext} [ctx]
   * @param {*} [data]
   * @param {string} [message]
   * @returns {object}
   */
  public handleResponse(
    type: keyof ICode,
    ctx?: ParameterizedContext,
    data?: any,
    message?: string
  ): object {
    const res = AController.STATE[type]
    const result = {
      message: message || res.message,
      code: res.code,
      data: data || null,
    }
    if (ctx) ctx.body = result
    return result
  }
  /**
   * @description 注册token
   * @param {IPayload} payload
   * @returns {string}
   */
  public jwtSign(payload: IPayload): string {
    const { TOKENEXPIRESTIME, JWTSECRET, RSA_PUBLIC_KEY } = config.JWT_CONFIG
    const noncestr = uuid.v1()
    const iss = payload.iss
    // jwt创建Token
    const token = sign({
      ...payload,
      noncestr
    }, JWTSECRET, { expiresIn: TOKENEXPIRESTIME, algorithm: "HS256" })
    // 加密Token
    const result = rsaUtil.pubEncrypt(RSA_PUBLIC_KEY, token)
    const isSave = cacheUtil.set(`${iss}`, noncestr, TOKENEXPIRESTIME * 1000)
    if (!isSave) {
      throw new Error('Save authorization noncestr error')
    }
    return `Bearer ${result}`
  }
  /**
   * @description 验证Token有效性，中间件
   * 
   */
  public async verifyAuthMiddleware(ctx: ParameterizedContext, next: Function): Promise<any> {
    // 校验token
    const { JWTSECRET, RSA_PRIVATE_KEY, IS_AUTH, IS_NONCESTR } = config.JWT_CONFIG
    if (!IS_AUTH && process.env.NODE_ENV === 'development') {
      await next()
    } else {
      // 如果header中没有身份认证字段，则认为校验失败
      if (!ctx.header || !ctx.header.authorization) {
        ctx.response.status = 401
        return
      }
      // 获取token并且解析，判断token是否一致
      const authorization: string = ctx.header.authorization;
      const scheme = authorization.substr(0, 6)
      const credentials = authorization.substring(7)
      if (scheme !== 'Bearer') {
        ctx.response.status = 401;
        this.handleResponse('authorization', ctx, null, 'Wrong authorization prefix')
        return;
      }
      if (!credentials) {
        ctx.response.status = 401;
        this.handleResponse('authorization', ctx, null, 'Request header authorization cannot be empty')
        return;
      }

      const token = rsaUtil.priDecrypt(RSA_PRIVATE_KEY, credentials)
      if (typeof token === 'object') {
        ctx.response.status = 401;
        this.handleResponse('authorization', ctx, null, 'authorization is not an object')
        return;
      }
      const isAuth = verify(token, JWTSECRET)
      if (!isAuth) {
        ctx.response.status = 401;
        this.handleResponse('authorization', ctx, null, 'authorization token expired')
        return;
      }
      const decoded: string | { [key: string]: any } | null = decode(token)
      if (typeof decoded !== 'object' || !decoded) {
        ctx.response.status = 401;
        this.handleResponse('authorization', ctx, null, 'authorization parsing failed')
        return;
      }
      const noncestr = decoded.noncestr
      const exp = decoded.exp
      const iss = decoded.iss
      const cacheNoncestr = cacheUtil.get(`${iss}`)
      if (IS_NONCESTR && noncestr !== cacheNoncestr) {
        ctx.response.status = 401;
        this.handleResponse('authorization', ctx, null, 'authorization signature "noncestr" error')
        return;
      }
      if (Date.now() / 1000 - exp < 60) {
        const options = { ...decoded };
        Reflect.deleteProperty(options, 'exp')
        Reflect.deleteProperty(options, 'iat')
        Reflect.deleteProperty(options, 'nbf')
        const newToken = AController.prototype.jwtSign(options as IPayload)
        ctx.append('token', newToken)
      }
      ctx.jwtData = decoded
      await next()
    }
  }
}
export default AController
//  授权装饰器代码
public auth() {
  return (target: any, name?: string, descriptor?: IDescriptor) => {
    if (typeof target === 'function' && name === undefined && descriptor === undefined) {
      target.prototype.baseAuthMidws = super.verifyAuthMiddleware;
    } else if (typeof target === 'object' && name && descriptor) {
      descriptor.value.prototype.baseAuthMidws = super.verifyAuthMiddleware;
    }
  }
}
```

这样，我们就完成了一个jwt授权的模块了，我们用也很简单，以addAccLog接口为例

```js
class AccLogRoute {
  @auth() // 只要➕这一行代码就可以
  @post('/addAccLog')
 	...
}
```

### 接口文档

既然我们已经写好接口了，那总要有一份可参阅的文档输出，这时候就想到了swagger，接下来咱们就把swagger引入到我们的项目中吧。

* 入口

```js
// swagger入口
import swaggerJSDoc from 'swagger-jsdoc'
import config from '../config'
const { OPEN_API_DOC } = config
// swagger definition
const swaggerDefinition = {
  // ...
}
const createDOC = (): object => {
  const options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./src/controller/*.ts']
  }
  return OPEN_API_DOC ? swaggerJSDoc(options) : null
}
export default createDOC
// 怎么
```

* 配置示例 - 这边一定要注意格式

```json
 @swagger Tips: 必须要声明,不然代码不会把此处生成为文档
 definitions:
   Login: // 接口名
     required: // 必填参数
       - username
       - password
     properties: // 可选参数
       username:
         type: string
       password:
         type: string
       path:
         type: string

```

* [swagger官方配置工具](https://editor.swagger.io/?_ga=2.216483614.98429752.1585213291-978523996.1584940904)
* 推荐一个vscode插件 - facility插件，用来快速生成注释

### Mock数据

使用mock来生成测试数据

### 日志

日志模块本来打算是用log4.js来做的，后来感觉做的日志模块还没达到预期，所以就决定先暂时用pm2的日志系统来代替log4。这边就先不贴log4相关的代码了

### 部署

使用pm2来部署项目,这边展示一下配置文件

Tips

* error_file 错误日志输出
* out_file 正常日志输出
* script 入口文件 - 以打包过后的js文件作为入口

```js
// pm2.json
{
  "apps": {
    "name": "xxx",
    "script": "./app/server.js",
    "cwd": "./",
    "args": "",
    "interpreter_args": "",
    "watch": true,
    "ignore_watch": [
      "node_modules",
      "logs",
      "app/lib"
    ],
    "exec_mode": "fork_mode",
    "instances": 1,
    "max_memory_restart": 8,
    "error_file": "./logs/pm2-err.log",
    "out_file": "./logs/pm2-out.log",
    "merge_logs": true,
    "log_date_format": "YYYY-MM-DD HH:mm:ss",
    "max_restarts": 30,
    "autorestart": true,
    "cron_restart": "",
    "restart_delay": 60,
    "env": {
      "NODE_ENV": "production"
    }
  }
}

// package.json
"scripts": {
  // 生产环
  "prod": "pm2 start pm2.json"
}
```

配置好pm2之后，我们只要在package.json中配置<code>pm2 start pm2.json</code>就可以实现启动pm2进程了

## 结束语

虽然是一个简单的接口服务器，但是需要考虑的东西也是很多，而且因为很多插件都是第一次接触，所以整个项目实现的过程还是蛮坎坷的，基本上是那种摸石头过河。不过痛并快乐着吧，虽然困难很多，但是过程中也学到了不少新的知识点，大概了解了一个简单的后端服务项目所承载的重量。

