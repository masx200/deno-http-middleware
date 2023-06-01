import { IncomingMessage } from "node:http";
import { Socket } from "node:net";

export class MockServerRequest extends IncomingMessage {
    #request: Request;
    constructor(socket: Socket, request: Request) {
        super(socket);
        this.#request = request;
    }
}
