import { IncomingMessage, ServerResponse } from "node:http";
import { OutgoingHttpHeader, OutgoingHttpHeaders } from "http";
import { PassThrough, Writable } from "node:stream";

import { Socket } from "net";

export class MockServerResponse extends PassThrough implements ServerResponse {
    #readable: ReadableStream<Uint8Array>;

    #serverResponse: ServerResponse<IncomingMessage>;
    constructor(req: IncomingMessage) {
        super();
        this.#serverResponse = new ServerResponse(req);
        const transform = new TransformStream<Uint8Array>();
        this.#readable = transform.readable;

        this.pipe(Writable.fromWeb(transform.writable));
    }
    statusCode: number;
    statusMessage: string;
    strictContentLength: boolean;
    assignSocket(socket: Socket): void {
        throw new Error("Method not implemented.");
    }
    detachSocket(socket: Socket): void {
        throw new Error("Method not implemented.");
    }
    writeContinue(callback?: (() => void) | undefined): void {
        throw new Error("Method not implemented.");
    }
    writeEarlyHints(
        hints: Record<string, string | string[]>,
        callback?: (() => void) | undefined,
    ): void {
        throw new Error("Method not implemented.");
    }
    writeHead(
        statusCode: number,
        statusMessage?: string | undefined,
        headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined,
    ): this;
    writeHead(
        statusCode: number,
        headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined,
    ): this;
    writeHead(
        statusCode: unknown,
        statusMessage?: unknown,
        headers?: unknown,
    ): this {
        throw new Error("Method not implemented.");
    }
    writeProcessing(): void {
        throw new Error("Method not implemented.");
    }
    req: IncomingMessage;
    chunkedEncoding: boolean;
    shouldKeepAlive: boolean;
    useChunkedEncodingByDefault: boolean;
    sendDate: boolean;
    finished: boolean;
    headersSent: boolean;
    connection: Socket | null;
    socket: Socket | null;
    setTimeout(msecs: number, callback?: (() => void) | undefined): this {
        throw new Error("Method not implemented.");
    }
    setHeader(name: string, value: string | number | readonly string[]): this {
        throw new Error("Method not implemented.");
    }
    appendHeader(name: string, value: string | readonly string[]): this {
        throw new Error("Method not implemented.");
    }
    getHeader(name: string): string | number | string[] | undefined {
        throw new Error("Method not implemented.");
    }
    getHeaders(): OutgoingHttpHeaders {
        throw new Error("Method not implemented.");
    }
    getHeaderNames(): string[] {
        throw new Error("Method not implemented.");
    }
    hasHeader(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    removeHeader(name: string): void {
        throw new Error("Method not implemented.");
    }
    addTrailers(
        headers: OutgoingHttpHeaders | readonly [string, string][],
    ): void {
        throw new Error("Method not implemented.");
    }
    flushHeaders(): void {
        throw new Error("Method not implemented.");
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
