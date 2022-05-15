import { assert, assertEquals, serve } from "../deps.ts";
import {
    conditional_get,
    cors_all_get,
    etag_builder,
    json_builder,
    logger,
    stream_etag,
} from "../middleware.ts";

import { createHandler } from "../src/createHandler.ts";

Deno.test({
    name: "remote-response-mutable-headers-stream-etag",
    async fn() {
        const remote_url = "https://deno.com/deploy";
        const random_data = String(Math.random());
        const controller = new AbortController();
        const port = Math.floor(Math.random() * 20000 + 30000);
        const handler = createHandler([
            logger,
            cors_all_get,
            json_builder,
            etag_builder,
            conditional_get,
            stream_etag({ sizelimit: 1000 * 1000 }),
            async (ctx, next) => {
                await next();
                ctx.response.headers.set("x-random-data", random_data);
            },
            async () => {
                return await fetch(remote_url, {});
            },
        ]);

        const { signal } = controller;
        const p = serve(handler, { signal, port: port });
        try {
            {
                const url = `http://localhost:${port}/test`;
                const response = await fetch(url);
                console.log(response);
                const text = await response.text();
                if (!response.ok) {
                    console.log(text);
                }
                assert(response.ok);
                assertEquals(response.status, 200);
                assertEquals(
                    random_data,
                    response.headers.get("x-random-data"),
                );
                const content = await (await fetch(remote_url)).text();

                assertEquals(text, content);
                const etag = response.headers.get("etag");
                assert(typeof etag === "string");
            }
        } finally {
            controller.abort();
        }
        await p;
    },
});
