---
title: TS泛型积累
lang: zh-CN
author: sillyY
update: 2020/01/03
---

# TS泛型积累

- `ConstructorParameters<T>` -- 提取构造函数中参数类型
```
class TestClass {
    constructor(public name: string, public age: number) {}
}
  
type R2 = ConstructorParameters<typeof TestClass> // [string, number]
```

- `Partial` - 将属性全部变为可选
```
type Partial<T> = { [P in keyof T]?: T[P] };
```

- `DeepPartial` - 递归将深层属性变为可选
```
type DeepPartial<T> = {
    [U in keyof T]?: T[U] extends object
    ? DeepPartial<T[U]>
    : T[U]
};

type R2 = DeepPartial<Person>
```

- `+/-` -  用于映射类型中给属性添加修饰符,比如-?就代表将可选属性变为必选,-readonly代表将只读属性变为非只读.
```
type Required<T> = { [P in keyof T]-?: T[P] };
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
```

- `Exclude<T>` - 从 T 中排除出可分配给 U的元素.
```
type Exclude<T, U> = T extends U ? never : T;
type T = Exclude<1 | 2, 1 | 3> // -> 2
```

- `Pick<T, K>` - 从 T 中取出 一系列 K 的属性
```
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
```

- `Omit<T, K>` - 忽略T中的某些属性.
```
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

type Foo = Omit<{name: string, age: number}, 'name'> // -> { age: number }
```

- `Required<T>` - 将传入的属性变为必选项
```
type Required<T> = { [P in keyof T]-?: T[P] };
```

- `Readonly<T>` - 将传入的属性变为只读选项
```
type Readonly<T> = { readonly [P in keyof T]: T[P] };
```

- `Record<T>` - 将 K 中所有的属性的值转化为 T 类型
```
type Record<K extends keyof any, T> = { [P in K]: T };

type Car = 'Audi' | 'BMW' | 'MercedesBenz'
type CarList = Record<Car, {age: number}>

const cars: CarList = {
    Audi: { age: 119 },
    BMW: { age: 113 },
    MercedesBenz: { age: 133 },
}
```

- `Extract<T, U>` - 提取出 T 包含在 U 中的元素/从 T 中提取出 U
```
type Extract<T, U> = T extends U ? T : never;
```

- `ReturnType<T>` - 用它获取函数的返回类型
```
type ReturnType<T> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any;
```

- `AxiosReturnType` - 获取Axios函数的返回类型
```
import { AxiosPromise } from 'axios' // 导入接口
type AxiosReturnType<T> = T extends (...args: any[]) => AxiosPromise<infer R> ? R : any

// 使用
type Resp = AxiosReturnType<Api> // 泛型参数中传入你的 Api 请求函数
```

- `Compute` - 将交叉类型合并
```
type Compute<A extends any> =
    A extends Function
    ? A
    : { [K in keyof A]: A[K] }

type R1 = Compute<{x: 'x'} & {y: 'y'}>
```

- `Merge<01, 02>` - 将两个对象的属性合并
```
type Merge<O1 extends object, O2 extends object> =
    Compute<O1 & Omit<O2, keyof O1>>
```

- `Intersection<T, U>` - 取T的属性
```
type Intersection<T extends object, U extends object> = Pick<
  T,
  Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
>;
```

- `Diff<T, U>` - 取出T类型中U不包含的部分:
```
type Diff<T, U> = T extends U ? never : T;
```

- `Filter<T, U>` - 取出T能赋给U的类型
```
type Filter<T, U> = T extends U ? T : never;
type R1 = Filter<string | number | (() => void), Function>; // () => void
```

- `NonNullable<T>` - 剔除 null和undefined
```
type NonNullable<T> = Diff<T, null | undefined>;
```

- `Overwrite<T, U>` - 用U的属性覆盖T的相同属性
```
type Overwrite<
  T extends object,
  U extends object,
  I = Diff<T, U> & Intersection<U, T>
> = Pick<I, keyof I>;

type Props = { name: string; age: number; visible: boolean };
type NewProps = { age: string; other: string };

// Expect: { name: string; age: string; visible: boolean; }
type ReplacedProps = Overwrite<Props, NewProps>
```

- `Mutable` - 将 T 的所有属性的 readonly 移除
```
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
```