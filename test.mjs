import { getIncomingMessage, json, listener } from "./dist/index.js";

import assert from "assert";
import { createServer } from "http";
import test from "node:test";

test("http get", async () => {
    const server = createServer(
        listener(
            async (_ctx, next) => {
                try {
                    await next();
                } catch (error) {
                    return new Response(error?.message, { status: 500 });
                }
            },
            (ctx, _next) => {
                const socket = getIncomingMessage(ctx).socket;
                const { localAddress, localPort, remoteAddress, remotePort } =
                    socket;

                return json({
                    localAddress,
                    localPort,
                    remoteAddress,
                    remotePort,
                    method: ctx.request.method,
                    url: ctx.request.url,
                    headers: Object.fromEntries(ctx.request.headers),
                });
            }
        )
    );
    try {
        const port = 19000;
        await new Promise((res) => {
            server.listen(port, () => {
                console.log("http server listening port:" + port);

                res();
            });
        });
        const res = await fetch("http://127.0.0.1:" + port);
        console.log(res);
        const data = await res.json();
        console.log(data);
        assert.equal(res.status, 200);
        assert.equal(data.remoteAddress, "::ffff:127.0.0.1");
        assert.equal(data.method, "GET");
        assert.equal(data.url, "http://127.0.0.1:" + port + "/");
    } catch (e) {
        throw e;
    } finally {
        server.close();
    }
});

test("http post", async () => {
    const server = createServer(
        listener(
            async (_ctx, next) => {
                try {
                    await next();
                } catch (error) {
                    return new Response(error?.message, { status: 500 });
                }
            },
            (ctx, _next) => {
                const socket = getIncomingMessage(ctx).socket;
                const { localAddress, localPort, remoteAddress, remotePort } =
                    socket;

                return json({
                    localAddress,
                    localPort,
                    remoteAddress,
                    remotePort,
                    method: ctx.request.method,
                    url: ctx.request.url,
                    headers: Object.fromEntries(ctx.request.headers),
                });
            }
        )
    );
    try {
        const port = 19002;
        await new Promise((res) => {
            server.listen(port, () => {
                console.log("http server listening port:" + port);

                res();
            });
        });
        const res = await fetch("http://127.0.0.1:" + port, { method: "POST" });
        console.log(res);
        const data = await res.json();
        console.log(data);
        assert.equal(res.status, 200);
        assert.equal(data.remoteAddress, "::ffff:127.0.0.1");
        assert.equal(data.method, "POST");
        assert.equal(data.url, "http://127.0.0.1:" + port + "/");
    } catch (e) {
        throw e;
    } finally {
        server.close();
    }
});
