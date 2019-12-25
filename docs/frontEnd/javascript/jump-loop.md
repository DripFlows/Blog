# 跳出循环的三种方法(break-return-continue)

## break-return-continue

### 1.break

::: tip
MDN: [break](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/break)
:::

- 定义  
  break 语句中止当前循环，switch 语句或 label 语句，并把程序控制流转到紧接着被中止语句后面的语句。
- 语法
  ::: danger
  break [label];
  :::
  <strong>label</strong>  
  &emsp;可选。与语句标签相关联的标识符。如果 break 语句不在一个循环或 switch 语句中，则该项是必须的。

### 2.return

::: tip
MDN: [return](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/return)
:::

- 定义  
  return 语句终止函数的执行，并返回一个指定的值给函数调用者。
- 语法
  ::: danger
  return [[expression]];
  :::
  expression
  &emsp;表达式的值会被返回。如果忽略，则返回 undefined。

### 3.continue

::: tip
MDN: [continue](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/continue)
:::

- 定义  
  continue 语句结束当前（或标签）的循环语句的本次迭代，并继续执行循环的下一次迭代。
- 语法
  ::: danger
  continue [ label];
  :::

label
&emsp;标识标号关联的语句

## 1. for

```
function execute() {
  var arr = [1, 2, 3],
    i = 0,
    len = arr.length

  for (; i < len; i++) {
    // if (i === 1) [statement]
    console.log(`key: ${i} \nvalue: ${arr[i]}`)
  }
  console.log('execute')
}

var result = execute()
console.log(result)

```

| statement | 结果                                                                                | 说明                       |
| --------- | ----------------------------------------------------------------------------------- | -------------------------- |
| break     | <strong>key: 0 <br> value: 1<br>execute<br>undefined</strong>                       | 跳出循环                   |
| continue  | <strong>key: 0 <br> value: 1<br>key: 2<br>value: 3<br>execute<br>undefined</strong> | 跳出当前执行，执行下次循环 |
| return    | <strong>key: 0 <br>value: 1 <br>undefined</strong>                                  | 跳出函数                   |

## 2. while

