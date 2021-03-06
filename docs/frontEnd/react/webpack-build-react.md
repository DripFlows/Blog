## 引言

最近开始做自己的博客站，因为是自己的项目不赶进度不赶时间，也不需要做的多花哨，所以就不打算用网上那些现成的优秀构建工具来启项目，而是自己从webpack+react开始来搭建一个简陋的伪工程化前端项目，顺便也多了解一点webpack，然后再实际开发中在一点一点摸索和完善项目

![别跑](http://www.phplaozhang.com/uploads/layedit/20170622/960a6050ece1854caf016b6b04856d32.jpg)

## webpack

聊起webpack，就不得不说起前端的工程化。随着JavaScript的不断做大做强，前端做的不仅仅是一些页面展示和页面特效，而是有了越来越多的用户交互和用户体验方面的优化，并且一些业务场景也能从后端解放出来转而倾向前端。前端工程师们要面对的不再是简简单单的网站，而是更为复杂的 web 应用，这意味着前端项目构建必须要往更加系统化的工程的方向去构建。

想起开始学前端的时候，就简单的一个页面一个文件搞定+html/css/js全部写在一起，毫无疑问这样开发效率很低而且会做很多多余且重复的工作，所以就需要把把前端项目当成一项系统工程进行分析、组织、构建，在开发层面做的更加的组件化、模块化、规范化等，使得项目结构清晰、减少冗余工作量和提高工作效率。

> 实际上前端工程化还涉及到构建/部署/测试/自动化/性能/稳定性/可用性/可维护性，还包括里面的一些部署/发布/CI/CD/灰度等概念可不是一两句话就能说清的

基于上述背景，前端诞生了一系列的譬如Grunt / Gulp / Webpack / Rollup等等等等优秀的前端构建打包模块化工具，每种工具各有适用场景和不如其他工具擅长的功能，这边能就不再展开描述了，这篇文章主要讲述结合webpack构建前端项目的思路以及一些常见的优化点

**摘一下webpack的概念**

> 本质上，*webpack* 是一个现代 JavaScript 应用程序的*静态模块打包器(module bundler)*。当 webpack 处理应用程序时，它会递归地构建一个*依赖关系图(dependency graph)*，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 *bundle*。

**再偷一下webpack的图**

![image-20200511230228015](/Users/wuqingfu/Library/Application Support/typora-user-images/image-20200511230228015.png)

上面的概念和图足以传达webpack的思想和作用了，总结来说就一句话：前端工程中，咱只管开发就成了，构建神马的全一股脑儿交给webpack。

网上特别多关于从0开始手把手教操作搭建项目的优秀文章，这篇文章也是借鉴了大佬文章来学习使用webpack===>[webpack 搭建简单 React 项目](https://juejin.im/post/5eb79fbb5188256b246a1308)，所以这边也直接掠过本人粗浅的webpack理解篇幅，直接进入构建过程

## 构建项目

俗话说，没有规矩不成方圆，每做一个项目之前，都需要先想好这个工程的初衷、预期以及可能出现的不可抗力因素（比如说那天突然不想继续写了...）。所以在初始化项目之前，需要对这个项目做一个简单的规划，以便于后续的开发迭代和维护

**项目结构**

```bash
├── dist                        编译后项目文件
├── node_modules                依赖包
├── public                      静态资源文件
├── script                      构建文件
│   ├── analyzer.js               分析包大小    
│   ├── build.js                  打包    
│   ├── dll.js                    抽离公共的依赖    
│   ├── start.js                  开发环境启动    
│   ├── webpack.base.config.js    webpack基础配置    
├── src                         源码
│   ├── pages                     页面组件
│   ├── ...												其它
│   ├── index.tsx                 入口文件
├── .babelrc                    babel 配置
├── .eslintrc.js                eslint 配置
├── .gitignore                  忽略提交到git目录文件
├── .prettierrc                 代码美化
├── package.json                依赖包及配置信息文件
├── tsconfig.json               typescript 配置
├── README.md                   描述文件
```

因为本篇讲的侧重点是理论，所以对源码讲的比较少。所以这边简单描述一下script下的各个文件：

* webpack.base.config.js

  这是一个基础的webpack文件，配置了包括入口、输出、解析模块、代码压缩去重、拆包提取、html模版等基本配置。为什么会需要抽出来，主要出于两点来考量

  1. 抽离公共代码，使得代码更加简洁明了
  2. 保证开发和生产环境尽量一致，避免一些因为环境差异带来的无意义问题

* start.js

  项目开发环境启动的入口，这边聚合了基础配置和开发时的配置，譬如devServer/HMR等开发环境配置项

  ```js
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
  ```

* build

  项目打包构建入口，除了基本配置，还包括一些构建性能监控代码等。譬如使用HappyPack来加快打包速度：

  ```js
  new HappyPack({
    threads,
    id: 'jsx',
    loaders: ['babel-loader']
  }),
  ```

* dll.js

  抽离第三方模块,减少构建体积

* analyzer.js

  打包构建完成之后，需要对包的拆分大小等做个详细的分析，有利于对拆包和代码结构调整做进一步的优化

### 一、技术栈

前端技术选型基本绕不开三大框架react/vue/angular，每个框架都有适用和不适用的场景，还有框架带来的生态系统、学习成本、稳定性和配合基础构建的能力等等等等一系列等考量。

因为是个人项目所以就直接考虑用typescript+react全家桶开发了,配置也是比较简单

```js
// babel编译 .babelrc配置
{
  test: /.jsx?$/,
  exclude: /(node_modules|bower_components)/,
  loader: 'babel-loader'
},
// 使用typescript
{
  test: /\.(ts|tsx)$/,
  exclude: /node_modules/,
  use: {
  	loader: 'ts-loader',
  },
}
 
// .babelrc
{
  "presets": [
    "@babel/react",
    "@babel/preset-env"
  ],
  "plugins": [
    "@babel/transform-runtime"
  ]
}
```

### 二、兼容性

前端项目绕不开的一个点就是兼容性的问题了，前端兼容性问题主要有两个策略

* 渐进增强

  渐进增强保证低版本浏览器的体验，对于支持新特性的新浏览器提供稍好的体验

* 优雅降级

  优雅降级则是相反的，为现代浏览器提供最好的体验，而旧浏览器则退而求之次，保证大概的功能

这边选用的是优雅降级的策略（因为实际上就没想过低版本浏览器的兼容=.=）

### 三、 编码规范

项目的编码规范也是老生常谈的话题了，良好的编码习惯利于长期维护项目，提高开发效率和代码质量，减少遗留系统维护的负担，可以少背因为垃圾代码而带来的技术债。

网上常用且推荐使用的都是eslint来约束代码规范，再用Prettier来美化，最后用husky来限制提交

不过因为本人对自己的编码风格有足够的自信，所以这次项目就一个都没用

![膨胀的很](http://biaoqingbao.xin/wp-content/uploads/2017/10/1685.jpg)

### 四、前端监控和优化

一个成熟的网站，必然有配套有成熟的监控系统来支撑。而好的监控系统不仅能帮我做到网站的pv/uv/用户习惯/用户行为等分析统计，更有及时发现系/处理统异常，排查错误，避免严重的生产故障的能力。

虽然是个人的咸鱼站点，但是梦想还是要有的，考虑到本人以后可能会火，所以防患于未然到网上一些监控统计系统。找了一圈要么就是要花钱（口袋空空，没有预算），要么就是没找到符合预期效果的，所以就自己写了几个埋点接口（[参照上期文章中的接口实现部分](https://juejin.im/post/5eb3e1b4e51d45244e7c2d09)），聊胜于无吧，仅用于监控异常和统计分析，方便于后续系统的持续优化

### 四、本项目中不重要的一些规范

还有很多对于团队项目来说很重要的规范，但是因为这个项目是个人项目，所以这边就简单提一下：

1. 代码分支管理
2. 流程规范
3. 协作规范
4. 合理明确分工
5. 发布构建流程
6. 代码质量规范
7. 代码风格规范
8. 代码提炼/复盘
9. 测试规范
10. 持续维护计划
11. 文档规范
13. ...

### 五、一些优化点

#### 动态引入

对于一些公共的模块，譬如路由或者redux等，可以通过webpack的require.context模块来动态引入

1. 动态导入路由

   ```js
   let RouteMap = []
   // 白名单
   const WHITE_LIST = ['login']
   // NOTE: 默认不考虑路由传参的情况[xxx/:id],这种场景还没想好用什么方式来解决
   // 动态读取pages下的所有目录，把每个目录都当成一个路由
   const files = require.context('./pages', true, /\/index\.jsx$/)
   files.keys().forEach(key => {
     // const pattern = /(?<=\/).+(?=\/)/
     const pattern = /\.\/(.+)\/(\w+)\.jsx?$/
     const route = key.match(pattern)[1]
     // 白名单路由跳过
     if (!WHITE_LIST.includes(route)) {
       RouteMap.push({
         path: route,
         component: files(key).default
       })
     }
   })
   
   const LayoutRoute = (props) => (
     <Layout {...props}>
       <Switch>
         { RouteMap.map(({path, component}) => <Route key={path} exact path={`/app/${path}`} component={component} />) }
       </Switch>
     </Layout>
   )
   ```

   这样，就不需要每次都要引入一个路由文件，把路由文件映射到对应的路由上了，只要规则定的多，定的好，甚至连配置路由文件那一步都可以通过这种方式来实现。

2. 动态注册redux模块

   ```js
   // 自动注册reducer模块
   let rootReducer = {}
   const reducersFiles = require.context('./reducers', false, /\.js$/)
   reducersFiles.keys().map(filename => {
     // const pattern = /(?<=\.\/).+(?=\.js)/ 新语法，部分浏览器还不支持
     const pattern = /\/(\w+)\.jsx?$/
     try {
       const matchRes = filename.match(pattern)
       const key = matchRes[1]
       rootReducer[key] = reducersFiles(filename).default
     } catch (e) {
       console.log('无法注册', e)
     }
   })
   
   // 自动注册saga模块
   let rootSagaList = []
   const sagaFiles = require.context('./sagas', false, /\.js/)
   sagaFiles.keys().map(filename => {
     rootSagaList.push(fork(sagaFiles(filename).default))
   })
   ```

通过require.context，就能够省掉很多无用且重复的代码，至少不需要再一个个模块文件的导入了，后续可以学一下dva思路，再进行一层包装，当然这是后话了。

#### babel 优化

因为浏览器之间的兼容性问题还有浏览器实现w3c规范的时间差异，为了避免我们用的api在浏览器上还没实现，所以一般前端项目都会引入babel做一个编译。引入这边编译工具，也需要能够对项目结构进行一些简单的优化

1. 排除 node_modules/bower_components 编译， exclude: /(node_modules|bower_components)/

   ```js
   // webpack.base.config.js
   {
     test: /.jsx?$/,
     exclude: /(node_modules|bower_components)/,
     loader: 'babel-loader'
   }
   ```

2. 使用@babel/transform-runtime抽出公共模块，减小代码体积

   ```js
   // .babelrc
   "plugins": [
     "@babel/transform-runtime"
   ]
   ```
   
3. 使用happypack，开启多个线程

   因为webpack啥单线程的，所以有时候我们并不能充分利用到现代cpu多核的优势，所以需要想办法利用这个优势来提高打包编译效率，这时候就可以用到HappyPack来做这样的事情了，让任务分解给多个子进程做并发执行

   ```js
   const HappyPack = require('happypack')
   // 手动创建进程池
   const happyThreadPool =  HappyPack.ThreadPool({ size: os.cpus().length })
   
   module.exports = {
     module: {
       rules: [
         ...
         {
           test: /\.ts$/,
           // 问号后面的查询参数指定了处理这类文件的HappyPack实例的名字
           loader: 'happypack/loader?id=happyBabel',
           ...
         },
       ],
     },
     plugins: [
       ...
       new HappyPack({
         // 这个HappyPack的“名字”就叫做happyBabel，和楼上的查询参数遥相呼应
         id: 'happyBabel',
         // 指定进程池
         threadPool: happyThreadPool,
         loaders: ['babel-loader?cacheDirectory']
       })
     ],
   }
   ```

#### 打包性能监控

如果我们打包体积过大，那么体现在使用上就会导致页面加载时间特别长，这样是非常非常不好的一个体验，所以需要有一个提示机制，当我们打包文件过大的时候，我们能够及时知道文件大小，webpack*也提供了非常方便的功能*<code>performance</code>

```js
performance: {
  hints: 'warning', // 提示类型
    // 定一个创建后超过 200kb 的资源，将展示一条警告
    maxAssetSize: 1024 * 200,
    maxEntrypointSize: 1024 * 200,
}
```

这样，我们就能及时发现打包中出现的大体积包，然后对打包和开发做进一步的优化

#### 抽离第三方依赖

webpack提供了非常好的一个功能<code>DllPlugin</code>,它能够很好的把第三方依赖抽离出来，然后生产一个映射文件<code>manifest.json</code>

```js
const OUTPUT_PATH = BUILD_OUTPUT_DIR ? `${BUILD_OUTPUT_DIR}/lib/` : path.resolve('dist/lib')
// ...
module.exports = {
  // ...
	plugins: [
		// 抽离包的插件
    new webpack.DllPlugin({
			context: __dirname,
			path: path.resolve(OUTPUT_PATH, 'manifest.json'),
			name: '[name]-[hash]'
		})
	]
}
```

把包抽离出来后，就需要通过这个映射文件去使用这些包，这时候就会用到<code>DllReferencePlugin</code>映射到相关的依赖上去的，这时候启动项目，就可以正常使用这些依赖了

```js
new webpack.DllReferencePlugin({
  context: __dirname,
  sourceType: "commonjs2",
  name: 'lib_dll',
  manifest: dllMap // manifest.json地址
})
```

#### splitChunks

webpack4.x后提供了更加方便的拆包功能<code>splitChunks</code>，算是一个优化版的<code>DllPlugin</code>吧

*Tips：不知道是不是配置问题，本来在同时用的时候会导致一些包被打包两次，反而增大了体积*

```js	
optimization: {	
		// 打包后再拆包
    splitChunks: {
      // 这表示将选择哪些块进行优化。当提供一个字符串，有效值为 all, async 和 initial. 提供 all 可以特别强大，因为这意味着即使在异步和非异步块之间也可以共享块。
      chunks: 'all',
      // 要生产的块最小大小（以字节为单位）
      minSize: 10240,
      maxSize: 0,
      // 分割前必须共享模块的最小块数
      minChunks: 1,
      // 按需加载时的最大并行请求数
      maxAsyncRequests: 5,
      // 入口点处的最大并行请求数
      maxInitialRequests: 3,
      // 指定用于生成的名称的分割符 vendors~main.js
      automaticNameDelimiter: '~',
      // 拆分块的名称
      name: true,
      cacheGroups: {
        // 抽出css
        // styles: {
        //   name: 'static/css/styles',
        //   test: /\.(css|scss|sass)$/,
        //   chunks: 'all',
        //   enforce: true,
        // },
        // 抽出公共模块
        commons: {
          name: 'static/js/components',
          test: path.join(__dirname, '..', 'src/components'),
          minChunks: 3,
          priority: 5,
          reuseExistingChunk: true,
        },
        // 单独抽出react
        react: {
          test: /[\\/]node_modules[\\/](react)[\\/]/,
          name: 'static/js/react',
          priority: 20,
        },
        // 单独抽出react-dom
        reactDom: {
          test: /[\\/]node_modules[\\/](react-dom)[\\/]/,
          name: 'static/js/react-dom',
          priority: 20,
        },
        // 抽出第三方的包
        vendors: {
          name: 'static/js/vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 15,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
 }
```

上面的配置把一个公用的组件还有比较大的依赖都抽离出来了，webpack会把react-dom/react/其它第三方依赖都抽离出来，分别生成三个文件，当然，如果有其它比较大的依赖的话，也可以再加规则抽离出来

### 六、后续的计划

1. 持续优化webpack配置
2. 引入eslint 规范代码
3. 引入jest实现单元测试
4. 构建缓存策略，优化用户体验
5. 改造项目为ssr/服务端渲染
6. 抽离公用组件，构建组件库
7. 优化前端监控模块
8. ...

## 结束语

纸上得来总觉浅，绝知此事要躬行，以前看别人随随便便搭建一个项目感觉没啥，轮到自己做的时候就感觉秃顶发凉，仅以此篇，祭奠那些离我而去的头发吧。

![知识盲区](https://pic1.zhimg.com/80/v2-df4636a21ecd987c10de850af7ef3370_1440w.jpg)

👏 [github 仓库地址](https://github.com/tguzi/drip-flow-web)
