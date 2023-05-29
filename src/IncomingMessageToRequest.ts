import type { IncomingMessage } from "./RequestListener.ts";

export function IncomingMessageToRequest(
    request: IncomingMessage,
): Request {
    const method = request.method ?? "GET";

    const host = request.authority ?? request.headers.host ?? "localhost";
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    const protocol = (true === request.socket["encrypted"])
        ? "https:"
        : "http:";
    const urlobj = new URL(request.url ?? "", "http://localhost");
    urlobj.protocol = protocol;
    urlobj.host = host;
    const url = urlobj.toString();
    const headers = new Headers();
    Object.entries(request.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            for (const v of value) headers.append(key, v);
        } else if (typeof value === "string") {
            headers.set(key, value);
        }
    });
    /* https://deno.land/x/oak@v12.5.0/http_server_node.ts?source */
    let body: ReadableStream<Uint8Array> | null;
    if (method === "GET" || method === "HEAD") {
        body = null;
    } else {
        body = new ReadableStream<Uint8Array>({
            start: (controller) => {
                request.on("data", (chunk: Uint8Array) => {
                    controller.enqueue(chunk);
                });
                request.on("error", (err: Error) => {
                    controller.error(err);
                });
                request.on("end", () => {
                    controller.close();
                });
            },
        });
    }
    return new Request(url, { headers, method, body });
}
