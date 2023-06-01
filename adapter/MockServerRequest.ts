import { PassThrough, Readable } from "node:stream";

import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { TransformCallback } from "node:stream";

//@ts-ignore
export class MockServerRequest extends IncomingMessage implements PassThrough {
    #request: Request;

    constructor(socket: Socket, request: Request) {
        super(socket);
        //@ts-ignore
        Object.assign(this, PassThrough.call(this));
        this.#request = request;

        this.method = this.#request.method;

        const urlobj = new URL(request.url);
        this.url = request.url.slice(urlobj.origin.length);

        this.headersDistinct = {};

        for (const [key, value] of request.headers) {
            this.headersDistinct[key] = [value];
        }

        this.headers = {};

        for (const [key, value] of request.headers) {
            this.headers[key] = value;
        }
        if (request.body) {
            //@ts-ignore
            Readable.fromWeb(request.body).pipe(this);
        } else {
            this.end();
        }
    }
    _transform(
        chunk: any,
        encoding: BufferEncoding,
        callback: TransformCallback
    ): void {
        PassThrough.prototype._transform.call(this, chunk, encoding, callback);
    }
    _flush(callback: TransformCallback): void {
        // errored: TypeError: Cannot read properties of undefined (reading 'call')
        // PassThrough.prototype._flush.call(this, callback);

        callback();
    }
    writable: boolean = false;
    writableEnded: boolean = false;
    writableFinished: boolean = false;
    writableHighWaterMark: number = 0;
    writableLength: number = 0;
    writableObjectMode: boolean = false;
    writableCorked: number = 0;
    writableNeedDrain: boolean = false;
    allowHalfOpen: boolean = false;
    _write(
        chunk: any,
        encoding: BufferEncoding,
        callback: (error?: Error | null | undefined) => void
    ): void {
        PassThrough.prototype._write.call(this, chunk, encoding, callback);
    }
    _writev?(
        chunks: { chunk: any; encoding: BufferEncoding }[],
        callback: (error?: Error | null | undefined) => void
    ): void {
        PassThrough.prototype._writev?.call(this, chunks, callback);
    }
    _final(callback: (error?: Error | null | undefined) => void): void {
        PassThrough.prototype._final.call(this, callback);
    }
    write(
        chunk: any,
        encoding?: BufferEncoding | undefined,
        cb?: ((error: Error | null | undefined) => void) | undefined
    ): boolean;
    write(
        chunk: any,
        cb?: ((error: Error | null | undefined) => void) | undefined
    ): boolean;
    write(chunk: unknown, encoding?: unknown, cb?: unknown): boolean {
        //@ts-ignore
        return PassThrough.prototype.write.call(this, chunk, encoding, cb);
    }
    setDefaultEncoding(encoding: BufferEncoding): this {
        //@ts-ignore
        return PassThrough.prototype.setDefaultEncoding.call(this, encoding);
    }
    end(cb?: (() => void) | undefined): this;
    end(chunk: any, cb?: (() => void) | undefined): this;
    end(
        chunk: any,
        encoding?: BufferEncoding | undefined,
        cb?: (() => void) | undefined
    ): this;
    end(chunk?: unknown, encoding?: unknown, cb?: unknown): this {
        //@ts-ignore
        return PassThrough.prototype.end.call(this, chunk, encoding, cb);
    }
    cork(): void {
        PassThrough.prototype.cork.call(this);
    }
    uncork(): void {
        PassThrough.prototype.uncork.call(this);
    }
}
