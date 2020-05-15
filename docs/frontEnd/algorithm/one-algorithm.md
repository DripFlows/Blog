# 渣渣的算法题之路
##  前言

近日，朋友出了个算法题。苦思许久，但并未有太好结果。故在此记录下其中经过与思路，一做记录，二为实在太菜，想不到好办法😂。

![](https://user-gold-cdn.xitu.io/2020/5/15/17217f94b2b543bf?w=240&h=240&f=png&s=112074)

## 题目

给定四个数(非负数)和一个目标值，在数字之间添加**二元**运算符（不是一元）`+`、`-` 、 `*`或`÷` ，判断其是否能等于目标值。

### 规则

- 数字不可重复
- 数字可交换顺序
- 运算符任取3个，不可重复
- 运算符不包含`()`

实例1:

> 输入：nums = [1, 2, 3, 4],  target = 10
>
> 输出:   true  
>
> // 4 * 3 - 2 / 1 = 10;

实例2：

>输入:  nums  = [2, 3, 4, 5], target = 10
>
>输出: true
>
>// 2 * 4 + 5 - 2 = 10

实例3：

> 输入: nums = [4, 7, 9, 10], target = 12
>
> 输出：false
>
> // 12 + 4 / ( 9 - 7 ) = 12   // 这种违反规则第4条，无效

## 分析过程

### 暴力算法

开始看到这题时，就想到了暴力算法(穷举), 毕竟就4个数，根本上而言，对于时间复杂度和空间复杂度，都不会太高。

但单纯着按照穷举的方案去试试了下，发现除了遍历数外，还得遍历运算符，越想思路越乱。而且暴力解法始终不算优雅，先想想其他办法吧。

### 回溯算法方案

可能由于之前在`LeetCode`上看到过这么一题-[给表达式添加运算符](https://leetcode-cn.com/problems/expression-add-operators/)。

***

给定一个仅包含数字 `0-9` 的字符串和一个目标值，在数字之间添加**二元**运算符（不是一元）`+`、`-` 或 `*` ，返回所有能够得到目标值的表达式。

实例1：

>输入: num = "123", target = 6
>输出: ["1+2+3", "1*2*3"] 

示例 2:

> 输入: num = "232", target = 8
> 输出: ["2*3+2", "2+3*2"]

***

起初看到该题，也以为可以通过回溯算法去处理该题

但考虑过程中，发现了根本不需要使用回溯。

因为该题4个数字可随意交换顺序，并且完全可以先计算乘法或除法，再计算加减。

举个🌰：

![](https://user-gold-cdn.xitu.io/2020/5/15/17217f9858e26b75?w=1230&h=580&f=png&s=102606)

由于该题数字可以交换顺序，那么`4 + ( 2 * 3 )` 便可以转换成`2  * 3 + 4`。

结合这个思路，便可以得知这题仅存在这6种运算符组合，其它的都可以通过交换顺序转换成以下的运算符组合。

- a * b + c -d = target
- a / b + c - d = target
- a * b / c + d  = target
- a * b / c - d = target
- a * b + c / d = target
- a * b - c / d = target

当时也考虑过这问题，这种方案叫算法吗？

说真的，本菜鸡真不知道算不算。说数字少的时候可以这么去弄，但如果这里的数字多的话，这题也就不成立了。

### 树方案

紧接着想到了`数据结构树`，便可以通过`DFS（深度优先搜索）`树来列举所有数字组合。

![](https://user-gold-cdn.xitu.io/2020/5/15/17217f9c5d3021a3?w=1184&h=938&f=png&s=167717)

以第一个数字以A为例，第一层只能选取B, C,D三个，以此类推，则可以得到所有的数字排列组合。

```js
function permute(nums) {
  const res = [],  // 返回值 - 所有的排列组合
    cur = [], // 当前的排列内容
    visited = {}; // 用于标记使用重复数字

  const len = nums.length; 

  // 定义深度优先搜索函数
  function dfs(nums, key, cur, res, visited, len) {
    // 到达数组边界处，遍历完成，
    if (key === len) {
      // 取出当前的排列内容，并添加到res中
      res.push(cur.slice());
      return;
    }

    for (let i = 0; i < len; i++) {
      if (!visited[nums[i]]) {
        // 标记nums[i],表示已使用。
        visited[nums[i]] = 1;
        // 将nums[i] 添加到当前排列中
        cur.push(nums[i]);
        // 搜索nums[i]下的内容
        dfs(nums, key + 1, cur, res, visited, len);
        // dfs 会递归执行多次，收集完nums[i]为第一个数的排列。
        // 移除cur中的nums[i]
        cur.pop();
        // 将nums[i]  标记为未使用
        visited[nums[i]] = 0;
      }
    }
  }
  // 从索引0开始执行dfs
  dfs(nums, 0, cur, res, visited, len);
  return res;
}
```

👌，如此一来，我们就得到全排列的解决方案。

这样一来，我们只需要将上面整理后的六种运算符组合和数字全排列二者相结合，即可得到该题的初步解决方案。


##  优化

### 最大值角度

该角度其实算是个数学问题，通过最大值小于target来判断。

首先给数组排序，排序结果为A<B<C<D, 那么C * D + B 则为最大值（后续运算符只能为-或/）。

如果`C * D + B < target`, 那么此条件下必然为false。

```js
const [a,b,c,d] = nums.sort((a,b) => a - b);
if(c * d + b < target) return false 
```

其实还有个角度，乘法交换顺序计算多次，比如说` 2 * 3  + 4 / 1 = 10`和`3 * 2 + 4 / 1 = 10`。这两种在计算角度，算是一种，但在程序中，却会计算多次。但该方案实在未想到行之有效的解决方案，故在此向各位大佬求教。

附上本菜鸡解决方案: 

```js
function permute(nums, target) {
  const [a, b, c, d] = nums.sort((a, b) => a - b);
  if (c * d + b < target) return false;
  const cur = [],
    visited = {};

  let flag = false;

  const len = nums.length;

  function dfs(nums, key, cur, visited, len) {
    if (flag) return;
    if (key === len) {
      if (calc(cur.slice(), target)) flag = true;
      return;
    }

    for (let i = 0; i < len; i++) {
      if (!visited[nums[i]]) {
        visited[nums[i]] = 1;
        cur.push(nums[i]);
        dfs(nums, key + 1, cur, visited, len);
        cur.pop();
        visited[nums[i]] = 0;
      }
    }
  }
  dfs(nums, 0, cur, visited, len);
  return flag;
}

function calc(nums, target) {
  const [a, b, c, d] = nums;
  if (
    a * b + c - d === target ||
    (a * b) / c + d === target ||
    (a * b) / c - d === target ||
    a / b + c - d === target ||
    a * b + c / d === target ||
    a * b - c / d === target
  ) {
    return true;
  }

  return false;
}
```

## 结语

虽然是一个简单的算法题，但其中可以优化的地方太多太多。算法真的博大精深，真的还需努力。前路漫漫，未来可期！