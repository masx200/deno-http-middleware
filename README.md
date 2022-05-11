# deno-http-middleware

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

### 自带中间件

`conditional_get`:条件`GET`请求中间件

`cors_all`:完全跨域中间件

`logger`:日志中间件

`json_builder`:`JSON`响应中间件,并附带`etag`响应头

`etag_builder`:附带`etag`响应头的中间件

#### 安装教程

1. `Deno` 1.21.1

#### 使用说明

### 使用自带的中间件

```ts
import {
    conditional_get,
    cors_all,
    etag_builder,
    json_builder,
    logger,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@1.0.0/middleware.ts";
const handler = createHandler([
    logger,
    conditional_get,
    cors_all,

    json_builder,
    etag_builder,
]);
```

### hello world

简单的例子

```ts
import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import { createHandler } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@1.0.0/mod.ts";
const port = Math.floor(Math.random() * 10000 + 10000);
const handler = createHandler([
    async (ctx, next) => {
        console.log(1);
        await next();
        console.log(3);
    },
    (ctx) => {
        console.log(2);
        return { body: "hello world," + ctx.request.url };
    },
]);

const p = serve(handler, { port: port });
await p;
```

### json builder

自带的 json 响应构建中间件的部分代码

```ts
import { isPlainObject } from "../deps.ts";
import { JSONResponse } from "../response/JSONResponse.ts";

import { Middleware, RetHandler } from "../src/Middleware.ts";

export const json_builder: Middleware = async function (
    context,
    next,
): Promise<RetHandler> {
    await next();
    const { response } = context;
    const { body } = response;

    return response instanceof Response
        ? response
        : Array.isArray(body) || isPlainObject(body)
        ? await JSONResponse(response)
        : void 0;
};
```
