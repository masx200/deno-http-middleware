import { IncomingMessage } from "node:http";
import { ServerResponse } from "node:http";

export class MockServerResponse extends ServerResponse {
    #readable: ReadableStream<Uint8Array>;
    #writable: WritableStream<Uint8Array>;
    constructor(req: IncomingMessage) {
        super(req);

        const transform = new TransformStream<Uint8Array>();
        this.#readable = transform.readable;
        this.#writable = transform.writable;
    }

    toResponse(): Response {
        const status = this.statusCode;

        const body = this.#readable;

        const headers = new Headers();

        for (const [key, value] of Object.entries(this.getHeaders())) {
            if (typeof value === "string" || typeof value === "number") {
                headers.set(key, String(value));
            } else if (Array.isArray(value)) {
                for (const v of value) headers.append(key, v);
            }
        }
        return new Response(body, { status, headers });
    }
}
