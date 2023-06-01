import { assert, assertEquals, serve } from "../deps.ts";

import { conditional_get } from "../middleware/conditional_get.ts";
import { createHandler } from "../src/createHandler.ts";
import { logger } from "../middleware/logger.ts";
import { stream_etag } from "../middleware/stream_etag.ts";

Deno.test(
    "etag-conditional_get-stream-body-greater-than-sizelimit",
    async () => {
        const filename = new URL("../README.md", import.meta.url);
        const controller = new AbortController();
        const port = Math.floor(Math.random() * 50000 + 10000);
        const handler = createHandler([
            logger,
            conditional_get,
            stream_etag({ sizelimit: 1000 }),
            async () => {
                const body = await Deno.readFile(filename);
                return new Response(body);
                // const file = await Deno.open(filename, { read: true });
                // console.log(file);
                // const body = file.readable;
                // return { body: body };
            },
        ]);

        const { signal } = controller;
        const p = serve(handler, { signal, port: port });
        try {
            {
                const url = `http://localhost:${port}/test`;
                const response = await fetch(url);
                // console.log(response);
                const text = await response.text();
                // if (!response.ok) {
                //     // console.log(text);
                // }
                assert(response.ok);
                assertEquals(response.status, 200);

                const content = await Deno.readTextFile(filename);
                assertEquals(text, content);
                const etag = response.headers.get("etag");
                assert(typeof etag !== "string");
            }
        } finally {
            controller.abort();
        }
        await p;
    },
);

Deno.test(
    "etag-conditional_get-stream-body-smaller-than-sizelimit",
    async () => {
        const filename = new URL("../README.md", import.meta.url);
        const controller = new AbortController();
        const port = Math.floor(Math.random() * 45535 + 20000);
        const handler = createHandler([
            logger,
            conditional_get,
            stream_etag({ sizelimit: 1000 * 1000 }),
            async () => {
                // const info = await Deno.stat(filename);
                // const file = await Deno.open(filename, { read: true });
                // console.log(file);
                // const body = file.readable;
                // return new Response(body, {
                //     headers: { "content-length": String(info.size) },
                // });
                const body = await Deno.readFile(filename);
                return new Response(body);
            },
        ]);

        const { signal } = controller;
        const p = serve(handler, { signal, port: port });
        try {
            {
                const url = `http://localhost:${port}/test`;
                const response = await fetch(url);
                // console.log(response);
                const text = await response.text();
                // if (!response.ok) {
                //     console.log(text);
                // }
                assert(response.ok);
                assertEquals(response.status, 200);

                const content = await Deno.readTextFile(filename);
                assertEquals(text, content);
                const etag = response.headers.get("etag");
                assert(etag);
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
    },
);

Deno.test(
    "etag-stream-body-smaller-than-sizelimit-should not cause the response stream to hang",
    async () => {
        const controller = new AbortController();
        const port = Math.floor(Math.random() * 50000 + 10000);
        const handler = createHandler([
            logger,

            stream_etag({ sizelimit: 100000000 }),
            () => {
                const body = "X".repeat(5000000);
                return new Response(body);
            },
        ]);

        const { signal } = controller;
        const p = serve(handler, { signal, port: port });
        try {
            {
                const url = `http://localhost:${port}/test`;
                const response = await fetch(url);
                // console.log(response);
                const text = await response.text();
                // if (!response.ok) {
                //     console.log(text);
                // }
                assert(response.ok);
                assertEquals(response.status, 200);
                const content = "X".repeat(5000000);
                assertEquals(text, content);
                const etag = response.headers.get("etag");
                assert(etag);
            }
        } finally {
            controller.abort();
        }
        await p;
    },
);
