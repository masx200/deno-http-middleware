import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.189.0/testing/asserts.ts";

import { getOriginalOptions } from "../src/getOriginalOptions";
import { getOriginalRequest } from "../src/getOriginalRequest";
import { handler } from "../src/createHandler";
import { serveDir } from "https://deno.land/std@0.190.0/http/file_server.ts";
import { serve_http } from "https://deno.land/x/masx200_deno_serve_https@1.0.6/mod.ts";

Deno.test("deno std serveDir", async () => {
    const port = Math.floor(Math.random() * 55535 + 10000);
    const app = handler(async (ctx, _next) => {
        console.log({
            request: getOriginalRequest(ctx),
            options: getOriginalOptions(ctx),
        });
        return serveDir(new Request(ctx.request.url, ctx.request), {
            fsRoot: ".",
            urlRoot: "",
            showDirListing: true,
            showDotfiles: true,
            showIndex: true,
            enableCors: true,
        });
    });

    const ac = new AbortController();
    const ps = serve_http(app, {
        signal: ac.signal,
        port,
    });
    try {
        const res = await fetch(`http://localhost:${port}/README.md`);
        console.log(res);
        assert(res.ok);
        const text = await res.text();
        assert(text.length);
        console.log(text);
        const file = await Deno.readTextFile("./README.md");
        assertEquals(text, file);
        console.log(Object.fromEntries(res.headers));
    } catch (error) {
        throw error;
    } finally {
        ac.abort();
        await ps;
    }
});
