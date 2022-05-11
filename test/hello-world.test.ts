import { assert, assertEquals } from "../deps.ts";
import { serve } from "../deps.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("hello-world", async () => {
    const numbers: number[] = [];
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 10000 + 10000);
    const handler = createHandler([
        async (ctx, next) => {
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
        const url = `http://localhost:${port}/helloworld`;
        const response = await fetch(url);
        // console.log(response);
        assert(response.ok);
        assertEquals(response.status, 200);
        const text = await response.text();
        // console.log(text);
        assertEquals(text, "hello world," + url);
    } finally {
        controller.abort();
    }
    await p;
    assertEquals(numbers, [1, 2, 3]);
});
