import { IncomingMessage, ServerResponse } from "node:http";
import { OutgoingHttpHeader, OutgoingHttpHeaders } from "node:http";
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
        //@ts-ignore
        this.pipe(Writable.fromWeb(transform.writable));
    }
    get statusCode(): number {
        return this.#serverResponse.statusCode;
    }
    set statusCode(value) {
        this.#serverResponse.statusCode = value;
    }

    public get statusMessage(): string {
        return this.#serverResponse.statusMessage;
    }
    public set statusMessage(value: string) {
        this.#serverResponse.statusMessage = value;
    }

    public get strictContentLength(): boolean {
        //@ts-ignore
        return this.#serverResponse.strictContentLength;
    }
    public set strictContentLength(value: boolean) {
        //@ts-ignore
        this.#serverResponse.strictContentLength = value;
    }
    assignSocket(socket: Socket): void {
        return this.#serverResponse.assignSocket(socket);
    }
    detachSocket(socket: Socket): void {
        return this.#serverResponse.detachSocket(socket);
    }
    writeContinue(callback?: (() => void) | undefined): void {
        return this.#serverResponse.writeContinue(callback);
    }
    writeEarlyHints(
        hints: Record<string, string | string[]>,
        callback?: (() => void) | undefined,
    ): void {
        return this.#serverResponse.writeEarlyHints(hints, callback);
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
        //@ts-ignore
        this.#serverResponse.writeHead(statusCode, statusMessage, headers);
        return this;
    }
    writeProcessing(): void {
        return this.#serverResponse.writeProcessing();
    }

    public get req(): IncomingMessage {
        return this.#serverResponse.req;
    }

    public get chunkedEncoding(): boolean {
        return this.#serverResponse.chunkedEncoding;
    }
    public set chunkedEncoding(value: boolean) {
        this.#serverResponse.chunkedEncoding = value;
    }

    public get shouldKeepAlive(): boolean {
        return this.#serverResponse.shouldKeepAlive;
    }
    public set shouldKeepAlive(value: boolean) {
        this.#serverResponse.shouldKeepAlive = value;
    }

    public get useChunkedEncodingByDefault(): boolean {
        return this.#serverResponse.useChunkedEncodingByDefault;
    }
    public set useChunkedEncodingByDefault(value: boolean) {
        this.#serverResponse.useChunkedEncodingByDefault = value;
    }

    public get sendDate(): boolean {
        return this.#serverResponse.sendDate;
    }
    public set sendDate(value: boolean) {
        this.#serverResponse.sendDate = value;
    }

    public get finished(): boolean {
        return this.#serverResponse.finished;
    }
    public set finished(value: boolean) {
        this.#serverResponse.finished = value;
    }

    public get headersSent(): boolean {
        return this.#serverResponse.headersSent;
    }

    public get connection(): Socket | null {
        return this.#serverResponse.connection;
    }

    public get socket(): Socket | null {
        return this.#serverResponse.socket;
    }

    setTimeout(msecs: number, callback?: (() => void) | undefined): this {
        this.#serverResponse.setTimeout(msecs, callback);
        return this;
    }
    setHeader(name: string, value: string | number | readonly string[]): this {
        this.#serverResponse.setHeader(name, value);
        return this;
    }
    appendHeader(name: string, value: string | readonly string[]): this {
        //@ts-ignore
        this.#serverResponse.appendHeader(name, value);
        return this;
    }
    getHeader(name: string): string | number | string[] | undefined {
        return this.#serverResponse.getHeader(name);
    }
    getHeaders(): OutgoingHttpHeaders {
        return this.#serverResponse.getHeaders();
    }
    getHeaderNames(): string[] {
        return this.#serverResponse.getHeaderNames();
    }
    hasHeader(name: string): boolean {
        return this.#serverResponse.hasHeader(name);
    }
    removeHeader(name: string): void {
        return this.#serverResponse.removeHeader(name);
    }
    addTrailers(
        headers: OutgoingHttpHeaders | readonly [string, string][],
    ): void {
        this.#serverResponse.addTrailers(headers);
    }
    flushHeaders(): void {
        return this.#serverResponse.flushHeaders();
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
