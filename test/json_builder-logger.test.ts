import { bodyToText } from "../body/bodyToText.ts";
import { assert, assertEquals, serve } from "../deps.ts";
import { json_builder } from "../middleware/json_builder.ts";
import { logger } from "../middleware/logger.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("json_builder-logger-object", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 30000 + 20000);
    const handler = createHandler([
        logger,
        json_builder,
        (ctx) => {
            const { pathname } = new URL(ctx.request.url);
            const body = pathname === "/array"
                ? ["hello world,", ctx.request.url]
                : { a: 1, b: 2, c: ctx.request.url };
            return { body };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/object`;
        const response = await fetch(url);
        const headers = response.headers;
        console.log(response);
        assert(response.ok);
        assert(headers.get("Content-Type")?.startsWith("application/json"));
        assertEquals(response.status, 200);
        const json = await response.json();
        console.log(json);
        assertEquals(json, { a: 1, b: 2, c: url });
    } finally {
        controller.abort();
    }
    await p;
});

Deno.test("json_builder-logger-array", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 30000 + 20000);
    const handler = createHandler([
        logger,
        json_builder,
        (ctx) => {
            const { pathname } = new URL(ctx.request.url);
            const body = pathname === "/array"
                ? ["hello world,", ctx.request.url]
                : { a: 1, b: 2, c: ctx.request.url };
            return { body };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/array`;
        const response = await fetch(url);
        const headers = response.headers;
        console.log(response);
        assert(response.ok);
        assert(headers.get("Content-Type")?.startsWith("application/json"));
        assertEquals(response.status, 200);
        const json = await response.json();
        console.log(json);
        assertEquals(json, ["hello world,", url]);
    } finally {
        controller.abort();
    }
    await p;
});

Deno.test("json_builder-logger-request", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 30000 + 20000);
    const handler = createHandler([
        logger,
        json_builder,
        async (ctx) => {
            const { request } = ctx;
            const { method } = request;
            const { pathname } = new URL(ctx.request.url);
            const text = await bodyToText(request.body);
            const body = {
                method,
                text,
                pathname,
                "x-random-data": ctx.request.headers.get("x-random-data"),
            };
            return { body };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/request`;
        const response = await fetch(url, {
            body: "1234567890",
            method: "POST",
            headers: {
                "x-random-data": "9876543210",
            },
        });
        const headers = response.headers;
        console.log(response);
        assert(response.ok);
        assert(headers.get("Content-Type")?.startsWith("application/json"));
        assertEquals(response.status, 200);
        const json = await response.json();
        console.log(json);
        assertEquals(json, {
            pathname: "/request",
            text: "1234567890",
            method: "POST",
            "x-random-data": "9876543210",
        });
    } finally {
        controller.abort();
    }
    await p;
});
