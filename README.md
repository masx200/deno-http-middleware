# deno-http-middleware

这是个实验项目

`Deno` 原生 HTTP 服务器的中间件框架

这个中间件框架受到`Koa`的启发

#### 介绍

### `createHandler`函数

根据中间件创建一个请求处理函数

接收参数`middleware`:中间件`Middleware`的数组

接受可选参数 `notfoundHandler`:自定义全局未找到错误处理函数。

接受可选参数 `error_handler`:自定义错误处理函数

接受可选参数 `response_builder`:自定义响应构建函数

接受可选参数 `ret_processor`:自定义中间件返回值处理函数

### 中间件函数`Middleware`

可以是异步函数

接受参数上下文`context`对象和调用下一个中间件的函数`next`

可以返回`Response`或者`Request`或者`{response:Response,request:Request}`或者`Response`的部分属性,来修改上下文`Context`中的请求和响应对象,

也可以不返回,不做任何修改

返回的`Response`的部分属性中的`body`可以是任何类型,可以添加自定义中间件来把指定类型的`body`转换成原生`Response`接受的`body`类型.

### 上下文`context`对象

包含属性`connInfo`:连接的信息

包含属性`request`:原生`Request`对象或者`Request`对象的部分属性

包含属性`response`:原生`Response`对象或者`Response`对象的部分属性

#### 软件架构

#### 安装教程

1. `Deno` 1.21.1

#### 使用说明

### hello world

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
