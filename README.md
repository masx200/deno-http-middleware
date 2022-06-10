# deno-http-middleware

`Deno` 原生 HTTP 服务器的中间件框架

这个中间件框架受到`Koa`的启发

核心模块保持简洁,完全函数式编程,

允许在中间件中直接返回响应或者替换修改请求对象.

尽可能使用新的原生 `API`,不需要引入更多的复杂性.

对于请求的解析,使用`URLSearchParams`,`URL`,`Request.prototype.json`,`Request.prototype.text`,代替`bodyParser`,`querystring`,`parseurl`.

对于路由匹配,可以使用新的原生`URLPattern`,不使用类似于`koa-Router`之类的方案.

对于响应体的构建也可以使用原生`Response`实现大部分的响应体的编码.

返回的`Response`的部分属性中的`body`可以是任何类型,可以添加自定义中间件来把指定类型的`body`转换成原生`Response`接受的`body`类型.

其余常用功能在`deno`的标准库中有解决方案.比如说`cookie`,和静态文件服务.

#### 介绍

### `get_original_Request`函数

可以获得原本的请求对象

### `createHandler`函数

根据中间件创建一个请求处理函数

接收参数`middleware`:中间件`Middleware`的数组

接受可选参数 `notfoundHandler`:自定义全局未找到错误处理函数。

接受可选参数 `errorHandler`:自定义错误处理函数

接受可选参数 `responseBuilder`:自定义响应构建函数

接受可选参数 `retProcessor`:自定义中间件返回值处理函数

### 中间件函数`Middleware`

可以是异步函数

接受参数上下文`context`对象和调用下一个中间件的函数`next`

可以返回`Response`或者`Request`或者`{response:Response,request:Request}`或者`Response`的部分属性,来修改上下文`Context`中的请求和响应对象,

返回值中也可以设置参数`next`表示中间件是否需要执行`next`函数.

也可以不返回,不做任何修改

返回的`Response`的部分属性中的`body`可以是任何类型,可以添加自定义中间件来把指定类型的`body`转换成原生`Response`接受的`body`类型.

### 上下文`context`对象

包含属性`connInfo`:连接的信息

包含属性`request`:`Request`对象的部分属性,属性可修改

因为原本的`Response`,`Request`的属性都是不可修改的,所以不用原本的`Response`,`Request`对象

包含属性`response`:`Response`对象的部分属性,属性可修改

### 自带中间件

`conditional_get`:条件`GET`请求中间件

`cors_all_get`:完全跨域`GET`请求中间件

`logger`:日志中间件

`json_builder`:`JSON`响应中间件,并附带`etag`响应头

`etag_builder`:给响应体不是 `stream` 的提供`etag`响应头的中间件

`method_override`:覆盖请求方法的中间件,`get_original_Method`函数可以获得原本的请求方法.

`stream_etag`:把响应体从 `stream` 转换为 `buffer` 来计算 `etag` 的中间件

#### 安装教程

1. `Deno` 1.21.1

#### 使用说明

也可以从 `deno.land`导入

https://deno.land/x/masx200_deno_http_middleware@1.2.1/mod.ts

https://deno.land/x/masx200_deno_http_middleware@1.2.1/middleware.ts

### 使用自带的中间件举例

```ts
import {
    conditional_get,
    cors_all_get,
    etag_builder,
    get_original_Method,
    json_builder,
    logger,
    method_override,
    stream_etag,
} from "https://deno.land/x/masx200_deno_http_middleware@1.2.1/middleware.ts";
const handler = createHandler([
    logger,
    conditional_get,
    method_override(),
    cors_all_get,

    json_builder,
    etag_builder,
    stream_etag(),
    (ctx) => {
        const body = {
            original_Method: get_original_Method(ctx),
            override_method: ctx.request.method,
        };
        return { body };
    },
]);
```

### 类似`nhttp`的`hello world`

简单的例子,注意顺序,中间件返回`response`的部分属性

```ts
import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import { createHandler } from "https://deno.land/x/masx200_deno_http_middleware@1.2.1/mod.ts";
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

### 类似`koa`的`hello world`

简单的例子,注意顺序,中间件直接修改`response.body`

```ts
import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import { createHandler } from "https://deno.land/x/masx200_deno_http_middleware@1.2.1/mod.ts";
const port = Math.floor(Math.random() * 10000 + 10000);
const handler = createHandler([
    async (ctx, next) => {
        console.log(1);
        await next();
        console.log(3);
    },
    (ctx) => {
        console.log(2);
        ctx.response.body = "hello world," + ctx.request.url;
        return;
    },
]);

const p = serve(handler, { port: port });
await p;
```

### json builder 举例

自带的 json 响应构建中间件的部分代码的例子

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
