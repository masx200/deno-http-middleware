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
}) {
    const req = new Request(url, { headers, method, body });
    const options: RequestOptions = {
        url: req.url,
        headers: req.headers,
        method: req.method,
        body: req.body,
    };
    return options;
}
