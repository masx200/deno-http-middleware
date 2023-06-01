import { listener, requestListenerToMiddleWare } from "../dist/index.js";

import { AccessControlAllowOrigin } from "./AccessControlAllowOrigin.js";
import Koa from "koa";
import assert from "node:assert";
import bodyParser from "body-parser";
import conditional from "koa-conditional-get";
import cors from "@koa/cors";
import { createServer } from "node:http";
import express from "express";
import fse from "fs-extra";
import { headhandler } from "./headhandler.js";
import koaetag from "koa-etag";
import range from "@masx200/koa-range";
import serveIndex from "koa2-serve-index";
import servestatic from "koa-static";
import streametag from "@masx200/koa-stream-etag";
import test from "node:test";

//@ts-ignore

test("koa static file server", async () => {
    const publicpath = ".";
    const app = new Koa();
    app.use(AccessControlAllowOrigin());
    app.use(headhandler());
    app.use(range);
    app.use(cors({}));
    app.use(conditional());

    app.use(streametag({}));
    app.use(koaetag({}));
    const staticmiddle = servestatic(publicpath, {
        hidden: true,
        extensions: ["html"],
    });
    const indexmiddle = serveIndex(publicpath, { hidden: true });
    app.use(staticmiddle);

    app.use(indexmiddle);
    const port = Math.floor(Math.random() * 55535 + 10000);
    const masas = requestListenerToMiddleWare((req, res) => {
        app.callback()(req, res);
    });

    const start = masas[1];
    const stop = masas[2];
    const server = createServer(
        listener(async (_ctx, next) => {
            try {
                await next();
            } catch (error) {
                return new Response(error?.message + "\n" + error?.stack, {
                    status: 500,
                });
            }
        }, masas[0]),
    );
    try {
        await start();
        await new Promise((res) => {
            server.listen(port, () => {
                console.log("http server listening port:" + port);

                res();
            });
        });
        const res = await fetch("http://127.0.0.1:" + port + "/README.md");
        // console.log(res);
        const data = await res.text();
        // console.log(data);
        assert(data.length);
        assert.equal(res.status, 200);

        assert.equal(
            data,
            new TextDecoder().decode(await fse.readFile("./README.md")),
        );
        // console.log(Object.fromEntries(res.headers));
    } catch (e) {
        throw e;
    } finally {
        server.close();
        stop();
    }
});

test("requestListenerToMiddleWare get", async () => {
    const port = Math.floor(Math.random() * 55535 + 10000);

    const [mid, start, stop] = requestListenerToMiddleWare((req, res) => {
        // console.log(req, res);
        res.statusCode = 200;
        // debugger;
        res.end("hello world!");
    });
    const server = createServer(
        listener(async (_ctx, next) => {
            try {
                await next();
            } catch (error) {
                return new Response(error?.message + "\n" + error?.stack, {
                    status: 500,
                });
            }
        }, mid),
    );
    try {
        await start();
        await new Promise((res) => {
            server.listen(port, () => {
                console.log("http server listening port:" + port);

                res();
            });
        });
        const res = await fetch("http://127.0.0.1:" + port);
        // console.log(res);
        const data = await res.text();
        // console.log(data);
        assert.equal(res.status, 200);

        assert.equal(data, "hello world!");
    } catch (e) {
        throw e;
    } finally {
        server.close();
        stop();
    }
});

test("requestListenerToMiddleWare post", async () => {
    const app = express();
    app.use(bodyParser.text({ type: "text/plain" }));
    app.use((req, res) => {
        // debugger;
        // console.log(req, res);
        // console.log(req.read.toString());
        res.end(req.body);
    });

    // console.log(app);
    // debugger;
    const port = Math.floor(Math.random() * 55535 + 10000);

    const [mid, start, stop] = requestListenerToMiddleWare((req, res) => {
        // console.log(req, res);
        // debugger;
        // console.log(req.read.toString());
        app(req, res);
    });
    const server = createServer(
        listener(async (_ctx, next) => {
            try {
                await next();
            } catch (error) {
                return new Response(error?.message + "\n" + error?.stack, {
                    status: 500,
                });
            }
        }, mid),
    );
    try {
        await new Promise((res) => {
            server.listen(port, () => {
                console.log("http server listening port:" + port);

                res();
            });
        });
        await start();
        const res = await fetch("http://127.0.0.1:" + port, {
            method: "POST",
            body: "hello world!",
            headers: { "content-type": "text/plain" },
        });
        // console.log(res);
        const data = await res.text();
        // console.log(data);
        assert.equal(res.status, 200);

        assert.equal(data, "hello world!");
    } catch (e) {
        throw e;
    } finally {
        server.close();
        stop();
    }
});

test("requestListenerToMiddleWare 404", async () => {
    const port = Math.floor(Math.random() * 55535 + 10000);
    const [mid, start, stop] = requestListenerToMiddleWare((req, res) => {
        // console.log(req, res);
        res.statusCode = 404;
        // debugger;
        res.end("not found!");
    });
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
            mid,
            () => ({ status: 200, body: "hello world!" }),
        ),
    );
    try {
        await new Promise((res) => {
            server.listen(port, () => {
                console.log("http server listening port:" + port);

                res();
            });
        });
        await start();
        const res = await fetch("http://127.0.0.1:" + port);
        // console.log(res);
        const data = await res.text();
        // console.log(data);
        assert.equal(res.status, 200);

        assert.equal(data, "hello world!");
    } catch (e) {
        throw e;
    } finally {
        server.close();
        stop();
    }
});
