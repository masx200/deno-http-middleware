# deno-http-middleware

这是个实验项目

`Deno` 原生 HTTP 服务器的中间件框架

#### 介绍

### `createHandler`函数根据中间件创建一个请求处理函数

### 中间件函数`Middleware`

接受参数上下文`context`对象和调用下一个中间件的函数`next`

可以返回`Response`或者`Request`或者`{response:Response,request:Request}`或者`Response`的部分属性,来修改上下文`Context`中的请求和响应对象,

也可以不返回,不做任何修改

### 上下文`context`对象

包含属性`connInfo`:连接的信息

包含属性`request`:原生请求对象或者请求对象的部分属性

包含属性`response`:原生响应对象或者响应对象的部分属性

#### 软件架构

#### 安装教程

1. `Deno` 1.21.1

#### 使用说明

```ts
import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import { createHandler } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@master/mod.ts";
const port = Math.floor(Math.random() * 10000 + 10000);
const handler = createHandler([
    async (ctx, next) => {
        await next();
        console.log(2, ctx);
    },
    (ctx) => {
        console.log(1, ctx);
        return { body: "hello world," + ctx.request.url };
    },
]);

const p = serve(handler, { port: port });
await p;
```