```
function execute() {
  var num = 0

  while (num <= 3) {
    num++
    // if (num === 1) [statement];
    console.log(num)
  }
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement | 结果                                                 | 说明                       |
| --------- | ---------------------------------------------------- | -------------------------- |
| break     | <strong>execute<br>undefined</strong>                | 跳出循环                   |
| continue  | <strong>2<br>3<br>4<br>execute<br>undefined</strong> | 跳出当前执行，执行下次循环 |
| return    | <strong>undefined</strong>                           | 跳出函数                   |

## 3. do-while 循环

```
function execute() {
  var num = 3
  do {
    num--
    if (num === 1) break;
    console.log(num)
  } while (num >= 0)

  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement | 结果                                                  | 说明                       |
| --------- | ----------------------------------------------------- | -------------------------- |
| break     | <strong>2<br>execute<br>undefined</strong>            | 跳出循环                   |
| continue  | <strong>2<br>0<br>-1<br>execute<br>undefined</strong> | 跳出当前执行，执行下次循环 |
| return    | <strong>2<br>undefined</strong>                       | 跳出函数                   |

## 4. for-in

```
function execute() {
  var obj = {a: 1, b:2, c: 3}

  for(let key in obj) {
    // if(obj[key] === 1) [statement]
    console.log(obj[key])
  }
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement | 结果                                            | 说明                       |
| --------- | ----------------------------------------------- | -------------------------- |
| break     | <strong>execute<br>undefined</strong>           | 跳出循环                   |
| continue  | <strong>2<br>3<br>execute<br>undefined</strong> | 跳出当前执行，执行下次循环 |
| return    | <strong>undefined</strong>                      | 跳出函数                   |

## 5. for-of

```
function execute() {
  var arr = [1, 2, 3]

  for(let value in arr) {
    // if(value === 1) [statement];
    console.log(value)
  }
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement | 结果                                            | 说明                       |
| --------- | ----------------------------------------------- | -------------------------- |
| break     | <strong>execute<br>undefined</strong>           | 跳出循环                   |
| continue  | <strong>2<br>3<br>execute<br>undefined</strong> | 跳出当前执行，执行下次循环 |
| return    | <strong>undefined</strong>                      | 跳出函数                   |

## 6.map

```
function execute() {
  var arr = [1, 2, 3]

  var result  = arr.map(v=> {
    // if(v === 1) [statement];
    console.log(v)
  })
  console.log(result);
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement       | 结果                                                                                | 说明                            |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| break           | SyntaxError: Illegal break statement                                                | map 中不允许使用 break          |
| continue        | Illegal continue statement: no surrounding iteration statement                      | map 中不允许使用 continue       |
| return 'result' | <strong>2<br>3<br>['result', undefined, undefined]<br>execute<br>undefined</strong> | 保持 map 的返回值，执行下次循环 |

## 7.forEach

```
function execute() {
  var arr = [1, 2, 3]

  var result  = arr.forEach(v=> {
    // if(v === 1) [statement];
    console.log(v)
  })
  console.log(result);
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement       | 结果                                                           | 说明                                           |
| --------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| break           | SyntaxError: Illegal break statement                           | forEach 中不允许使用 break                     |
| continue        | Illegal continue statement: no surrounding iteration statement | forEach 中不允许使用 continue                  |
| return 'result' | <strong>2<br>3<br>undefined<br>execute<br>undefined</strong>   | forEach 本身无返回值，这里无效果，执行下次循环 |

## 8.every

```
function execute() {
  var arr = [1, 2, 3]

  var result  = arr.every(v=> {
    if(v === 1) [statement];
    console.log(v)
  })
  console.log(result);
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement       | 结果                                                           | 说明                                                                       |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| break           | SyntaxError: Illegal break statement                           | every 中不允许使用 break                                                   |
| continue        | Illegal continue statement: no surrounding iteration statement | every 中不允许使用 continue                                                |
| return 'result' | <strong>2<br>false<br>execute<br>undefined</strong>            | every 数据中存在不满足 v === 1 的数据，则返回 false, return 后执行下次循环 |

## 9.some

```
function execute() {
  var arr = [1, 2, 3]

  var result  = arr.some(v=> {
    if(v === 1) [statement];
    console.log(v)
  })
  console.log(result);
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement       | 结果                                                           | 说明                                                                        |
| --------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| break           | SyntaxError: Illegal break statement                           | some 中不允许使用 break                                                     |
| continue        | Illegal continue statement: no surrounding iteration statement | some 中不允许使用 continue                                                  |
| return 'result' | <strong>true<br>execute<br>undefined</strong>                  | some 数据中只要存在满足 v === 1 的数据，则返回 true, 这里 return 后跳出循环 |

## 10.filter

```
function execute() {
  var arr = [1, 2, 3]

  var result  = arr.filter(v=> {
    if(v === 1) [statement];
    console.log(v)
  })
  console.log(result);
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement       | 结果                                                           | 说明                                                                 |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| break           | SyntaxError: Illegal break statement                           | filter 中不允许使用 break                                            |
| continue        | Illegal continue statement: no surrounding iteration statement | filter 中不允许使用 continue                                         |
| return 'result' | <strong>2<br>3<br>[1]<br>execute<br>undefined</strong>         | filter 筛选满足条件的数据， 这里 return 后跳出当前执行，执行下次循环 |

## 11. reduce

```
function execute() {
  var arr = [1, 2, 3]

  var result  = arr.reduce((prev, cur)=> {
    if(prev === 1) return 'result';
    console.log(prev, cur)
  })
  console.log(result);
  console.log('execute')
}
var result = execute()
console.log(result)
```

| statement       | 结果                                                           | 说明                                                                     |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| break           | SyntaxError: Illegal break statement                           | reduce 中不允许使用 break                                                |
| continue        | Illegal continue statement: no surrounding iteration statement | reduce 中不允许使用 continue                                             |
| return 'result' | <strong>result 3<br>undefined<br>execute<br>undefined</strong> | reduce prev 代表前一个返回值， 这里 return 后跳出当前执行， 执行下次循环 |
