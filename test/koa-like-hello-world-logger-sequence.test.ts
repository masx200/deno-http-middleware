import { assert, assertEquals, serve } from "../deps.ts";
import { logger } from "../middleware/logger.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("koa-like-hello-world-logger-sequence", async () => {
    const numbers: number[] = [];
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 20000 + 30000);
    const handler = createHandler([
        logger,

        async (_ctx, next) => {
            // console.log(1);
            numbers.push(1);
            await next();
            // console.log(3);
            numbers.push(3);
        },
        (ctx) => {
            // console.log(2);
            numbers.push(2);
            ctx.response.body = "hello world," + ctx.request.url;
            return;
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        for (const method of ["GET", "POST"]) {
            const url = `http://localhost:${port}/helloworld`;
            const response = await fetch(url, { method });
            // console.log(response);
            assert(response.ok);
            assertEquals(response.status, 200);
            const text = await response.text();

            assertEquals(text, "hello world," + url);
        }
    } finally {
        controller.abort();
    }
    await p;
    assertEquals(numbers, [1, 2, 3, 1, 2, 3]);
});
