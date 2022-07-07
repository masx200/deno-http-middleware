import { RequestOptions } from "./Context.ts";

export function request_to_options({
    url,
    headers,
    method,
    body,
}: {
    url: string;
    headers: HeadersInit;
    method: string;
    body: ReadableStream<Uint8Array> | null | undefined;
}): RequestOptions {
    /* Uncaught TypeError: Method is forbidden.
    at validateAndNormalizeMethod (deno:ext/fetch/23_request.js:161:13)
    at new Request (deno:ext/fetch/23_request.js:233:18)
    at <anonymous>:2:1 */
    /* TypeError: Request with GET/HEAD method cannot have body.
    at new Request (deno:ext/fetch/23_request.js:301:15)
    at request_to_options (file:///home/runner/work/deno-http-middleware/deno-http-middleware/src/request_to_options.ts:18:17)
    at Server.<anonymous> (file:///home/runner/work/deno-http-middleware/deno-http-middleware/src/createHandler.ts:40:22)
    at Server.#respond (https://deno.land/std@0.143.0/http/server.ts:298:37)
    at Server.#serveHttp (https://deno.land/std@0.143.0/http/server.ts:340:20) */
    const req = new Request(url, { headers });
    const options: RequestOptions = {
        url: req.url,
        headers: req.headers,
        method: method,
        body: body,
    };
    return options;
}
