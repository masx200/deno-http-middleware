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
    const req = new Request(url, { headers, body });
    const options: RequestOptions = {
        url: req.url,
        headers: req.headers,
        method: method,
        body: req.body,
    };
    return options;
}
