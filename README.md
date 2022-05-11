# deno-http-middleware

这是个实验项目

`Deno` 原生 HTTP 服务器的中间件框架

#### 介绍

#### 软件架构

#### 安装教程

1. `Deno` 1.21.1

#### 使用说明

```ts
import { serve } from "https://deno.land/std@0.138.0/http/server.ts";

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
