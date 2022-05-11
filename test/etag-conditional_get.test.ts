import { assert, assertEquals, assertFalse } from "../deps.ts";
import { serve } from "../deps.ts";
import { conditional_get } from "../middleware/conditional_get.ts";
import { etag_builder } from "../middleware/etag_builder.ts";

import { logger } from "../middleware/logger.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("etag-conditional_get-non-empty-body", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 20000 + 30000);
    const handler = createHandler([
        logger,
        conditional_get,
        etag_builder,
        () => {
            return { body: "qwerty" };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const etag = await (async () => {
            const url = `http://localhost:${port}/test`;
            const response = await fetch(url);
            console.log(response);
            assert(response.ok);
            assertEquals(response.status, 200);
            const text = await response.text();

            assertEquals(text, "qwerty");
            return response.headers.get("etag");
        })();
        assert(etag);
        {
            const url = `http://localhost:${port}/test`;
            const response = await fetch(url, {
                headers: { "if-none-match": etag },
            });
            console.log(response);
            assert(response.ok === false);
            assertEquals(response.status, 304);
            const text = await response.text();

            assertEquals(text, "");
        }
        {
            const url = `http://localhost:${port}/test`;
            const response = await fetch(url, {
                headers: { "if-none-match": "W/" + etag },
            });
            console.log(response);
            assertFalse(response.ok);
            assertEquals(response.status, 304);
            const text = await response.text();

            assertEquals(text, "");
        }
    } finally {
        controller.abort();
    }
    await p;
});

Deno.test("etag-conditional_get-empty-body", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 20000 + 30000);
    const handler = createHandler([
        logger,
        conditional_get,
        etag_builder,
        () => {
            return { body: null };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        {
            const url = `http://localhost:${port}/test`;
            const response = await fetch(url);
            console.log(response);
            assert(response.ok);
            assertEquals(response.status, 200);
            const text = await response.text();

            assertEquals(text, "");
            assert(response.headers.get("etag"));
        }
    } finally {
        controller.abort();
    }
    await p;
});
