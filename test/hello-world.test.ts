import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.138.0/testing/asserts.ts";
import { serve } from "../deps.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("hello-world", async () => {
    const controller = new AbortController();
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

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/helloworld`;
        const response = await fetch(url);
        console.log(response);
        assert(response.ok);
        assertEquals(response.status, 200);
        const text = await response.text();
        console.log(text);
        assertEquals(text, "hello world," + url);
    } finally {
        controller.abort();
    }
    await p;
});
