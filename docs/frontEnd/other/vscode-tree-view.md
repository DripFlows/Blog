# VSCode插件开发之侧边栏

VSCode Extension API 提供了很多功能，比如实现侧边栏树形结构、编辑区高亮、主题字体等等。由于最近开发的插件主要实现了侧边栏树形结构，所以就在此探讨下vscode 的侧边栏树形结构。

## API详解

### TreeDataProvider

#### 树形结构的数据提供者

1. 事件

   onDidChangeTreeData

   树形结构数据改变触发函数

2. 方法

   1. getChildren

      获取元素的子元素

   2. getParent

      获取元素的父元素

   3. getTreeItem

      获取元素的表示形式

#### 如何注册？

Window.registerTreeDataProvider

为`视图view`注册`数据提供者dataProvider`



### TreeView

#### 树形结构的视图

1. 事件

   1. onDidChangeSelection

      选择更改时触发的事件

   2. onDidChangeVisibility

      可见性更改触发的事件

   3. onDidCollapseElement

      元素折叠时触发的事件

   4. onDidExpandElement

      元素展开时触发的事件

其他部分略，可参考官网API[TreeView](https://code.visualstudio.com/api/references/vscode-api#TreeView)

>  调整时尽量操作数据提供者TreeDataProvider, 而非直接操作视图层

#### 如何创建？

Window.createTreeView

创建树形结构视图view

#### TreeDataProvider与TreeView的联系

类似于MVC的关系，

TreeDataProvider属于M，应用程序中用于处理应用程序数据逻辑的部分

TreeView属于V，应用程序中处理数据显示的部分

VSCode内置部分属于C, 应用程序中处理用户交互的部分。

### Disposable

表示一种可以释放类型的资源, 如监听事件或计数器等

> 属于vscode开发中比较重要的一个API，可用于优化性能

1. 静态方法

   from

   将类disposable的方法转成Disposable对象

2. 方法

   dispose

   销毁dispose对象

> disposable一般通过Disposable.from来生成disposable对象，而非构造函数.

## 侧栏视图及配置详解

###  视图

![view-actions](https://code.visualstudio.com/assets/api/extension-guides/tree-view/view-actions.png)

* location

  表示在视图中的位置

  * view/title

    视图标题位置

    group 包含navigation和menus方式

  * view/item/content

    树形结构位置

    group 包含line和menus方式

* group

  表示在视图中的菜单分组

  * navigation

    默认组，始终位于最前面

  * line

    树形结构内联位置

  * menus

    菜单方式

    ![Menu Group Sorting](https://code.visualstudio.com/assets/api/references/contribution-points/groupSorting.png)

    

    * Navigation  这个组始终放到最前面
    * 1_modification 更改组
    * 9_cutcopypaste 编辑组
    * z_commands 默认组

    分组除`navigation`外，其他的按照`0-9`，`a-z`的顺序排列，故可以创建一个自定义组别，如`3_test`

    > 不同的菜单默认分组会有所不同，详细参考[Sorting-of-groups](https://code.visualstudio.com/api/references/contribution-points#Sorting-of-groups)

    组内排序，可通过`@<number>`的方式来自定义顺序，如

    ```json
    {
      "editor/title": [
        // 放到第2个
        {
          "when": "editorHasSelection",
          "command": "extension.Command",
          "group": "myGroup@2"
        },
        // 放到第一个
        {
          "when": "editorHasSelection",
          "command": "extension.Command",
          "group": "myGroup@1"
        }
      ]
    }
    ```

### 配置

#### 视图分类

- explorer "资源管理器"视图
- debug "运行和调试"视图
- scm  "源代码管理"视图
- test "测试资源管理器"视图
- 自定义视图

#### 自定义视图创建

视图容器`viewContainer`添加自定义视图, 然后在`视图views`中添加窗口

```json
    "viewsContainers": {
      "activitybar": [
        {
          "id": "test-view",
          "title": "测试窗口",
          "icon": "resources/icon.svg"
        }
      ]
    },
    "views": {
      "test-view": [
        {
          "id": "test-explorer",
          "name": "测试视图"
        },
        {
          "id": "test-explorer2",
          "name": "测试视图2"
        }
      ]
    }
```

结果如下图所示:

![tree-view-init](/tree-view-init.png)
> 需设置package.json中activationEvents为`[onView:<viewId>]`或`*`

#### 视图操作

* title

  ```json
  {
    "contributes": {
      "menus": {
        "view/title": [
          {
            "command": "testview.refresh",
            "when": "view == testview",
            "group": "navigation"
          },
          {
            "command": "testview.add",
            "when": "view == testview"
          }
        ]
      }
    }
  }
  ```

* item/content

  ```json
  {
  	"contributes": {
      "menus": {
         "view/item/context": [
        {
          "command": "testview.edit",
          "when": "view == testview && viewItem == test",
          "group": "inline"
        },
        {
          "command": "testview.delete",
          "when": "view == testview && viewItem == test"
        }
      ]
      }
    }
  }
  ```

  

command 即在`commands`中注册的命令

group 即位置分组

when 即决定在一定条件下显示，viewItem的对比值可以通过在getTreeItem中设定返回值的contextValue. 判断方式详见 `VSCodeAPI` [when-clause-contexts](https://code.visualstudio.com/docs/getstarted/keybindings#_when-clause-contexts)



## Demo演示

```typescript
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const tree = vscode.window.createTreeView("test-explorer", {
    treeDataProvider: new TestTreeDataProvider()
  });

  context.subscriptions.push(tree);
}

class TestTreeDataProvider implements vscode.TreeDataProvider<any> {
  getChildren() {
    return [1, 2, 3];
  }
  getTreeItem(element: any) {
    return {
      label: `测试00${element}`
    };
  }
}

```

结果如下：

![tree-view-demo](/tree-view-demo.png)

利用`createTreeView`创建视图并指定数据提供者(treeDataProvider)为`new TestTreeDataProvider()`,  TestTreeDataProvider 实现了接口类，内含`getChildren`和`getTreeItem`，表示视图树形结构。

## 参考文献

* [1] [Tree View API](https://code.visualstudio.com/api/extension-guides/tree-view)[OL] Visual Studio Code
* [2] [VSCode插件全攻略](http://blog.haoji.me/vscode-plugin-overview.html)[OL]小茗同学



