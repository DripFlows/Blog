# React Hook在项目

距*[React Hooks](https://react.docschina.org/docs/hooks-intro.html)* 推出已有很长一段时间，大家或多或少已开始接触起 *Hooks*。或有疑惑 ，或有思考，亦或在项目中用的风生水起，亦或止步于*Hooks*界的*"Hello World"*。

那么*[Hooks](https://react.docschina.org/docs/hooks-intro.html)* 究竟带来了什么？接下来让我们谈谈*Hooks*给我们的*React世界*带来了怎样的改变。

## 入门

思考下面这个组件？

![KeyPress](/hook-in-project-01.png)

首先我们用过去常用的*class版本*来实现下：

```js
class KeyPress extends Component {
  constructor(props) {
    super(props);

    this.state = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    };
  }
  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown.bind(this));
    document.removeEventListener("keyup", this.onKeyUp.bind(this));
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case 37:
        this.setState({
          left: true,
        });
        break;
      case 38:
        this.setState({
          top: true,
        });
        break;
      case 39:
        this.setState({
          right: true,
        });
        break;
      case 40:
        this.setState({
          bottom: true,
        });
        break;
      default:
        break;
    }
  }

  onKeyUp() {
    switch (e.keyCode) {
      case 37:
        this.setState({
          left: false,
        });
        break;
      case 38:
        this.setState({
          top: false,
        });
        break;
      case 39:
        this.setState({
          right: false,
        });
        break;
      case 40:
        this.setState({
          bottom: false,
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { top, bottom, left, right } = this.state;
    return (
      <div>
        <p>
          <span role="img" aria-label="top">
            按↑显示'👆'
          </span>
          <span role="img" aria-label="bottom">
            按↓显示👇
          </span>
          <span role="img" aria-label="left">
            按←显示👈
          </span>
          <span role="img" aria-label="right">
            按→显示👉
          </span>
        </p>
        <p>
          {top && "👆"}
          {bottom && "👇"}
          {left && "👈"}
          {right && "👉"}
        </p>
      </div>
    );
  }
}
```

*Hook*版本又是怎么样的呢？

```js
function KeyPress() {
  const [top, setTop] = useState(false),
    [bottom, setBottom] = useState(false),
    [left, setLeft] = useState(false),
    [right, setRight] = useState(false);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 37:
        setLeft(true);
        break;
      case 38:
        setTop(true);
        break;
      case 39:
        setRight(true);
        break;
      case 40:
        setBottom(true);
        break;
      default:
        break;
    }
  }

  function onKeyUp() {
    switch (e.keyCode) {
      case 37:
        setLeft(false);
        break;
      case 38:
        setTop(false);
        break;
      case 39:
        setRight(false);
        break;
      case 40:
        setBottom(false);
        break;
      default:
        break;
    }
  }
  return (
    // ...
  );
}
```

是的，仅此而已。

相比较于*class*版本，在*Hook*例子中，*keyPress组件*的变化好像不大，但你是否发现了几个问题

- *class*版本需要在*componentDidMount*中建立监听事件，在*componentWillUnmount*中移除监听事件。
- 存在很多重复的业务逻辑，比如*top*，*botom*等的操作逻辑其实都是类似的，按下去都是将值(*top/botoom*等)设为*true*，弹起时设为*false*

对于问题一:

使用*[useEffect](https://react.docschina.org/docs/hooks-reference.html#useeffect)*在同一个方法中既创建了监视器，又以*返回清除函数*的方式清除了监视器。而非*class版本*中在*componentDidMount*，*componentWillUnmount*两个生命周期中单独创建和销毁。

而对于问题二：

这就需要Hook中最重要的一部分: *自定义Hook*

## 自定义Hook

官方解释： [通过自定义 Hook，可以将组件逻辑提取到可重用的函数中。](https://react.docschina.org/docs/hooks-custom.html)

直译看来，仅仅是一个函数，怎么去做呢？

接着看上面的例子。

```js
//  hook/keypress.js
export function useKeyPress(targetKey) {
  const [keyPress, setKeyPress] = useState(false);

  function onKeyDown({ keyCode }) {
    if (keyCode === targetKey) {
      setKeyPress(true);
    }
  }

  function onKeyUp({ keyCode }) {
    if (keyCode === targetKey) {
      setKeyPress(false);
    }
  }
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return keyPress;
}

// KeyPress.js
function KeyPress() {
  const top = useKeyPress(38);
  const bottom = useKeyPress(40);
  const left = useKeyPress(37);
  const right = useKeyPress(39);
  return (
   // ...略
  );
}
```

这样子就实现了个*useKeyPress Hook*

是否有种豁然一新的感觉，重复逻辑问题被巧妙的修复了。

没错，这正是*自定义Hook*真正的作用，也正如官方所说的*"可以将组件逻辑提取到可重用的函数中"*，即抽离业务代码中的公有逻辑。

但其实这段代码还是有问题的。

![question](/hook-in-project-02.png)

这里表示useEffect的缺少了*onKeyDown*和*onKeyUp*依赖，主要是在于这2个函数引用了外界传入的*targetKey*, 这是一个*[不安全的情况](https://react.docschina.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)*

如何修复呢？

推荐是把*onKeyDown*和*onKeyUp*移到effect内部, 这样子依赖则变成了*targetKey*。

```js
export function useKeyPress(targetKey) {
  const [keyPress, setKeyPress] = useState(false);

  useEffect(() => {
    function onKeyDown({ keyCode }) {
      if (keyCode === targetKey) {
        setKeyPress(true);
      }
    }

    function onKeyUp({ keyCode }) {
      if (keyCode === targetKey) {
        setKeyPress(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [targetKey]);

  return keyPress;
}
```

另外还有种解决方案，这就需要用到了*Hook*中的*useCallback API*

```js
// hook/keypress.js
export function useKeyPress(targetKey) {
  const [keyPress, setKeyPress] = useState(false);

  const onKeyDown = useCallback(
    ({ keyCode }) => {
      if (keyCode === targetKey) {
        setKeyPress(true);
      }
    },
    [targetKey]
  );
  const onKeyUp = useCallback(
    ({ keyCode }) => {
      if (keyCode === targetKey) {
        setKeyPress(false);
      }
    },
    [targetKey]
  );
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  return keyPress;
}

```

通过*useCallback* 缓存*onKeyDown*,*onKeyUp*函数，只有当*targetKey*改变时才会更新，也就确保了*targetKey* prop的变化会自动触发*useEffect*

这么一来，keyPress这个公共逻辑就被完美的从组件中抽离出来。

仔细想想，是否别的组件是否也有键盘事件，是不是也可以直接调用*useKeyPress*来抽离公共逻辑。

Perfect!🎉

是不是除了键盘事件，项目中还有很多的公共逻辑可以抽离出来。比如说鼠标操作事件、setTimeout/setInterval定时器事件、节流/防抖等等。

是不是如同哥伦布发现新大陆一般兴奋🥰

虽说Hooks很棒，但它并不可以毫无约束的去使用！

## Hook约定

### 只在最顶层使用Hook

**不要在循环，条件或嵌套函数中调用 Hook，** 确保总是在你的 React 函数的最顶层调用他们。

这个主要是在于*React Hook*需要按一定的顺序调用, 如下面的官方例子:

```js
function Form() {
  // 1. Use the name state variable
  const [name, setName] = useState('Mary');

  // 2. Use an effect for persisting the form
  useEffect(function persistForm() {
    localStorage.setItem('formData', name);
  });

  // 3. Use the surname state variable
  const [surname, setSurname] = useState('Poppins');

  // 4. Use an effect for updating the title
  useEffect(function updateTitle() {
    document.title = name + ' ' + surname;
  });

  // ...
}
```

本来Hook的调用顺序如下：

```js
useState('Mary')           
useEffect(persistForm)   
useState('Poppins')        
useEffect(updateTitle)    

```

如果函数中存在 条件判断等会改变调用顺序的情况，如：

```js
  // 🔴 在条件语句中使用 Hook 违反第一条规则
  if (name !== '') {
    useEffect(function persistForm() {
      localStorage.setItem('formData', name);
    });
  }
```

这样子，会导致调用顺序会在运行过程中发生改变

```js
useState('Mary')
// useEffect(persistForm)
useState('Poppins')
useEffect(updateTitle)
```

*Hooks*的执行数据保存在同一个储存空间中。

*useState*、*useEffect*都是*Hook*，他们用的都是同一个储存空间。如果调用顺序发生改变,则会发生下面 的情况

```js
//  第一次渲染
useState('Mary')         // 1. 使用 'Mary' 初始化变量名为 name 的 state
useEffect(persistForm)   // 2. 添加 effect 以保存 form 操作
useState('Poppins')      // 3. 使用 'Poppins' 初始化变量名为 surname 的 state
useEffect(updateTitle)   // 4. 添加 effect 以更新标题

// 第二次渲染
useState('Mary')           // 1. 读取变量名为 name 的 state（参数被忽略）
// useEffect(persistForm)  // 🔴 此 Hook 被忽略！
useState('Poppins')        // 🔴 2 （之前为 3）。读取变量名为 surname 的 state 失败
useEffect(updateTitle)     // 🔴 3 （之前为 4）。替换更新标题的 effect 失败
```

*useState*默认会返回*[state, setState]*, 如果调用顺序发生了改变，相当于*[state, setState]*得不到正确返回，也就会造成问题，并且后续的执行顺序都会提前，每个执行也会相应地产生意料之外的结果。

> 关于Hooks执行顺序可以参考：[为什么顺序调用对 React Hooks 很重要？](https://overreacted.io/zh-hans/why-do-hooks-rely-on-call-order/)

### 只在React函数中调用Hook

**不要在普通的 JavaScript 函数中调用 Hook。**

- ✅ 在 React 的函数组件中调用 Hook
- ✅ 在自定义 Hook 中调用其他 Hook

这个O(∩_∩)O哈哈~，太好理解了，你能在*vue*中用*React Hook*吗？

另外*Hook*的本质就是*在不编写 class 的情况下使用 state 以及其他的 React 特性*


## 结语

*Hook*有效地抽离公共逻辑，分割开业务逻辑与公共逻辑，提高了代码的质量与可维护性。但缺点在于*Hook*的学习与认知成本，倘若知识不到位，那只能起到反作用力，导致各种问题。

*HOC*正值壮年，而*Hook*才刚刚起步，但*Hook*才是*[React的未来](https://react.docschina.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both)*。早日掌握*Hook*，方能早日掌握市场力。

## 参考资料

- [【React深入】从Mixin到HOC再到Hook](https://juejin.im/post/5cad39b3f265da03502b1c0a)
- [useEffect 完整指南](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)
- [为什么顺序调用对 React Hooks 很重要？](https://overreacted.io/zh-hans/why-do-hooks-rely-on-call-order/)
- [Hooks](https://juejin.im/post/5cad39b3f265da03502b1c0a)