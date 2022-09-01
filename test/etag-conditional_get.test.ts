import { assert, assertEquals, serve } from "../deps.ts";
import { conditional_get } from "../middleware/conditional_get.ts";
import { etag_builder } from "../middleware/etag_builder.ts";
import { logger } from "../middleware/logger.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("etag-conditional_get-non-empty-body-text", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 50000 + 10000);
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
            // console.log(response);
            assert(response.ok);
            assertEquals(response.status, 200);
            const text = await response.text();

            assertEquals(text, "qwerty");
            return response.headers.get("etag");
        })();
        assert(etag);
        // console.log(etag);
        {
            const url = `http://localhost:${port}/test`;
            const response = await fetch(url, {
                headers: { "if-none-match": etag },
            });
            // console.log(response);
            assert(response.ok === false);
            assertEquals(response.status, 304);
            const text = await response.text();

            assertEquals(text, "");
        }
        // {
        //     const url = `http://localhost:${port}/test`;
        //     const response = await fetch(url, {
        //         headers: { "if-none-match": "W/" + etag },
        //     });
        //     console.log(response);
        //     assertFalse(response.ok);
        //     assertEquals(response.status, 304);
        //     const text = await response.text();

        //     assertEquals(text, "");
        // }
    } finally {
        controller.abort();
    }
    await p;
});

Deno.test("etag-conditional_get-empty-body", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 50000 + 10000);
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
            // console.log(response);
            assert(response.ok);
            assertEquals(response.status, 200);
            const text = await response.text();

            assertEquals(text, "");
            const etag = response.headers.get("etag");
            assert(etag);
            // console.log(etag);
            {
                const url = `http://localhost:${port}/test`;
                const response = await fetch(url, {
                    headers: { "if-none-match": etag },
                });
                // console.log(response);
                assert(response.ok === false);
                assertEquals(response.status, 304);
                const text = await response.text();

                assertEquals(text, "");
            }
        }
    } finally {
        controller.abort();
    }
    await p;
});
Deno.test("etag-conditional_get-non-empty-body-json", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 50000 + 10000);
    const handler = createHandler([
        logger,
        conditional_get,
        etag_builder,
        () => {
            return {
                body: JSON.stringify(["qwerty", { json: true }]),
                headers: { "content-type": "application/json" },
            };
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const etag = await (async () => {
            const url = `http://localhost:${port}/test`;
            const response = await fetch(url);
            // console.log(response);
            assert(response.ok);
            assertEquals(response.status, 200);
            const json = await response.json();
            const headers = response.headers;
            assert(headers.get("Content-Type")?.startsWith("application/json"));
            assertEquals(json, ["qwerty", { json: true }]);
            return response.headers.get("etag");
        })();
        assert(etag);
        // console.log(etag);
        {
            const url = `http://localhost:${port}/test`;
            const response = await fetch(url, {
                headers: { "if-none-match": etag },
            });
            const headers = response.headers;
            assert(headers.get("Content-Type")?.startsWith("application/json"));
            // console.log(response);
            assert(response.ok === false);
            assertEquals(response.status, 304);
            const text = await response.text();

            assertEquals(text, "");
        }
    } finally {
        controller.abort();
    }
    await p;
});
