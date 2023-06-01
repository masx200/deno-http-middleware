import { listener, requestListenerToMiddleWare } from "../dist/index.js";

import assert from "node:assert";
import { createServer } from "node:http";
import test from "node:test";

test("requestListenerToMiddleWare", async () => {
    const port = Math.floor(Math.random() * 55535 + 10000);
    const server = createServer(
        listener(
            async (_ctx, next) => {
                try {
                    await next();
                } catch (error) {
                    return new Response(error?.message + "\n" + error?.stack, {
                        status: 500,
                    });
                }
            },
            requestListenerToMiddleWare((req, res) => {
                console.log(req, res);
                res.statusCode = 200;
                // debugger;
                res.end("hello world!");
            }),
        ),
    );
    try {
        await new Promise((res) => {
            server.listen(port, () => {
                console.log("http server listening port:" + port);

                res();
            });
        });
        const res = await fetch("http://127.0.0.1:" + port);
        console.log(res);
        const data = await res.text();
        console.log(data);
        assert.equal(res.status, 200);

        assert.equal(data, "hello world!");
    } catch (e) {
        throw e;
    } finally {
        server.close();
    }
});
