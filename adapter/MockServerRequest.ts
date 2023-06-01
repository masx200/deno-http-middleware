import { PassThrough, Readable } from "node:stream";

import { IncomingHttpHeaders } from "http";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";

export class MockServerRequest extends PassThrough implements IncomingMessage {
    #incomingMessage: IncomingMessage;

    constructor(socket: Socket, request: Request) {
        super();
        this.#incomingMessage = new IncomingMessage(socket);

        this.method = request.method;

        const urlobj = new URL(request.url);
        this.url = request.url.slice(urlobj.origin.length);

        this.headersDistinct = {};

        this.headers = {};

        for (const [key, value] of request.headers) {
            this.headers[key] = value;
            this.headersDistinct[key] = [value];
        }
        if (request.body) {
            //@ts-ignore
            Readable.fromWeb(request.body).pipe(this);
        } else {
            this.end();
        }
    }
    get aborted(): boolean {
        return this.#incomingMessage.aborted;
    }
    get httpVersion(): string {
        return this.#incomingMessage.httpVersion;
    }
    get httpVersionMajor(): number {
        return this.#incomingMessage.httpVersionMajor;
    }
    get httpVersionMinor(): number {
        return this.#incomingMessage.httpVersionMinor;
    }
    get complete(): boolean {
        return this.#incomingMessage.complete;
    }
    get connection(): Socket {
        return this.#incomingMessage.connection;
    }
    get socket(): Socket {
        return this.#incomingMessage.socket;
    }
    get headers(): IncomingHttpHeaders {
        return this.#incomingMessage.headers;
    }
    set headers(value) {
        this.#incomingMessage.headers = value;
    }

    get headersDistinct(): NodeJS.Dict<string[]> {
        return this.#incomingMessage.headersDistinct;
    }
    set headersDistinct(value) {
        this.#incomingMessage.headersDistinct = value;
    }
    get rawHeaders(): string[] {
        return this.#incomingMessage.rawHeaders;
    }
    get trailers(): NodeJS.Dict<string> {
        return this.#incomingMessage.trailers;
    }
    get trailersDistinct(): NodeJS.Dict<string[]> {
        return this.#incomingMessage.trailersDistinct;
    }
    get rawTrailers(): string[] {
        return this.#incomingMessage.rawTrailers;
    }
    setTimeout(msecs: number, callback?: (() => void) | undefined): this {
        //@ts-ignore
        return this.#incomingMessage.setTimeout(msecs, callback);
    }
    get method(): string | undefined {
        return this.#incomingMessage.method;
    }
    set method(value) {
        this.#incomingMessage.method = value;
    }
    get url(): string | undefined {
        return this.#incomingMessage.url;
    }
    set url(value) {
        this.#incomingMessage.url = value;
    }
    get statusCode(): number | undefined {
        return this.#incomingMessage.statusCode;
    }
    get statusMessage(): string | undefined {
        return this.#incomingMessage.statusMessage;
    }
}
