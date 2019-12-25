# 常用方法封装
 Node提供了大量的API，但其中某些API并不能直接满足我们个人需求。虽然NPM存在别人封装好的库，但大部分实现比较好的库都存在大量的方法。某些时候，我们仅仅只需要其中的一种，故没有必要去引用库。

故在此记录常见的一些方法，持续更新中...

## 创建文件  
创建文件时，如果文件路径中存在未创建的路径，则会造成文件创建失败。

比如： 创建`src/index.js`时,如果此时src文件夹目录不存在，则会抛出`no such file or directory, open 'src/index.js'`

👉解决方案：
```
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

const writeFile = (path, contents) => {
  return new Promise((resolve, reject) => {
    mkdirp(getDirName(path), function (err) {
      if (err) return reject(err);
      fs.writeFile(path, contents, (err) => {
        err ? reject(err) : resolve()
      });
    });
  })
}
```

<Valine />