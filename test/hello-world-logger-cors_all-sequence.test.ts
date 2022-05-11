import { assert, assertEquals } from "../deps.ts";
import { serve } from "../deps.ts";
import { cors_all } from "../middleware/cors_all.ts";
import { logger } from "../middleware/logger.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("hello-world-logger-cors_all-sequence", async () => {
    const numbers: number[] = [];
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 20000 + 30000);
    const handler = createHandler([
        logger,
        cors_all,
        async (_ctx, next) => {
            console.log(1);
            numbers.push(1);
            await next();
            console.log(3);
            numbers.push(3);
        },
        (ctx) => {
            console.log(2);
            numbers.push(2);
            return { body: "hello world," + ctx.request.url };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        {
            const url = `http://localhost:${port}/helloworld`;
            const response = await fetch(url);
            console.log(response);
            assert(response.ok);
            assertEquals(response.status, 200);
            const text = await response.text();
            // console.log(text);
            assertEquals(text, "hello world," + url);
            const headers = response.headers;
            assertEquals(headers.get("access-control-allow-headers"), "*");
            assertEquals(headers.get("access-control-allow-methods"), "*");
            assertEquals(headers.get("access-control-allow-origin"), "*");
        }
        {
            const url = `http://localhost:${port}/helloworld`;
            const response2 = await fetch(url, { method: "options" });
            console.log(response2);
            assert(response2.ok);
            assert((await response2.text()).length === 0);
        }
    } finally {
        controller.abort();
    }
    await p;
    assertEquals(numbers, [1, 2, 3, 1, 2, 3]);
});
