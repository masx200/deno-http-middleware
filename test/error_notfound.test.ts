import { assertEquals, assertFalse, serve } from "../deps.ts";
import { logger } from "../middleware/logger.ts";
import { createHandler } from "../src/createHandler.ts";

Deno.test("error_handler", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 20000 + 30000);
    const handler = createHandler([
        logger,

        (ctx) => {
            const { pathname } = new URL(ctx.request.url);
            if (pathname === "/error") {
                throw Error("error");
            }
        },
    ]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/error`;
        const response = await fetch(url);
        // console.log(response);
        assertFalse(response.ok);
        assertEquals(response.status, 500);
        const text = await response.text();
        // console.log(text);
        assertEquals(text, "Internal Server Error\nError: error");
    } finally {
        controller.abort();
    }
    await p;
});

Deno.test("notfound-handler", async () => {
    const controller = new AbortController();
    const port = Math.floor(Math.random() * 20000 + 30000);
    const handler = createHandler([logger]);

    const { signal } = controller;
    const p = serve(handler, { signal, port: port });
    try {
        const url = `http://localhost:${port}/notfound`;
        const response = await fetch(url);
        // console.log(response);
        assertFalse(response.ok);
        assertEquals(response.status, 404);
        const text = await response.text();
        // console.log(text);
        assertEquals(text, "Not Found");
    } finally {
        controller.abort();
    }
    await p;
});
