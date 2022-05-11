import { assert, assertEquals } from "../deps.ts";
import { serve } from "../deps.ts";
import { json_builder } from "../middleware/json_builder.ts";

import { logger } from "../middleware/logger.ts";
import {
    get_original_Method,
    method_override,
} from "../middleware/method_override.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("method_override-get", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 30000 + 20000);
    const handler = createHandler([
        logger,
        method_override(),
        json_builder,
        (ctx) => {
            const body = {
                original_Method: get_original_Method(ctx),
                override_method: ctx.request.method,
            };
            return { body };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/`;
        const response = await fetch(url);
        const headers = response.headers;
        console.log(response);
        assert(response.ok);
        assert(headers.get("Content-Type")?.startsWith("application/json"));
        assertEquals(response.status, 200);
        const json = await response.json();
        console.log(json);
        assertEquals(json, {
            original_Method: "GET",
            override_method: "GET",
        });
    } finally {
        controller.abort();
    }
    await p;
});
Deno.test("method_override-get-post", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 30000 + 20000);
    const handler = createHandler([
        logger,
        method_override(),
        json_builder,
        (ctx) => {
            const body = {
                original_Method: get_original_Method(ctx),
                override_method: ctx.request.method,
            };
            return { body };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/`;
        const response = await fetch(url, {
            headers: { "X-HTTP-Method-Override": "POST" },
        });
        const headers = response.headers;
        console.log(response);
        assert(response.ok);
        assert(headers.get("Content-Type")?.startsWith("application/json"));
        assertEquals(response.status, 200);
        const json = await response.json();
        console.log(json);
        assertEquals(json, {
            original_Method: "GET",
            override_method: "GET",
        });
    } finally {
        controller.abort();
    }
    await p;
});
Deno.test("method_override-post-put", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 30000 + 20000);
    const handler = createHandler([
        logger,
        method_override(),
        json_builder,
        (ctx) => {
            const body = {
                original_Method: get_original_Method(ctx),
                override_method: ctx.request.method,
            };
            return { body };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "X-HTTP-Method-Override": "PUT" },
        });
        const headers = response.headers;
        console.log(response);
        assert(response.ok);
        assert(headers.get("Content-Type")?.startsWith("application/json"));
        assertEquals(response.status, 200);
        const json = await response.json();
        console.log(json);
        assertEquals(json, {
            original_Method: "POST",
            override_method: "PUT",
        });
    } finally {
        controller.abort();
    }
    await p;
});
Deno.test("method_override-post-unsupported", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 30000 + 20000);
    const handler = createHandler([
        logger,
        method_override(),
        json_builder,
        (ctx) => {
            const body = {
                original_Method: get_original_Method(ctx),
                override_method: ctx.request.method,
            };
            return { body };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "X-HTTP-Method-Override": "unsupported" },
        });
        const headers = response.headers;
        console.log(response);
        assert(response.ok);
        assert(headers.get("Content-Type")?.startsWith("application/json"));
        assertEquals(response.status, 200);
        const json = await response.json();
        console.log(json);
        assertEquals(json, {
            original_Method: "POST",
            override_method: "POST",
        });
    } finally {
        controller.abort();
    }
    await p;
});
