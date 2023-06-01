import { PassThrough, Readable } from "node:stream";

import { IncomingHttpHeaders } from "http";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";

export class MockServerRequest extends PassThrough implements IncomingMessage {
    #request: Request;

    constructor(socket: Socket, request: Request) {
        super();

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
    aborted: boolean;
    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    complete: boolean;
    connection: Socket;
    socket: Socket;
    headers: IncomingHttpHeaders;
    headersDistinct: NodeJS.Dict<string[]>;
    rawHeaders: string[];
    trailers: NodeJS.Dict<string>;
    trailersDistinct: NodeJS.Dict<string[]>;
    rawTrailers: string[];
    setTimeout(msecs: number, callback?: (() => void) | undefined): this {
        throw new Error("Method not implemented.");
    }
    method?: string | undefined;
    url?: string | undefined;
    statusCode?: number | undefined;
    statusMessage?: string | undefined;
}
