import { IncomingMessage } from "node:http";
import { Socket } from "node:net";

export class MockServerRequest extends IncomingMessage {
    #request: Request;
    constructor(socket: Socket, request: Request) {
        super(socket);
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
    }
}
