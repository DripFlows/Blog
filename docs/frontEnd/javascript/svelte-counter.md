# svelte 尝鲜之计数器

## 简介

一种全新的构建页面的方法，旨在通过静态编译减少运行时的代码量。

> React or Vue 运行时，无论怎么编译，都需要引入其框架，而 Svelte 编译完即为一个完整的代码，无须额外引入一个所谓的框架。

## 资源

[官网](https://svelte.dev/)  
[svelte](https://github.com/sveltejs/svelte)

## 计数器
### 预览
![预览图](/svelte-counter.gif)

### 展示层 View

```js
// view.svelte
<script>
	export let number
</script>
	<p>
        <b>计数器:</b>
        <span>{number}</span>
    </p>
<style>
    p {
		font-size: 20px;
		color: #333;
		line-height: 20px;
	}
</style>
```

将number 传递出去，实现父组件向子组件传递

### 控制层 Counter

```js
// counter.svelte
<script>
	export let onAdd
    export let onReduce
</script>

	<button class="el-button--primary" on:click={onAdd}>+</button>
    <button class="el-button--danger" on:click={onReduce}>-</button>

<style>
	// 略...
</style>
```
通过事件触发，实现子组件向父组件传递
### 总览
```js
<script>
	import Count from './components/count.svelte'
	import View from './components/view.svelte'

	let count = 0

	function onAdd() {
		count ++;
	}
	function onReduce() {
		count --;
	}
</script>

<main>
	<View number={count}/>
	<Count onAdd={onAdd} onReduce={onReduce}/>
</main>

<style>
	// 略...
</style>
```
父组件调用二者，实现简单的计数器效果。