import { assert, assertEquals, serve } from "../deps.ts";
import {
    conditional_get,
    cors,
    etag_builder,
    json_builder,
    logger,
    stream_etag,
} from "../middleware.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test({
    name: "remote-response-mutable-headers-stream-etag",
    async fn() {
        const headers={"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"}
        const remote_url = "https://www.qq.com/";
        const random_data = String(Math.random());
        const controller = new AbortController();
        const port = Math.floor(Math.random() * 20000 + 30000);
        const handler = createHandler([
            logger,
            cors(),
            json_builder,
            etag_builder,
            conditional_get,
            stream_etag({ sizelimit: 1000 * 1000 }),
            async (ctx, next) => {
                await next();
                ctx.response.headers.set("x-random-data", random_data);
            },
            async () => {
                return await fetch(remote_url, {headers});
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
                assertEquals(
                    random_data,
                    response.headers.get("x-random-data"),
                );
                const content = await (await fetch(remote_url, {headers})).text();

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
