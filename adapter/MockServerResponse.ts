import { PassThrough, Writable } from "node:stream";

import { IncomingMessage } from "node:http";
import { ServerResponse } from "node:http";
import { TransformCallback } from "stream";

//@ts-ignore
export class MockServerResponse extends ServerResponse implements PassThrough {
    #readable: ReadableStream<Uint8Array>;
    #writable: WritableStream<Uint8Array>;
    constructor(req: IncomingMessage) {
        super(req);
        //@ts-ignore
        Object.assign(this, PassThrough.call(this));
        const transform = new TransformStream<Uint8Array>();
        this.#readable = transform.readable;
        this.#writable = transform.writable;

        this.pipe(Writable.fromWeb(this.#writable));
    }
    //@ts-ignore
    override pipe<T extends Writable>(
        d: T,
        o?: { end?: boolean | undefined } | undefined,
    ): T {
        //@ts-ignore

        return PassThrough.prototype.pipe.call(this, d, o);
    }
    _transform(
        chunk: any,
        encoding: BufferEncoding,
        callback: TransformCallback,
    ): void {
        PassThrough.prototype._transform.call(this, chunk, encoding, callback);
    }
    _flush(callback: TransformCallback): void {
        PassThrough.prototype._flush.call(this, callback);
    }
    allowHalfOpen: boolean = false;
    readableAborted: boolean = false;
    readable: boolean = false;
    readableDidRead: boolean = false;
    readableEncoding: BufferEncoding | null = null;
    readableEnded: boolean = false;
    readableFlowing: boolean | null = false;
    readableHighWaterMark: number = 0;
    readableLength: number = 0;
    readableObjectMode: boolean = false;
    _read(size: number): void {
        PassThrough.prototype._read.call(this, size);
    }
    read(size?: number | undefined) {
        PassThrough.prototype.read.call(this, size);
    }
    setEncoding(encoding: BufferEncoding): this {
        //@ts-ignore
        return PassThrough.prototype.setEncoding.call(this, encoding);
    }
    pause(): this {
        //@ts-ignore
        return PassThrough.prototype.pause.call(this);
    }
    resume(): this {
        //@ts-ignore
        return PassThrough.prototype.resume.call(this);
    }
    isPaused(): boolean {
        return PassThrough.prototype.isPaused.call(this);
    }
    unpipe(destination?: NodeJS.WritableStream | undefined): this {
        //@ts-ignore
        return PassThrough.prototype.unpipe.call(this, destination);
    }
    unshift(chunk: any, encoding?: BufferEncoding | undefined): void {
        PassThrough.prototype.unshift.call(this, chunk, encoding);
    }
    wrap(stream: NodeJS.ReadableStream): this {
        //@ts-ignore
        return PassThrough.prototype.wrap.call(this, stream);
    }
    push(chunk: any, encoding?: BufferEncoding | undefined): boolean {
        return PassThrough.prototype.push.call(this, chunk, encoding);
    }
    [Symbol.asyncIterator](): AsyncIterableIterator<any> {
        return PassThrough.prototype[Symbol.asyncIterator].call(this);
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
