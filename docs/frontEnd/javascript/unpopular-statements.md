# JS 冷门语句

JS 的语句有很多种，本文重点涉及 `debugger`,`do...while`, `while`, `for await...of`, `label`, `throw` 这6种

## debugger
debugger 语句调用任何可用的调试功能，例如设置断点。 如果没有调试功能可用，则此语句不起作用。

```
function triggerDebugger() {
    debugger
    // debgugger被调用时，执行会暂停在debugger语句处，通过断点等调试工具来调试后续代码
}
```
> 完美取代console调试大法😂

## do...while和while
### do...while
do...while 语句创建一个执行指定语句的循环，直到condition值为 false。在执行语句(statement) 后检测condition，所以指定的语句(statement)至少执行一次。
```
do  
    // 语句  
while(condition)
```

### while
while 语句可以在某个条件表达式为真的前提下，循环执行指定的一段代码，直到那个表达式不为真时结束循环。
```
while(condition)
    // 语句
```

> 也许正是for大法好啊，导致这2个语句都似不存于JS中

## for await...of
The for await...of 语句在异步或者同步可迭代对象上（包括 String，Array，Array-like 对象（比如arguments 或者NodeList)，TypedArray，Map， Set和其他对象等等）创建一个迭代循环，调用自定义迭代钩子，并为每个不同属性的值执行语句。
```
for await (variable of iterable) {
    // 语句
}
```

## label 
标记语句可以和 break 或 continue 语句一起使用。标记就是在一条语句前面加个可以引用的标识符（identifier）。

```
var num = 0;
loop1:
for(var i = 0; i < 3; i++){
    if(i === 1) {
        continue loop1;
    }
    num++
}
console.log(num) // 2
```

## throw
throw语句用来抛出一个用户自定义的异常。当前函数的执行将被停止（throw之后的语句将不会执行），并且控制将被传递到调用堆栈中的第一个catch块。如果调用者函数中没有catch块，程序将会终止。

```
function useThrow() {
    throw "Use Throw"
}
try {
    useThrow()
}catch(e) {
    console.log(e) // Use Throw
}
```

<Valine />