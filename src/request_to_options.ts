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
    body?: ReadableStream<Uint8Array> | null | undefined;
}): RequestOptions {
    /* Uncaught TypeError: Method is forbidden.

  */
    const req = new Request(url, { headers });
    const options: RequestOptions = {
        url: req.url,
        headers: req.headers,
        method: method,
        body: body,
    };
    return options;
}
