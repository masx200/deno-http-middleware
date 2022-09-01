// deno-lint-ignore-file require-await
import { expect } from "expect";
import { Middleware } from "./Middleware.ts";

import { handler } from "./createHandler.ts";

const { test } = Deno;
test("calls in order", async () => {
    const h1: Middleware = () => new Response("1");
    const h2: Middleware = () => new Response("2");

    const composed = handler(h1, h2);

    const r1 = await (await composed(new Request("http://example.com"))).text();

    expect(r1).toEqual("1");
});

test("calls next", async () => {
    const h1: Middleware = (ctx) => {
        if (ctx.request.url === "http://example.com/1") {
            return new Response("1");
        }
        return ctx.next();
    };

    const h2: Middleware = (ctx) => {
        if (ctx.request.url === "http://example.com/2") {
            return new Response("2");
        }
        return ctx.next();
    };

    const h3: Middleware = (ctx) => {
        if (ctx.request.url === "http://example.com/3") {
            return new Response("3");
        }
        return ctx.next();
    };

    const composed = handler(h1, h2, h3);

    const r1 = await (
        await composed(new Request("http://example.com/1"))
    )?.text();
    expect(r1).toEqual("1");

    const r2 = await (
        await composed(new Request("http://example.com/2"))
    )?.text();
    expect(r2).toEqual("2");

    const r3 = await (
        await composed(new Request("http://example.com/3"))
    )?.text();
    expect(r3).toEqual("3");

    const r4 = await composed(new Request("http://example.com/nope"));

    expect(r4?.status).toEqual(404);
});

test("calls next when nothing is returned", async () => {
    const h1: Middleware = (ctx) => {
        if (ctx.request.url === "http://example.com/1") {
            return new Response("1");
        }
    };

    const h2: Middleware = (ctx) => {
        if (ctx.request.url === "http://example.com/2") {
            return new Response("2");
        }
    };

    const h3: Middleware = (ctx) => {
        if (ctx.request.url === "http://example.com/3") {
            return new Response("3");
        }
    };

    const composed = handler(h1, h2, h3);

    const r1 = await (
        await composed(new Request("http://example.com/1"))
    )?.text();
    expect(r1).toEqual("1");

    const r2 = await (
        await composed(new Request("http://example.com/2"))
    )?.text();
    expect(r2).toEqual("2");

    const r3 = await (
        await composed(new Request("http://example.com/3"))
    )?.text();
    expect(r3).toEqual("3");

    const r4 = await composed(new Request("http://example.com/nope"));
    expect(r4?.status).toEqual(404);
});

test("sets headers in middleware", async () => {
    const middleware: Middleware = async (ctx) => {
        const response = await ctx.next();
        response.headers.set("x-test", "test");
        return response;
    };

    const RequestHandler: Middleware = async () => new Response("test");

    const composed = handler(middleware, RequestHandler);

    const response = await composed(new Request("http://example.com"));

    expect(response?.headers.get("x-test")).toEqual("test");
});

test("runs initial next", async () => {
    const middleware: Middleware = async (ctx) => {
        const response = await ctx.next();
        response.headers.set("x-test", "test");
        return response;
    };

    const composed = handler(middleware);

    const response = await composed(new Request("http://example.com"));

    expect(response?.headers.get("x-test")).toEqual("test");
});

test("flattens RequestHandlers", async () => {
    const h1: Middleware = () => undefined;
    const h2: Middleware = () => new Response("1");

    const composed = handler([h1, h2]);

    const r1 = await (
        await composed(new Request("http://example.com"))
    )?.text();

    expect(r1).toEqual("1");
});

test("installs default error handler", async () => {
    const h1: Middleware = () => {
        throw new Error("1");
    };
    const composed = handler(h1);

    const r = await composed(new Request("http://example.com"));

    expect(r.status).toEqual(500);
});

test("calls handleError", async () => {
    const h1: Middleware = (ctx) => {
        ctx.handleError = (error: any) => new Response(error.message);
    };
    const h2: Middleware = () => {
        throw new Error("1");
    };
    const composed = handler(h1, h2);

    const r = await composed(new Request("http://example.com"));

    expect(r.text()).resolves.toEqual("1");
});